import uuid
from datetime import datetime, date
from typing import Optional, List, Any
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Numeric,
    DateTime,
    Date,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profiles = relationship("Profile", back_populates="organization", cascade="all, delete-orphan")
    brand_profile = relationship("BrandProfile", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    guideline_rules = relationship("GuidelineRule", back_populates="organization", cascade="all, delete-orphan")
    approved_facts = relationship("ApprovedFact", back_populates="organization", cascade="all, delete-orphan")
    brand_assets = relationship("BrandAsset", back_populates="organization", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False)  # 'admin', 'creator', 'reviewer'
    is_external = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="profiles")
    submissions = relationship("Submission", back_populates="creator")


class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    voice_description = Column(Text, nullable=False)
    tone_attributes = Column(JSON, default=list, nullable=False)  # List[str]
    audience = Column(Text, nullable=False)
    do_list = Column(JSON, default=list, nullable=False)  # List[str]
    dont_list = Column(JSON, default=list, nullable=False)  # List[str]
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="brand_profile")


class GuidelineRule(Base):
    __tablename__ = "guideline_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # tone, terminology, messaging, legal, visual, accessibility, claims
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    rule_type = Column(String(50), nullable=False)  # deterministic, contextual
    pattern_config = Column(JSON, default=dict, nullable=False)  # regex, banned_words, term_map, min/max, etc.
    severity_default = Column(String(50), nullable=False)  # low, medium, high, critical
    is_confidential = Column(Boolean, default=False, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="guideline_rules")
    findings = relationship("Finding", back_populates="rule")


class ApprovedFact(Base):
    __tablename__ = "approved_facts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    statement = Column(Text, nullable=False)
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=True)
    valid_from = Column(Date, default=date.today, nullable=False)
    valid_until = Column(Date, nullable=True)
    is_confidential = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="approved_facts")
    findings = relationship("Finding", back_populates="fact")


class BrandAsset(Base):
    __tablename__ = "brand_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # logo, color, font, image
    name = Column(String(255), nullable=False)
    value_or_path = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="brand_assets")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    channel = Column(String(50), nullable=False)  # blog, social, email, ad, web, other
    content_type = Column(String(50), nullable=False)  # text, image, text+image
    status = Column(String(50), default="draft", nullable=False, index=True)
    # draft, analysing, findings_ready, in_review, approved, rejected, changes_requested
    current_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="submissions")
    creator = relationship("Profile", back_populates="submissions")
    versions = relationship("SubmissionVersion", back_populates="submission", cascade="all, delete-orphan", order_by="SubmissionVersion.version_no")
    approvals = relationship("Approval", back_populates="submission", cascade="all, delete-orphan")


class SubmissionVersion(Base):
    __tablename__ = "submission_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    version_no = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    image_path = Column(String(500), nullable=True)
    created_by = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    change_note = Column(Text, nullable=True)

    submission = relationship("Submission", back_populates="versions")
    analysis_runs = relationship("AnalysisRun", back_populates="submission_version", cascade="all, delete-orphan")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_version_id = Column(String(36), ForeignKey("submission_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    model_used = Column(String(100), nullable=False)
    rule_engine_version = Column(String(50), nullable=False)
    compliance_score = Column(Numeric(5, 2), nullable=False)
    summary = Column(Text, nullable=True)
    scoring_breakdown = Column(JSON, default=dict, nullable=False)

    submission_version = relationship("SubmissionVersion", back_populates="analysis_runs")
    findings = relationship("Finding", back_populates="analysis_run", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # tone, terminology, messaging, legal, visual, accessibility, claims
    severity = Column(String(50), nullable=False, index=True)  # low, medium, high, critical
    rule_id = Column(String(36), ForeignKey("guideline_rules.id", ondelete="SET NULL"), nullable=True)
    fact_id = Column(String(36), ForeignKey("approved_facts.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(50), nullable=False)  # rule_engine, ai
    span_start = Column(Integer, default=0, nullable=False)
    span_end = Column(Integer, default=0, nullable=False)
    excerpt = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_text = Column(Text, nullable=False)
    suggested_fix = Column(Text, nullable=True)
    confidence = Column(String(50), nullable=False)  # high, medium, low
    needs_verification = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="open", nullable=False)  # open, accepted, dismissed, fixed
    dismissed_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    analysis_run = relationship("AnalysisRun", back_populates="findings")
    rule = relationship("GuidelineRule", back_populates="findings")
    fact = relationship("ApprovedFact", back_populates="findings")
    feedback = relationship("FindingFeedback", back_populates="finding", cascade="all, delete-orphan")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    version_no = Column(Integer, nullable=False)
    reviewer_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    decision = Column(String(50), nullable=False)  # approved, rejected, changes_requested
    comment = Column(Text, nullable=False)
    decided_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("Submission", back_populates="approvals")
    reviewer = relationship("Profile")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., 'rule.create', 'submission.approve', 'finding.dismiss'
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    organization = relationship("Organization", back_populates="audit_logs")
    actor = relationship("Profile")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class FindingFeedback(Base):
    __tablename__ = "finding_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    rating = Column(String(50), nullable=False)  # helpful, wrong, misleading
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    finding = relationship("Finding", back_populates="feedback")
