from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete

from backend.app.database import get_db
from backend.app.models import Profile, AuditLog, Submission
from backend.app.schemas import AuditLogOut
from backend.app.auth import require_role, get_current_user
from backend.app.config import settings

router = APIRouter(prefix="/api/audit", tags=["Audit Log & Privacy"])

@router.get("/logs", response_model=List[AuditLogOut])
async def list_audit_logs(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    query = (
        select(AuditLog)
        .where(AuditLog.org_id == admin_user.org_id)
        .order_by(desc(AuditLog.created_at))
        .limit(limit)
    )
    res = await db.execute(query)
    logs = list(res.scalars().all())

    results: List[AuditLogOut] = []
    for l in logs:
        actor_name = None
        if l.actor_id:
            act_res = await db.execute(select(Profile).where(Profile.id == l.actor_id))
            act = act_res.scalars().first()
            if act:
                actor_name = act.full_name

        results.append(AuditLogOut(
            id=l.id,
            org_id=l.org_id,
            actor_id=l.actor_id,
            actor_name=actor_name,
            action=l.action,
            entity_type=l.entity_type,
            entity_id=l.entity_id,
            metadata_json=l.metadata_json or {},
            created_at=l.created_at
        ))

    return results

@router.post("/purge-retention")
async def purge_retention_data(
    retention_days: int = 90,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    """
    Minimal Data Retention Policy:
    Deletes drafts and unapproved submissions older than retention_days.
    """
    cutoff = datetime.utcnow() - timedelta(days=retention_days)
    del_query = (
        delete(Submission)
        .where(
            Submission.org_id == admin_user.org_id,
            Submission.status.in_(["draft", "rejected"]),
            Submission.updated_at < cutoff
        )
    )
    res = await db.execute(del_query)
    deleted_count = res.rowcount

    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="retention.purged",
        entity_type="system",
        entity_id=admin_user.org_id,
        metadata_json={"retention_days": retention_days, "deleted_submissions": deleted_count}
    )
    db.add(audit)
    await db.commit()

    return {
        "message": f"Successfully purged {deleted_count} expired submissions older than {retention_days} days.",
        "purged_count": deleted_count
    }

@router.post("/delete-my-data")
async def delete_my_data(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Responsible Design Action: Delete all drafts and submissions authored by the current user."""
    del_subs = delete(Submission).where(Submission.creator_id == current_user.id)
    res = await db.execute(del_subs)
    deleted_count = res.rowcount

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action="privacy.self_erasure",
        entity_type="user",
        entity_id=current_user.id,
        metadata_json={"deleted_items": deleted_count}
    )
    db.add(audit)
    await db.commit()

    return {
        "message": f"Your private draft data ({deleted_count} submissions) has been securely wiped.",
        "deleted_count": deleted_count
    }
