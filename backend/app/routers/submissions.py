import difflib
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.app.database import get_db
from backend.app.models import (
    Profile,
    Submission,
    SubmissionVersion,
    AnalysisRun,
    Finding,
    AuditLog
)
from backend.app.schemas import (
    SubmissionOut,
    SubmissionCreate,
    SubmissionVersionOut,
    SubmissionVersionCreate
)
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/submissions", tags=["Submissions & Versions"])

@router.get("", response_model=List[SubmissionOut])
async def list_submissions(
    channel: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    query = select(Submission).where(Submission.org_id == current_user.org_id)

    # Creators only see their own submissions
    if current_user.role == "creator":
        query = query.where(Submission.creator_id == current_user.id)

    if channel:
        query = query.where(Submission.channel == channel)
    if status_filter:
        query = query.where(Submission.status == status_filter)

    query = query.order_by(desc(Submission.updated_at))
    res = await db.execute(query)
    submissions = list(res.scalars().all())

    results: List[SubmissionOut] = []
    for s in submissions:
        # Fetch creator profile
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
        open_findings = 0
        if latest_v:
            # Latest analysis run
            run_res = await db.execute(
                select(AnalysisRun)
                .where(AnalysisRun.submission_version_id == latest_v.id)
                .order_by(desc(AnalysisRun.started_at))
                .limit(1)
            )
            run = run_res.scalars().first()
            if run:
                latest_score = float(run.compliance_score)
                f_res = await db.execute(
                    select(Finding).where(Finding.analysis_run_id == run.id, Finding.status == "open")
                )
                open_findings = len(list(f_res.scalars().all()))

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
            open_findings_count=open_findings
        ))

    return results

@router.post("", response_model=SubmissionOut)
async def create_submission(
    payload: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    sub = Submission(
        org_id=current_user.org_id,
        creator_id=current_user.id,
        title=payload.title,
        channel=payload.channel,
        content_type=payload.content_type,
        status="draft",
        current_version=1
    )
    db.add(sub)
    await db.flush()

    ver = SubmissionVersion(
        submission_id=sub.id,
        version_no=1,
        text_content=payload.text_content,
        image_path=payload.image_path,
        created_by=current_user.id,
        change_note="Initial version"
    )
    db.add(ver)

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action="submission.created",
        entity_type="submission",
        entity_id=sub.id,
        metadata_json={"title": sub.title, "channel": sub.channel}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(sub)
    await db.refresh(ver)

    return SubmissionOut(
        id=sub.id,
        org_id=sub.org_id,
        creator_id=sub.creator_id,
        creator_name=current_user.full_name,
        title=sub.title,
        channel=sub.channel,
        content_type=sub.content_type,
        status=sub.status,
        current_version=1,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        latest_version=SubmissionVersionOut.from_orm(ver),
        latest_score=None,
        open_findings_count=0
    )

@router.get("/{sub_id}")
async def get_submission(
    sub_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(select(Submission).where(Submission.id == sub_id))
    sub = res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Access check: creators can only view their own
    if current_user.role == "creator" and sub.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch all versions
    v_res = await db.execute(
        select(SubmissionVersion)
        .where(SubmissionVersion.submission_id == sub.id)
        .order_by(desc(SubmissionVersion.version_no))
    )
    versions = list(v_res.scalars().all())

    # Fetch creator
    cr_res = await db.execute(select(Profile).where(Profile.id == sub.creator_id))
    cr = cr_res.scalars().first()

    return {
        "submission": SubmissionOut(
            id=sub.id,
            org_id=sub.org_id,
            creator_id=sub.creator_id,
            creator_name=cr.full_name if cr else "Unknown",
            title=sub.title,
            channel=sub.channel,
            content_type=sub.content_type,
            status=sub.status,
            current_version=sub.current_version,
            created_at=sub.created_at,
            updated_at=sub.updated_at,
            latest_version=SubmissionVersionOut.from_orm(versions[0]) if versions else None,
            latest_score=None,
            open_findings_count=0
        ),
        "versions": [SubmissionVersionOut.from_orm(v) for v in versions]
    }

@router.post("/{sub_id}/versions", response_model=SubmissionVersionOut)
async def create_new_version(
    sub_id: str,
    payload: SubmissionVersionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(select(Submission).where(Submission.id == sub_id))
    sub = res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    new_version_no = sub.current_version + 1
    new_ver = SubmissionVersion(
        submission_id=sub.id,
        version_no=new_version_no,
        text_content=payload.text_content,
        image_path=payload.image_path,
        created_by=current_user.id,
        change_note=payload.change_note or f"Revised in editor (v{new_version_no})"
    )
    db.add(new_ver)

    sub.current_version = new_version_no
    sub.updated_at = datetime.utcnow()
    # Reset status to draft or findings_ready so it can be re-analyzed
    if sub.status in ["changes_requested", "in_review"]:
        sub.status = "draft"

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action="version.created",
        entity_type="submission_version",
        entity_id=new_ver.id,
        metadata_json={"version_no": new_version_no, "submission_id": sub.id}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(new_ver)
    return new_ver

@router.get("/{sub_id}/diff")
async def get_version_diff(
    sub_id: str,
    v_from: int,
    v_to: int,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Computes line and word differences between two submission versions."""
    res_from = await db.execute(
        select(SubmissionVersion).where(
            SubmissionVersion.submission_id == sub_id,
            SubmissionVersion.version_no == v_from
        )
    )
    ver_from = res_from.scalars().first()

    res_to = await db.execute(
        select(SubmissionVersion).where(
            SubmissionVersion.submission_id == sub_id,
            SubmissionVersion.version_no == v_to
        )
    )
    ver_to = res_to.scalars().first()

    if not ver_from or not ver_to:
        raise HTTPException(status_code=404, detail="One or both requested versions not found")

    lines_from = ver_from.text_content.splitlines()
    lines_to = ver_to.text_content.splitlines()

    differ = difflib.Differ()
    diff_lines = list(differ.compare(lines_from, lines_to))

    return {
        "submission_id": sub_id,
        "v_from": v_from,
        "v_to": v_to,
        "text_from": ver_from.text_content,
        "text_to": ver_to.text_content,
        "diff_lines": diff_lines,
        "change_note": ver_to.change_note
    }

@router.post("/{sub_id}/submit-review")
async def submit_for_review(
    sub_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(select(Submission).where(Submission.id == sub_id))
    sub = res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = "in_review"
    sub.updated_at = datetime.utcnow()

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action="submission.submitted_for_review",
        entity_type="submission",
        entity_id=sub.id,
        metadata_json={"title": sub.title, "version": sub.current_version}
    )
    db.add(audit)
    await db.commit()
    return {"message": "Content submitted to compliance review queue", "status": "in_review"}

@router.delete("/{sub_id}")
async def delete_submission(
    sub_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(select(Submission).where(Submission.id == sub_id))
    sub = res.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.role == "creator" and sub.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete other creator's submission")

    await db.delete(sub)
    await db.commit()
    return {"message": "Submission deleted", "id": sub_id}
