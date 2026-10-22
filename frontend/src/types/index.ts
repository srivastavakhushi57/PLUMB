export type RoleType = 'admin' | 'creator' | 'reviewer';
export type CategoryType = 'tone' | 'terminology' | 'messaging' | 'legal' | 'visual' | 'accessibility' | 'claims';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type SubmissionStatus = 'draft' | 'analysing' | 'findings_ready' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';
export type ChannelType = 'blog' | 'social' | 'email' | 'ad' | 'web' | 'other';
export type ContentType = 'text' | 'image' | 'text+image';
export type ApprovalDecision = 'approved' | 'rejected' | 'changes_requested';
export type FindingStatus = 'open' | 'accepted' | 'dismissed' | 'fixed';

export interface UserProfile {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  role: RoleType;
  is_external: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  role: RoleType;
  user_id: string;
  full_name: string;
  email: string;
  is_external: boolean;
  org_id: string;
}

export interface BrandProfile {
  id: string;
  org_id: string;
  name: string;
  voice_description: string;
  tone_attributes: string[];
  audience: string;
  do_list: string[];
  dont_list: string[];
  updated_at: string;
}

export interface GuidelineRule {
  id: string;
  org_id: string;
  category: CategoryType;
  title: string;
  description: string;
  rule_type: 'deterministic' | 'contextual';
  pattern_config: Record<string, any>;
  severity_default: SeverityType;
  is_confidential: boolean;
  active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ApprovedFact {
  id: string;
  org_id: string;
  topic: string;
  statement: string;
  source_name: string;
  source_url?: string;
  valid_from: string;
  valid_until?: string;
  is_confidential: boolean;
  is_expired: boolean;
  created_at: string;
}

export interface BrandAsset {
  id: string;
  org_id: string;
  type: 'logo' | 'color' | 'font' | 'image';
  name: string;
  value_or_path: string;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface SubmissionVersion {
  id: string;
  submission_id: string;
  version_no: number;
  text_content: string;
  image_path?: string;
  created_by: string;
  created_at: string;
  change_note?: string;
}

export interface Submission {
  id: string;
  org_id: string;
  creator_id: string;
  creator_name?: string;
  title: string;
  channel: ChannelType;
  content_type: ContentType;
  status: SubmissionStatus;
  current_version: number;
  created_at: string;
  updated_at: string;
  latest_version?: SubmissionVersion;
  latest_score?: number;
  open_findings_count: number;
}

export interface Finding {
  id: string;
  analysis_run_id: string;
  category: CategoryType;
  severity: SeverityType;
  rule_id?: string;
  fact_id?: string;
  source: 'rule_engine' | 'ai';
  span_start: number;
  span_end: number;
  excerpt: string;
  explanation: string;
  evidence_text: string;
  suggested_fix?: string;
  confidence: 'high' | 'medium' | 'low';
  needs_verification: boolean;
  status: FindingStatus;
  dismissed_reason?: string;
  created_at: string;
  rule_title?: string;
  fact_statement?: string;
}

export interface ScoringBreakdown {
  base_score: number;
  critical_deductions: number;
  high_deductions: number;
  medium_deductions: number;
  low_deductions: number;
  total_deductions: number;
  final_score: number;
  formula_explanation: string;
}

export interface AITransparencyInfo {
  model_used: string;
  rule_engine_version: string;
  grounding_rules_provided: number;
  confidential_rules_excluded: number;
  approved_facts_provided: number;
  disclaimer: string;
}

export interface AnalysisRun {
  id: string;
  submission_version_id: string;
  started_at: string;
  completed_at?: string;
  model_used: string;
  rule_engine_version: string;
  compliance_score: number;
  summary?: string;
  scoring_breakdown: ScoringBreakdown;
  transparency_info?: AITransparencyInfo;
  findings: Finding[];
}

export interface Approval {
  id: string;
  submission_id: string;
  version_no: number;
  reviewer_id: string;
  reviewer_name?: string;
  decision: ApprovalDecision;
  comment: string;
  decided_at: string;
}

export interface AuditLogItem {
  id: string;
  org_id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface AnalyticsData {
  total_submissions: number;
  average_compliance_score: number;
  approval_rate: number;
  rejection_rate: number;
  avg_turnaround_hours: number;
  category_chart: { category: string; violations: number }[];
  channel_chart: { channel: string; count: number }[];
  score_trends: { week: string; score: number }[];
  top_violated_rules: { rule_id: string; title: string; category: string; severity: string; count: number }[];
  unclear_guidelines: { rule_id: string; title: string; dismissal_count: number; diagnosis: string }[];
}

export interface ContrastCheckResult {
  ratio: number;
  normal_text_aa: boolean;
  normal_text_aaa: boolean;
  large_text_aa: boolean;
  large_text_aaa: boolean;
  recommendation: string;
}
