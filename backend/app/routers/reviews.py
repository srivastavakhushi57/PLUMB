from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models import (
    Profile,
    Submission,
    SubmissionVersion,
    Approval,
    AuditLog,
    AnalysisRun
)
from backend.app.schemas import (
    ApprovalOut,
    ApprovalCreate,
    SubmissionOut,
    SubmissionVersionOut
)
from backend.app.auth import require_role

router = APIRouter(prefix="/api/reviews", tags=["Review & Approval Workflow"])

@router.get("/queue", response_model=List[SubmissionOut])
async def get_review_queue(
    db: AsyncSession = Depends(get_db),
    reviewer: Profile = Depends(require_role(["reviewer", "admin"]))
):
    """Fetches all submissions currently pending review in the organization."""
    query = (
        select(Submission)
        .where(
            Submission.org_id == reviewer.org_id,
            Submission.status == "in_review"
        )
        .order_by(desc(Submission.updated_at))
    )
    res = await db.execute(query)
    submissions = list(res.scalars().all())

    results: List[SubmissionOut] = []
    for s in submissions:
        # Fetch creator
        cr_res = await db.execute(select(Profile).where(Profile.id == s.creator_id))
        cr = cr_res.scalars().first()

        # Fetch latest version
        v_res = await db.execute(
            select(SubmissionVersion)
            .where(SubmissionVersion.submission_id == s.id)
            .order_by(desc(SubmissionVersion.version_no))
            .limit(1)
        )
        latest_v = v_res.scalars().first()

        latest_score = None
        if latest_v:
            run_res = await db.execute(
                select(AnalysisRun)
                .where(AnalysisRun.submission_version_id == latest_v.id)
                .order_by(desc(AnalysisRun.started_at))
                .limit(1)
            )
            run = run_res.scalars().first()
            if run:
                latest_score = float(run.compliance_score)

        results.append(SubmissionOut(
            id=s.id,
            org_id=s.org_id,
            creator_id=s.creator_id,
            creator_name=cr.full_name if cr else "Unknown",
            title=s.title,
            channel=s.channel,
            content_type=s.content_type,
            status=s.status,
            current_version=s.current_version,
            created_at=s.created_at,
            updated_at=s.updated_at,
            latest_version=SubmissionVersionOut.from_orm(latest_v) if latest_v else None,
            latest_score=latest_score,
            open_findings_count=0
        ))

    return results

@router.post("/{sub_id}/decision", response_model=ApprovalOut)
async def submit_review_decision(
    sub_id: str,
    payload: ApprovalCreate,
    db: AsyncSession = Depends(get_db),
    reviewer: Profile = Depends(require_role(["reviewer", "admin"]))
):
    """
    Submits a final human review decision: 'approved', 'rejected', or 'changes_requested'.
    A mandatory explanation comment is strictly enforced.
    """
    if not payload.comment or len(payload.comment.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="A substantive review comment (at least 5 characters) is required for compliance auditing."
        )

    res = await db.execute(select(Submission).where(Submission.id == sub_id))
    sub = res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    approval = Approval(
        submission_id=sub.id,
        version_no=sub.current_version,
        reviewer_id=reviewer.id,
        decision=payload.decision,
        comment=payload.comment.strip(),
        decided_at=datetime.utcnow()
    )
    db.add(approval)

    # Update submission status
    sub.status = payload.decision
    sub.updated_at = datetime.utcnow()

    # Append to immutable audit log
    audit = AuditLog(
        org_id=reviewer.org_id,
        actor_id=reviewer.id,
        action=f"review.{payload.decision}",
        entity_type="submission",
        entity_id=sub.id,
        metadata_json={
            "decision": payload.decision,
            "comment": payload.comment,
            "version": sub.current_version
        }
    )
    db.add(audit)

    await db.commit()
    await db.refresh(approval)

    return ApprovalOut(
        id=approval.id,
        submission_id=approval.submission_id,
        version_no=approval.version_no,
        reviewer_id=approval.reviewer_id,
        reviewer_name=reviewer.full_name,
        decision=approval.decision,
        comment=approval.comment,
        decided_at=approval.decided_at
    )
