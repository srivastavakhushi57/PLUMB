from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models import (
    Profile,
    Submission,
    SubmissionVersion,
    AnalysisRun,
    Finding,
    GuidelineRule,
    ApprovedFact,
    FindingFeedback,
    AuditLog
)
from backend.app.schemas import (
    AnalysisRunOut,
    FindingOut,
    FindingStatusUpdate,
    FindingFeedbackCreate,
    RewriteResponse
)
from backend.app.auth import get_current_user
from backend.app.ai.pipeline import analysis_pipeline
from backend.app.ai.provider import get_llm_provider

router = APIRouter(prefix="/api/analysis", tags=["Compliance Analysis"])

@router.post("/run/{version_id}", response_model=AnalysisRunOut)
async def run_analysis(
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Executes the complete PLUMB compliance pipeline:
    1. Deterministic Rule Engine
    2. Retrieval of top-k guideline rules and approved facts
    3. LLM structured analysis with server-side span offset calculation
    4. Deduplication and explainable scoring
    """
    res = await db.execute(select(SubmissionVersion).where(SubmissionVersion.id == version_id))
    version = res.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Submission version not found")

    sub_res = await db.execute(select(Submission).where(Submission.id == version.submission_id))
    submission = sub_res.scalars().first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Update status to analysing
    submission.status = "analysing"
    await db.commit()

    try:
        run = await analysis_pipeline.run(
            submission_version=version,
            user=current_user,
            channel=submission.channel,
            db=db
        )
        submission.status = "findings_ready"
        await db.commit()

        # Augment findings
        return await get_analysis_run_details(run.id, db)

    except Exception as e:
        submission.status = "draft"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")

@router.get("/latest/{version_id}", response_model=AnalysisRunOut)
async def get_latest_analysis(
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.submission_version_id == version_id)
        .order_by(desc(AnalysisRun.started_at))
        .limit(1)
    )
    run = res.scalars().first()
    if not run:
        raise HTTPException(status_code=404, detail="No analysis run found for this version")

    return await get_analysis_run_details(run.id, db)

async def get_analysis_run_details(run_id: str, db: AsyncSession) -> AnalysisRunOut:
    run_res = await db.execute(select(AnalysisRun).where(AnalysisRun.id == run_id))
    run = run_res.scalars().first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    f_res = await db.execute(
        select(Finding).where(Finding.analysis_run_id == run.id).order_by(Finding.span_start)
    )
    findings = list(f_res.scalars().all())

    augmented_findings: List[FindingOut] = []
    for f in findings:
        r_title = None
        f_statement = None
        if f.rule_id:
            r_res = await db.execute(select(GuidelineRule).where(GuidelineRule.id == f.rule_id))
            r = r_res.scalars().first()
            if r:
                r_title = r.title
        if f.fact_id:
            fact_res = await db.execute(select(ApprovedFact).where(ApprovedFact.id == f.fact_id))
            fact = fact_res.scalars().first()
            if fact:
                f_statement = fact.statement

        augmented_findings.append(FindingOut(
            id=f.id,
            analysis_run_id=f.analysis_run_id,
            category=f.category,
            severity=f.severity,
            rule_id=f.rule_id,
            fact_id=f.fact_id,
            source=f.source,
            span_start=f.span_start,
            span_end=f.span_end,
            excerpt=f.excerpt,
            explanation=f.explanation,
            evidence_text=f.evidence_text,
            suggested_fix=f.suggested_fix,
            confidence=f.confidence,
            needs_verification=f.needs_verification,
            status=f.status,
            dismissed_reason=f.dismissed_reason,
            created_at=f.created_at,
            rule_title=r_title,
            fact_statement=f_statement
        ))

    sb = run.scoring_breakdown or {}
    scoring_data = sb.get("scoring", {
        "base_score": 100.0,
        "critical_deductions": 0.0,
        "high_deductions": 0.0,
        "medium_deductions": 0.0,
        "low_deductions": 0.0,
        "total_deductions": 0.0,
        "final_score": float(run.compliance_score),
        "formula_explanation": f"Compliance Score: {run.compliance_score}%"
    })
    transparency_data = sb.get("transparency", {
        "model_used": run.model_used,
        "rule_engine_version": run.rule_engine_version,
        "grounding_rules_provided": 0,
        "confidential_rules_excluded": 0,
        "approved_facts_provided": 0,
        "disclaimer": "AI recommendations are not infallible. Final decisions rest with authorised humans."
    })

    return AnalysisRunOut(
        id=run.id,
        submission_version_id=run.submission_version_id,
        started_at=run.started_at,
        completed_at=run.completed_at,
        model_used=run.model_used,
        rule_engine_version=run.rule_engine_version,
        compliance_score=float(run.compliance_score),
        summary=run.summary,
        scoring_breakdown=scoring_data,
        transparency_info=transparency_data,
        findings=augmented_findings
    )

@router.put("/findings/{finding_id}/status")
async def update_finding_status(
    finding_id: str,
    payload: FindingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    f_res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = f_res.scalars().first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.status = payload.status
    if payload.dismissed_reason:
        finding.dismissed_reason = payload.dismissed_reason

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action=f"finding.{payload.status}",
        entity_type="finding",
        entity_id=finding.id,
        metadata_json={"status": payload.status, "reason": payload.dismissed_reason}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(finding)
    return {"message": "Finding status updated", "status": finding.status}

@router.post("/findings/{finding_id}/feedback")
async def submit_finding_feedback(
    finding_id: str,
    payload: FindingFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    f_res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = f_res.scalars().first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    fb = FindingFeedback(
        finding_id=finding.id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(fb)
    await db.commit()
    return {"message": "Feedback submitted successfully", "rating": payload.rating}

@router.post("/apply-all-low-risk/{version_id}")
async def apply_all_low_risk_fixes(
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Batch applies all low-risk, deterministic suggestions into a clean new version,
    leaving complex or high-severity findings for manual human review.
    """
    v_res = await db.execute(select(SubmissionVersion).where(SubmissionVersion.id == version_id))
    ver = v_res.scalars().first()
    if not ver:
        raise HTTPException(status_code=404, detail="Version not found")

    sub_res = await db.execute(select(Submission).where(Submission.id == ver.submission_id))
    sub = sub_res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Get latest run
    r_res = await db.execute(
        select(AnalysisRun).where(AnalysisRun.submission_version_id == ver.id).order_by(desc(AnalysisRun.started_at)).limit(1)
    )
    run = r_res.scalars().first()
    if not run:
        raise HTTPException(status_code=400, detail="Run analysis before applying fixes")

    f_res = await db.execute(
        select(Finding).where(
            Finding.analysis_run_id == run.id,
            Finding.status == "open",
            Finding.severity.in_(["low", "medium"]),
            Finding.suggested_fix != None
        )
    )
    eligible_findings = list(f_res.scalars().all())

    if not eligible_findings:
        return {"message": "No eligible low-risk fixes found", "applied_count": 0}

    # Replace in text
    text = ver.text_content
    applied_count = 0
    # Sort backwards by span_start to avoid offset corruption
    eligible_findings.sort(key=lambda x: x.span_start, reverse=True)
    for f in eligible_findings:
        if f.suggested_fix and f.excerpt in text:
            text = text[:f.span_start] + f.suggested_fix + text[f.span_end:]
            f.status = "fixed"
            applied_count += 1

    # Create new version
    new_version_no = sub.current_version + 1
    new_ver = SubmissionVersion(
        submission_id=sub.id,
        version_no=new_version_no,
        text_content=text,
        image_path=ver.image_path,
        created_by=current_user.id,
        change_note=f"Applied {applied_count} automated low-risk brand compliance fixes"
    )
    db.add(new_ver)
    sub.current_version = new_version_no
    sub.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(new_ver)

    return {
        "message": f"Successfully applied {applied_count} low-risk fixes into Version {new_version_no}",
        "new_version_no": new_version_no,
        "new_version_id": new_ver.id,
        "applied_count": applied_count
    }

@router.post("/rewrite/{version_id}", response_model=RewriteResponse)
async def rewrite_in_brand_voice(
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Returns an AI-suggested full revision in brand voice shown as a diff,
    NEVER silently overwriting the user's content.
    """
    v_res = await db.execute(select(SubmissionVersion).where(SubmissionVersion.id == version_id))
    ver = v_res.scalars().first()
    if not ver:
        raise HTTPException(status_code=404, detail="Version not found")

    provider = get_llm_provider()
    res = await provider.rewrite_in_brand_voice(
        content=ver.text_content,
        brand_profile_context="Brand Voice: Authoritative, composed, technically rigorous, empowering."
    )

    return RewriteResponse(
        original_text=ver.text_content,
        revised_text=res.revised_text,
        rationale=res.rationale,
        changes_made=res.changes_made
    )
