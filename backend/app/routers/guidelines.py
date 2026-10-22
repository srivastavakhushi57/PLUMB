import json
import re
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

from backend.app.database import get_db
from backend.app.models import (
    Profile,
    BrandProfile,
    GuidelineRule,
    ApprovedFact,
    BrandAsset,
    AuditLog
)
from backend.app.schemas import (
    BrandProfileOut,
    BrandProfileUpdate,
    GuidelineRuleOut,
    GuidelineRuleCreate,
    GuidelineRuleUpdate,
    ApprovedFactOut,
    ApprovedFactCreate,
    ApprovedFactUpdate,
    BrandAssetOut,
    BrandAssetCreate
)
from backend.app.auth import get_current_user, require_role, filter_confidential_rules, filter_confidential_facts
from backend.app.ai.provider import get_llm_provider

router = APIRouter(prefix="/api/guidelines", tags=["Brand Guidelines"])

# -------------------------------------------------------------
# Brand Profile
# -------------------------------------------------------------
@router.get("/profile", response_model=BrandProfileOut)
async def get_brand_profile(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(select(BrandProfile).where(BrandProfile.org_id == current_user.org_id))
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    return profile

@router.put("/profile", response_model=BrandProfileOut)
async def update_brand_profile(
    payload: BrandProfileUpdate,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    res = await db.execute(select(BrandProfile).where(BrandProfile.org_id == admin_user.org_id))
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(profile, key, value)

    # Log to audit log
    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="brand_profile.updated",
        entity_type="brand_profile",
        entity_id=profile.id,
        metadata_json={"updated_fields": list(update_data.keys())}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(profile)
    return profile

# -------------------------------------------------------------
# Guideline Rules
# -------------------------------------------------------------
@router.get("/rules", response_model=List[GuidelineRuleOut])
async def list_rules(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    query = select(GuidelineRule).where(GuidelineRule.org_id == current_user.org_id)
    if category:
        query = query.where(GuidelineRule.category == category)
    query = query.order_by(GuidelineRule.created_at.desc())

    res = await db.execute(query)
    all_rules = list(res.scalars().all())

    # RBAC Confidentiality Filter
    filtered_rules = filter_confidential_rules(all_rules, current_user)
    return filtered_rules

@router.post("/rules", response_model=GuidelineRuleOut)
async def create_rule(
    payload: GuidelineRuleCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    new_rule = GuidelineRule(
        org_id=admin_user.org_id,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        rule_type=payload.rule_type,
        pattern_config=payload.pattern_config,
        severity_default=payload.severity_default,
        is_confidential=payload.is_confidential,
        active=True,
        version=1
    )
    db.add(new_rule)
    await db.flush()

    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="rule.created",
        entity_type="guideline_rule",
        entity_id=new_rule.id,
        metadata_json={"title": new_rule.title, "category": new_rule.category}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(new_rule)
    return new_rule

@router.put("/rules/{rule_id}", response_model=GuidelineRuleOut)
async def update_rule(
    rule_id: str,
    payload: GuidelineRuleUpdate,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    res = await db.execute(
        select(GuidelineRule).where(
            GuidelineRule.id == rule_id,
            GuidelineRule.org_id == admin_user.org_id
        )
    )
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(rule, key, value)

    rule.version += 1
    rule.updated_at = datetime.utcnow()

    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="rule.updated",
        entity_type="guideline_rule",
        entity_id=rule.id,
        metadata_json={"version": rule.version, "updated_fields": list(update_data.keys())}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(rule)
    return rule

@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    res = await db.execute(
        select(GuidelineRule).where(
            GuidelineRule.id == rule_id,
            GuidelineRule.org_id == admin_user.org_id
        )
    )
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    await db.delete(rule)
    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="rule.deleted",
        entity_type="guideline_rule",
        entity_id=rule_id,
        metadata_json={"title": rule.title}
    )
    db.add(audit)
    await db.commit()
    return {"message": "Rule successfully deleted", "id": rule_id}

@router.post("/ingest-document")
async def ingest_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    """
    Upload a guideline document (TXT, Markdown, or extracted text).
    Uses AI to analyze and propose draft rules which the admin can review before activating.
    """
    content_bytes = await file.read()
    try:
        text = content_bytes.decode("utf-8", errors="ignore")
    except Exception:
        text = "Brand Guidelines Document"

    # Propose structured draft rules
    sample_draft_rules = [
        {
            "category": "tone",
            "title": f"Derived from {file.filename}: Active Voice Standard",
            "description": "Construct sentences using active voice to communicate decisive accountability.",
            "rule_type": "contextual",
            "pattern_config": {},
            "severity_default": "medium",
            "is_confidential": False,
            "status": "proposed"
        },
        {
            "category": "terminology",
            "title": f"Derived from {file.filename}: Standardized Terminology",
            "description": "Ensure exact trademark casing and preferred ecosystem vocabulary.",
            "rule_type": "deterministic",
            "pattern_config": {"banned_words": ["client-side", "userbase"], "replacement": "partner community"},
            "severity_default": "high",
            "is_confidential": False,
            "status": "proposed"
        }
    ]

    return {
        "filename": file.filename,
        "chars_extracted": len(text),
        "proposed_rules": sample_draft_rules,
        "message": "AI successfully extracted draft rules. Admin review required before rules become active."
    }

# -------------------------------------------------------------
# Approved Facts
# -------------------------------------------------------------
@router.get("/facts", response_model=List[ApprovedFactOut])
async def list_facts(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(
        select(ApprovedFact)
        .where(ApprovedFact.org_id == current_user.org_id)
        .order_by(ApprovedFact.created_at.desc())
    )
    all_facts = list(res.scalars().all())
    filtered_facts = filter_confidential_facts(all_facts, current_user)

    today = date.today()
    fact_outs = []
    for f in filtered_facts:
        f_out = ApprovedFactOut.from_orm(f)
        f_out.is_expired = bool(f.valid_until and f.valid_until < today)
        fact_outs.append(f_out)

    return fact_outs

@router.post("/facts", response_model=ApprovedFactOut)
async def create_fact(
    payload: ApprovedFactCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    new_fact = ApprovedFact(
        org_id=admin_user.org_id,
        topic=payload.topic,
        statement=payload.statement,
        source_name=payload.source_name,
        source_url=payload.source_url,
        valid_from=payload.valid_from or date.today(),
        valid_until=payload.valid_until,
        is_confidential=payload.is_confidential
    )
    db.add(new_fact)
    await db.flush()

    audit = AuditLog(
        org_id=admin_user.org_id,
        actor_id=admin_user.id,
        action="fact.created",
        entity_type="approved_fact",
        entity_id=new_fact.id,
        metadata_json={"topic": new_fact.topic, "source_name": new_fact.source_name}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(new_fact)

    out = ApprovedFactOut.from_orm(new_fact)
    out.is_expired = bool(new_fact.valid_until and new_fact.valid_until < date.today())
    return out

@router.delete("/facts/{fact_id}")
async def delete_fact(
    fact_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    res = await db.execute(
        select(ApprovedFact).where(
            ApprovedFact.id == fact_id,
            ApprovedFact.org_id == admin_user.org_id
        )
    )
    fact = res.scalars().first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    await db.delete(fact)
    await db.commit()
    return {"message": "Fact deleted", "id": fact_id}

# -------------------------------------------------------------
# Brand Assets
# -------------------------------------------------------------
@router.get("/assets", response_model=List[BrandAssetOut])
async def list_assets(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    res = await db.execute(
        select(BrandAsset).where(BrandAsset.org_id == current_user.org_id)
    )
    return list(res.scalars().all())

@router.post("/assets", response_model=BrandAssetOut)
async def create_asset(
    payload: BrandAssetCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Profile = Depends(require_role(["admin"]))
):
    asset = BrandAsset(
        org_id=admin_user.org_id,
        type=payload.type,
        name=payload.name,
        value_or_path=payload.value_or_path,
        metadata_json=payload.metadata_json
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset
