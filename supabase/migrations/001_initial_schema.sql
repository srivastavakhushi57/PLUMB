-- ====================================================================
-- PLUMB: Pre-Publication Brand Governance & Content Compliance Schema
-- Supabase PostgreSQL Migration with Row Level Security (RLS)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (Extends auth.users or standalone demo users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'creator', 'reviewer')),
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Brand Profiles
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    voice_description TEXT NOT NULL,
    tone_attributes JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Empowering", "Direct", "Technically rigorous"]
    audience TEXT NOT NULL,
    do_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    dont_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Guideline Rules
CREATE TABLE IF NOT EXISTS guideline_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('tone', 'terminology', 'messaging', 'legal', 'visual', 'accessibility', 'claims')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('deterministic', 'contextual')),
    pattern_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity_default TEXT NOT NULL CHECK (severity_default IN ('low', 'medium', 'high', 'critical')),
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guideline_rules_org ON guideline_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_guideline_rules_cat ON guideline_rules(category);

-- 5. Approved Facts
CREATE TABLE IF NOT EXISTS approved_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    statement TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approved_facts_org ON approved_facts(org_id);

-- 6. Brand Assets
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('logo', 'color', 'font', 'image')),
    name TEXT NOT NULL,
    value_or_path TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('blog', 'social', 'email', 'ad', 'web', 'other')),
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'text+image')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'analysing', 'findings_ready', 'in_review', 'approved', 'rejected', 'changes_requested')),
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_org ON submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- 8. Submission Versions
CREATE TABLE IF NOT EXISTS submission_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    version_no INT NOT NULL,
    text_content TEXT NOT NULL,
    image_path TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    change_note TEXT,
    CONSTRAINT unique_sub_version UNIQUE (submission_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_versions_submission ON submission_versions(submission_id);

-- 9. Analysis Runs
CREATE TABLE IF NOT EXISTS analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_version_id UUID NOT NULL REFERENCES submission_versions(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    model_used TEXT NOT NULL,
    rule_engine_version TEXT NOT NULL,
    compliance_score NUMERIC(5, 2) NOT NULL,
    summary TEXT,
    scoring_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_runs_version ON analysis_runs(submission_version_id);

-- 10. Findings
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('tone', 'terminology', 'messaging', 'legal', 'visual', 'accessibility', 'claims')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    rule_id UUID REFERENCES guideline_rules(id) ON DELETE SET NULL,
    fact_id UUID REFERENCES approved_facts(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK (source IN ('rule_engine', 'ai')),
    span_start INT NOT NULL DEFAULT 0,
    span_end INT NOT NULL DEFAULT 0,
    excerpt TEXT NOT NULL,
    explanation TEXT NOT NULL,
    evidence_text TEXT NOT NULL,
    suggested_fix TEXT,
    confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
    needs_verification BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'dismissed', 'fixed')),
    dismissed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_findings_run ON findings(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_category ON findings(category);

-- 11. Approvals
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    version_no INT NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
    comment TEXT NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approvals_submission ON approvals(submission_id);

-- 12. Audit Log (Append-Only)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- 13. Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Finding Feedback (for False Positive tracking)
CREATE TABLE IF NOT EXISTS finding_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('helpful', 'wrong', 'misleading')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_feedback ENABLE ROW LEVEL SECURITY;

-- Security helper function: get current profile
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS profiles AS $$
    SELECT * FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Guideline Rules RLS:
-- External creators can ONLY read non-confidential rules in their org
CREATE POLICY "Rules access policy" ON guideline_rules
    FOR SELECT
    USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (
            is_confidential = FALSE
            OR (SELECT is_external FROM profiles WHERE id = auth.uid()) = FALSE
        )
    );

CREATE POLICY "Admin rules write policy" ON guideline_rules
    FOR ALL
    USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Approved Facts RLS:
-- External creators can ONLY read non-confidential facts in their org
CREATE POLICY "Facts access policy" ON approved_facts
    FOR SELECT
    USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (
            is_confidential = FALSE
            OR (SELECT is_external FROM profiles WHERE id = auth.uid()) = FALSE
        )
    );

-- Submissions RLS:
CREATE POLICY "Submissions select policy" ON submissions
    FOR SELECT
    USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (
            creator_id = auth.uid()
            OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('reviewer', 'admin')
        )
    );

CREATE POLICY "Submissions insert policy" ON submissions
    FOR INSERT
    WITH CHECK (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND creator_id = auth.uid()
    );

-- Audit Log RLS (Admins can view org audit logs; no direct delete/update)
CREATE POLICY "Audit select policy" ON audit_log
    FOR SELECT
    USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Audit insert policy" ON audit_log
    FOR INSERT
    WITH CHECK (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );
