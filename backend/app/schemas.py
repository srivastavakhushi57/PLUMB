from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# Auth & Profile Schemas
# -------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    email: str
    is_external: bool
    org_id: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RoleSwitchRequest(BaseModel):
    role: Literal["admin", "creator", "reviewer"]
    is_external: bool = False

class ProfileOut(BaseModel):
    id: str
    org_id: str
    full_name: str
    email: str
    role: str
    is_external: bool
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Brand Profile
# -------------------------------------------------------------
class BrandProfileBase(BaseModel):
    name: str
    voice_description: str
    tone_attributes: List[str] = Field(default_factory=list)
    audience: str
    do_list: List[str] = Field(default_factory=list)
    dont_list: List[str] = Field(default_factory=list)

class BrandProfileUpdate(BaseModel):
    name: Optional[str] = None
    voice_description: Optional[str] = None
    tone_attributes: Optional[List[str]] = None
    audience: Optional[str] = None
    do_list: Optional[List[str]] = None
    dont_list: Optional[List[str]] = None

class BrandProfileOut(BrandProfileBase):
    id: str
    org_id: str
    updated_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Guideline Rules
# -------------------------------------------------------------
CategoryType = Literal["tone", "terminology", "messaging", "legal", "visual", "accessibility", "claims"]
SeverityType = Literal["low", "medium", "high", "critical"]
RuleEngineType = Literal["deterministic", "contextual"]

class GuidelineRuleCreate(BaseModel):
    category: CategoryType
    title: str
    description: str
    rule_type: RuleEngineType
    pattern_config: Dict[str, Any] = Field(default_factory=dict)
    severity_default: SeverityType
    is_confidential: bool = False

class GuidelineRuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[RuleEngineType] = None
    pattern_config: Optional[Dict[str, Any]] = None
    severity_default: Optional[SeverityType] = None
    is_confidential: Optional[bool] = None
    active: Optional[bool] = None

class GuidelineRuleOut(BaseModel):
    id: str
    org_id: str
    category: CategoryType
    title: str
    description: str
    rule_type: RuleEngineType
    pattern_config: Dict[str, Any]
    severity_default: SeverityType
    is_confidential: bool
    active: bool
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Approved Facts
# -------------------------------------------------------------
class ApprovedFactCreate(BaseModel):
    topic: str
    statement: str
    source_name: str
    source_url: Optional[str] = None
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    is_confidential: bool = False

class ApprovedFactUpdate(BaseModel):
    topic: Optional[str] = None
    statement: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    is_confidential: Optional[bool] = None

class ApprovedFactOut(BaseModel):
    id: str
    org_id: str
    topic: str
    statement: str
    source_name: str
    source_url: Optional[str] = None
    valid_from: date
    valid_until: Optional[date] = None
    is_confidential: bool
    is_expired: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Brand Assets
# -------------------------------------------------------------
class BrandAssetCreate(BaseModel):
    type: Literal["logo", "color", "font", "image"]
    name: str
    value_or_path: str
    metadata_json: Dict[str, Any] = Field(default_factory=dict)

class BrandAssetOut(BrandAssetCreate):
    id: str
    org_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Submissions & Versions
# -------------------------------------------------------------
ChannelType = Literal["blog", "social", "email", "ad", "web", "other"]
ContentType = Literal["text", "image", "text+image"]
SubmissionStatus = Literal["draft", "analysing", "findings_ready", "in_review", "approved", "rejected", "changes_requested"]

class SubmissionCreate(BaseModel):
    title: str
    channel: ChannelType
    content_type: ContentType = "text"
    text_content: str
    image_path: Optional[str] = None

class SubmissionVersionCreate(BaseModel):
    text_content: str
    image_path: Optional[str] = None
    change_note: Optional[str] = None

class SubmissionVersionOut(BaseModel):
    id: str
    submission_id: str
    version_no: int
    text_content: str
    image_path: Optional[str] = None
    created_by: str
    created_at: datetime
    change_note: Optional[str] = None

    class Config:
        from_attributes = True

class SubmissionOut(BaseModel):
    id: str
    org_id: str
    creator_id: str
    creator_name: Optional[str] = None
    title: str
    channel: ChannelType
    content_type: ContentType
    status: SubmissionStatus
    current_version: int
    created_at: datetime
    updated_at: datetime
    latest_version: Optional[SubmissionVersionOut] = None
    latest_score: Optional[float] = None
    open_findings_count: int = 0

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Findings & Analysis Runs
# -------------------------------------------------------------
FindingConfidence = Literal["high", "medium", "low"]
FindingStatus = Literal["open", "accepted", "dismissed", "fixed"]

class FindingOut(BaseModel):
    id: str
    analysis_run_id: str
    category: CategoryType
    severity: SeverityType
    rule_id: Optional[str] = None
    fact_id: Optional[str] = None
    source: Literal["rule_engine", "ai"]
    span_start: int
    span_end: int
    excerpt: str
    explanation: str
    evidence_text: str
    suggested_fix: Optional[str] = None
    confidence: FindingConfidence
    needs_verification: bool
    status: FindingStatus
    dismissed_reason: Optional[str] = None
    created_at: datetime
    rule_title: Optional[str] = None
    fact_statement: Optional[str] = None

    class Config:
        from_attributes = True

FindingItem = FindingOut

class ScoringBreakdown(BaseModel):
    base_score: float = 100.0
    critical_deductions: float = 0.0
    high_deductions: float = 0.0
    medium_deductions: float = 0.0
    low_deductions: float = 0.0
    total_deductions: float = 0.0
    final_score: float = 100.0
    formula_explanation: str

class AITransparencyInfo(BaseModel):
    model_used: str
    rule_engine_version: str
    grounding_rules_provided: int
    confidential_rules_excluded: int
    approved_facts_provided: int
    disclaimer: str = "AI recommendations are not infallible. Final decisions rest with authorised humans."

class AnalysisRunOut(BaseModel):
    id: str
    submission_version_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    model_used: str
    rule_engine_version: str
    compliance_score: float
    summary: Optional[str] = None
    scoring_breakdown: ScoringBreakdown
    transparency_info: Optional[AITransparencyInfo] = None
    findings: List[FindingOut] = Field(default_factory=list)

    class Config:
        from_attributes = True

class FindingStatusUpdate(BaseModel):
    status: FindingStatus
    dismissed_reason: Optional[str] = None

class FindingFeedbackCreate(BaseModel):
    rating: Literal["helpful", "wrong", "misleading"]
    comment: Optional[str] = None

# -------------------------------------------------------------
# Approvals
# -------------------------------------------------------------
ApprovalDecision = Literal["approved", "rejected", "changes_requested"]

class ApprovalCreate(BaseModel):
    decision: ApprovalDecision
    comment: str

class ApprovalOut(BaseModel):
    id: str
    submission_id: str
    version_no: int
    reviewer_id: str
    reviewer_name: Optional[str] = None
    decision: ApprovalDecision
    comment: str
    decided_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Audit Log & Analytics
# -------------------------------------------------------------
class AuditLogOut(BaseModel):
    id: str
    org_id: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    metadata_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class RewriteResponse(BaseModel):
    original_text: str
    revised_text: str
    rationale: str
    changes_made: List[str]

class ContrastCheckRequest(BaseModel):
    foreground_hex: str
    background_hex: str

class ContrastCheckResponse(BaseModel):
    ratio: float
    normal_text_aa: bool
    normal_text_aaa: bool
    large_text_aa: bool
    large_text_aaa: bool
    recommendation: str

class ReadabilityScore(BaseModel):
    flesch_reading_ease: float
    flesch_kincaid_grade: float
    gunning_fog_index: float
    reading_level: str
    word_count: int
    sentence_count: int
