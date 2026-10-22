import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database import AsyncSessionLocal, init_db
from backend.app.models import (
    Organization,
    Profile,
    BrandProfile,
    GuidelineRule,
    ApprovedFact,
    BrandAsset,
    Submission,
    SubmissionVersion,
    AnalysisRun,
    Finding,
    Approval,
    AuditLog
)
from backend.app.auth import hash_password

async def seed_database():
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Organization).limit(1))
        if result.scalars().first():
            print("[Seed] Database already seeded. Skipping.")
            return

        print("[Seed] Seeding database with demo data...")

        # 1. Organization
        org = Organization(name="Aura Robotics Inc.")
        session.add(org)
        await session.flush()

        # 2. Profiles (Admin, Creator, Reviewer, and External Agency)
        admin = Profile(
            org_id=org.id,
            full_name="Alex Mercer (Brand Manager)",
            email="admin@plumb.brand",
            hashed_password=hash_password("admin123"),
            role="admin",
            is_external=False
        )
        creator = Profile(
            org_id=org.id,
            full_name="Jordan Chen (Senior Copywriter)",
            email="creator@plumb.brand",
            hashed_password=hash_password("creator123"),
            role="creator",
            is_external=False
        )
        reviewer = Profile(
            org_id=org.id,
            full_name="Samantha Vance (Compliance Lead)",
            email="reviewer@plumb.brand",
            hashed_password=hash_password("reviewer123"),
            role="reviewer",
            is_external=False
        )
        agency_creator = Profile(
            org_id=org.id,
            full_name="Leo Sterling (Agency Freelancer)",
            email="agency@partner.agency",
            hashed_password=hash_password("agency123"),
            role="creator",
            is_external=True
        )
        session.add_all([admin, creator, reviewer, agency_creator])
        await session.flush()

        # 3. Brand Profile
        brand_profile = BrandProfile(
            org_id=org.id,
            name="Aura Robotics",
            voice_description="Aura speaks with grounded authority, technological precision, and human-centered empowerment. We present facts with scientific rigor, avoid hyperbolic marketing clichés, and treat customers as collaborative partners.",
            tone_attributes=["Authoritative", "Empowering", "Direct", "Technically Rigorous", "Accessible"],
            audience="Enterprise automation leaders, AI engineers, operations directors, and compliance architects.",
            do_list=[
                "Support quantitative claims with empirical data and approved facts",
                "Use active voice and concrete operational outcomes",
                "Address customers as collaborative partners",
                "Maintain composed confidence without artificial urgency gimmicks"
            ],
            dont_list=[
                "Never use unverified superlatives like 'the best' or '#1' without citation",
                "Never use artificial urgency phrasing ('act now', 'hurry', 'limited time')",
                "Never use corporate buzzwords like 'synergistic' or 'bleeding-edge paradigm shift'",
                "Never assert competitive inferiority without verified legal review"
            ]
        )
        session.add(brand_profile)

        # 4. Guideline Rules (18 rules across all categories)
        rules = [
            # Tone
            GuidelineRule(
                org_id=org.id,
                category="tone",
                title="Avoid Artificial Urgency Gimmicks",
                description="Do not use high-pressure urgency tactics ('act now', 'hurry', 'don't miss out'). Aura communicates with calm, composed authority.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["act now", "don't miss out", "hurry", "limited time only"], "replacement": "explore today"},
                severity_default="medium",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="tone",
                title="Avoid Inflated Corporate Jargon",
                description="Replace empty buzzwords ('synergistic', 'paradigm shift', 'utilize bleeding-edge') with clear, direct, and concrete vocabulary.",
                rule_type="contextual",
                pattern_config={"banned_words": ["synergistic", "paradigm shift", "bleeding-edge"], "replacement": "collaborative"},
                severity_default="low",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="tone",
                title="Prohibit ALL-CAPS Text Blocks",
                description="Do not use blocks of capitalised text for emphasis. Maintain professional sentence case or Title Case headings.",
                rule_type="deterministic",
                pattern_config={"regex_pattern": r"\b[A-Z]{4,}(?:\s+[A-Z]{4,}){2,}\b", "message": "ALL-CAPS screaming violates professional brand presentation."},
                severity_default="low",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Terminology
            GuidelineRule(
                org_id=org.id,
                category="terminology",
                title="Preferred Partner Terminology",
                description="We refer to enterprise clients as 'partners' or 'collaborators', rather than transactional terms like 'customers' or 'users'.",
                rule_type="deterministic",
                pattern_config={"terminology_mappings": {"customers": "partners", "users": "members", "clients": "enterprise partners"}},
                severity_default="medium",
                is_confidential=False,
                active=True,
                version=2
            ),
            GuidelineRule(
                org_id=org.id,
                category="terminology",
                title="Avoid Deprecating Cost Language",
                description="Never describe Aura products as 'cheap'. Use 'cost-effective', 'capital-efficient', or 'high-ROI'.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["cheap", "dirt cheap", "bargain-basement"], "replacement": "cost-effective"},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="terminology",
                title="Correct Product Nomenclature",
                description="Always use official product capitalization: 'Aura FleetOS' and 'Aura SentinelBot'. Never 'AuraOS' or 'Sentinel'.",
                rule_type="deterministic",
                pattern_config={"terminology_mappings": {"AuraOS": "Aura FleetOS", "Sentinel": "Aura SentinelBot"}},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Messaging
            GuidelineRule(
                org_id=org.id,
                category="messaging",
                title="Social Channel Length Limit (280 chars)",
                description="Social posts must be concise and under 280 characters to optimize engagement and avoid truncations.",
                rule_type="deterministic",
                pattern_config={"max_length": 280},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="messaging",
                title="Social Hashtag Limit (Max 3)",
                description="Do not clutter social posts with more than 3 hashtags.",
                rule_type="deterministic",
                pattern_config={"max_hashtags": 3},
                severity_default="low",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="messaging",
                title="Clear Value Proposition",
                description="Every campaign must articulate measurable business outcomes (throughput, safety, cycle time) rather than generic tech excitement.",
                rule_type="contextual",
                pattern_config={},
                severity_default="medium",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Legal
            GuidelineRule(
                org_id=org.id,
                category="legal",
                title="Mandatory Autonomous Safety Disclaimer",
                description="Any content discussing autonomous robotics deployment in human-shared industrial zones must include the standard safety advisory.",
                rule_type="deterministic",
                pattern_config={
                    "required_phrases": [{
                        "trigger_keyword": "autonomous",
                        "phrase": "Notice: Operational deployment requires adherence to Aura ISO 10218 safety interlocking protocols."
                    }]
                },
                severity_default="critical",
                is_confidential=False,
                active=True,
                version=3
            ),
            GuidelineRule(
                org_id=org.id,
                category="legal",
                title="Confidential Pricing Governance",
                description="Specific enterprise tier pricing discount percentages and margin formulas are confidential and must not be published externally.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["internal tier discount", "margin formula", "margin discount"]},
                severity_default="critical",
                is_confidential=True,  # Confidential rule! Hidden from external users!
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="legal",
                title="Trademark Attribution Notice",
                description="First mention of proprietary brand technologies (Aura FleetOS™) should include appropriate trademark designation.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["Aura FleetOS without TM"]},
                severity_default="medium",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Claims
            GuidelineRule(
                org_id=org.id,
                category="claims",
                title="Unsupported Superlative Prohibition",
                description="Claims asserting 'the best', '#1', 'world's first', or absolute superiority must be verified against an approved fact or removed.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["the best", "#1", "world's first", "number one"], "replacement": "an industry leader"},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=2
            ),
            GuidelineRule(
                org_id=org.id,
                category="claims",
                title="Absolute Guarantee Claim Prohibition",
                description="Never promise '100% guarantee', 'zero risk', or 'foolproof operation'. Robotics systems operate within certified probabilistic safety thresholds.",
                rule_type="deterministic",
                pattern_config={"banned_words": ["100% guaranteed", "zero risk", "foolproof", "unbreakable guarantee"]},
                severity_default="critical",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="claims",
                title="Empirical Metric Substantiation",
                description="Any quantitative performance statistic (e.g., '42% faster') must cite an approved fact source with valid empirical test documentation.",
                rule_type="contextual",
                pattern_config={},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Visual
            GuidelineRule(
                org_id=org.id,
                category="visual",
                title="Brand Palette Consistency",
                description="Marketing graphics and UI elements must adhere to the official palette: Black #000000, Deep Red #830000, Crimson #BC0202, Bright Red #FF0000.",
                rule_type="deterministic",
                pattern_config={"palette": ["#000000", "#830000", "#BC0202", "#FF0000"]},
                severity_default="medium",
                is_confidential=False,
                active=True,
                version=1
            ),
            # Accessibility
            GuidelineRule(
                org_id=org.id,
                category="accessibility",
                title="WCAG AA Color Contrast Requirement",
                description="Text on surfaces must maintain at least 4.5:1 contrast for normal body text and 3.0:1 for large text.",
                rule_type="deterministic",
                pattern_config={"min_contrast_normal": 4.5, "min_contrast_large": 3.0},
                severity_default="high",
                is_confidential=False,
                active=True,
                version=1
            ),
            GuidelineRule(
                org_id=org.id,
                category="accessibility",
                title="Clear Reading Comprehension Target",
                description="Target reading grade level should not exceed Grade 12 (Flesch-Kincaid <= 12.0) to ensure accessible communication.",
                rule_type="deterministic",
                pattern_config={"max_grade_level": 12.0},
                severity_default="low",
                is_confidential=False,
                active=True,
                version=1
            ),
        ]
        session.add_all(rules)
        await session.flush()

        # 5. Approved Facts (9 facts, including 1 expired and 1 confidential)
        today = date.today()
        facts = [
            ApprovedFact(
                org_id=org.id,
                topic="Inspection Cycle Time Reduction",
                statement="Aura Automation Engine reduces industrial inspection cycle times by 42% based on ISO 9001 certified field benchmarks.",
                source_name="ISO 9001 Field Audit Report 2025",
                source_url="https://aura.internal/benchmarks/iso9001-2025",
                valid_from=date(2024, 1, 1),
                valid_until=today + timedelta(days=500),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Enterprise Deployment Scale",
                statement="Over 850 enterprise facilities worldwide deploy Aura Robotics systems.",
                source_name="Aura Customer Operations Database (Q4 2025)",
                source_url="https://aura.internal/metrics/install-base",
                valid_from=date(2024, 6, 1),
                valid_until=today + timedelta(days=300),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="System Operational Uptime",
                statement="Aura platform maintains 99.99% operational uptime across multi-region edge deployments.",
                source_name="Site Reliability Engineering Annual Report 2025",
                source_url="https://status.aura.internal",
                valid_from=date(2025, 1, 1),
                valid_until=today + timedelta(days=365),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Safety Milestone",
                statement="Our autonomous fleet completed 10 million autonomous operating hours with zero OSHA reportable incidents.",
                source_name="Environmental Health & Safety Audit 2025",
                source_url="https://aura.internal/safety/audit-10m",
                valid_from=date(2024, 1, 1),
                valid_until=today + timedelta(days=200),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Edge TPU Latency",
                statement="Aura computer vision inference models operate at sub-8ms latency on standard edge TPU hardware.",
                source_name="Aura AI Engineering Whitepaper v3.2",
                source_url="https://aura.internal/whitepapers/edge-latency",
                valid_from=date(2025, 1, 1),
                valid_until=today + timedelta(days=400),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Market Analyst Ranking (Outdated)",
                statement="Named Visionary in the 2024 Industrial Robotics Market Report.",
                source_name="Gartner Industrial Robotics Magic Quadrant 2024",
                source_url="https://gartner.com/robotics-2024",
                valid_from=date(2024, 1, 1),
                valid_until=today - timedelta(days=60),  # EXPIRED! Tests outdated fact flagging!
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Energy Efficiency",
                statement="Energy consumption is reduced by 28% compared to traditional hydraulic inspection gantries.",
                source_name="Green Manufacturing Initiative Audit",
                source_url="https://aura.internal/sustainability",
                valid_from=date(2024, 3, 1),
                valid_until=today + timedelta(days=400),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Security & Compliance Certifications",
                statement="SOC 2 Type II certified and ISO/IEC 27001 compliant cloud and telemetry architecture.",
                source_name="Ernst & Young SOC 2 Attestation Report",
                source_url="https://trust.aura.internal",
                valid_from=date(2024, 1, 1),
                valid_until=today + timedelta(days=600),
                is_confidential=False
            ),
            ApprovedFact(
                org_id=org.id,
                topic="Project Horizon Battery Density (Internal Confidential)",
                statement="Next-generation Project Horizon solid-state cells deliver 60% higher volumetric energy density.",
                source_name="Internal R&D Memo #882",
                source_url="https://internal.aura/rd/horizon",
                valid_from=date(2025, 1, 1),
                valid_until=today + timedelta(days=365),
                is_confidential=True  # Confidential fact!
            )
        ]
        session.add_all(facts)
        await session.flush()

        # 6. Brand Assets
        assets = [
            BrandAsset(
                org_id=org.id,
                type="logo",
                name="Aura Shield Primary Emblem",
                value_or_path="/assets/brand/aura-shield-emblem.svg",
                metadata_json={"min_clearance_px": 24, "dark_background_required": True}
            ),
            BrandAsset(
                org_id=org.id,
                type="color",
                name="Brand Crimson",
                value_or_path="#BC0202",
                metadata_json={"cmyk": "10,100,100,10", "pantone": "186 C", "role": "primary-button"}
            ),
            BrandAsset(
                org_id=org.id,
                type="color",
                name="Brand Deep Red",
                value_or_path="#830000",
                metadata_json={"role": "card-border-surface"}
            ),
            BrandAsset(
                org_id=org.id,
                type="font",
                name="Primary Geometric Display Font",
                value_or_path="Space Grotesk / Plus Jakarta Sans",
                metadata_json={"weights": ["600", "700"], "usage": "Headlines and key stats"}
            )
        ]
        session.add_all(assets)
        await session.flush()

        # 7. Submissions at various statuses
        sub1 = Submission(
            org_id=org.id,
            creator_id=creator.id,
            title="Q2 Enterprise Autonomous Robot Teaser",
            channel="social",
            content_type="text",
            status="draft",
            current_version=1
        )
        session.add(sub1)
        await session.flush()

        v1_text = "HURRY! Act now to see why Aura SentinelBot is the best autonomous robot on the market! Over 100% guaranteed results for all cheap warehouse conversions. #Robotics #AI #Tech #Automation #Disruption"
        v1 = SubmissionVersion(
            submission_id=sub1.id,
            version_no=1,
            text_content=v1_text,
            created_by=creator.id,
            change_note="Initial rough social teaser draft"
        )
        session.add(v1)
        await session.flush()

        # Submission 2: Findings Ready (Blog post analyzed with findings)
        sub2 = Submission(
            org_id=org.id,
            creator_id=creator.id,
            title="Transforming Industrial Logistics with Autonomous Fleet Intelligence",
            channel="blog",
            content_type="text",
            status="findings_ready",
            current_version=1
        )
        session.add(sub2)
        await session.flush()

        v2_text = """Today's manufacturing floors require unmatched precision. Traditional facilities suffer from prolonged downtime and clunky legacy gantries. With Aura FleetOS, our customers achieve a 42% inspection cycle time reduction across their facilities.

Act now to experience why we are the best in autonomous guidance. Our revolutionary platform delivers 100% guaranteed safety in all conditions, making other options look cheap. Contact us today to synergize your operations."""

        v2 = SubmissionVersion(
            submission_id=sub2.id,
            version_no=1,
            text_content=v2_text,
            created_by=creator.id,
            change_note="First draft prepared for compliance review"
        )
        session.add(v2)
        await session.flush()

        # Analysis run for Submission 2
        run2 = AnalysisRun(
            submission_version_id=v2.id,
            started_at=datetime.utcnow() - timedelta(minutes=15),
            completed_at=datetime.utcnow() - timedelta(minutes=14),
            model_used="PLUMB Deterministic + Gemini 2.5 Flash",
            rule_engine_version="PLUMB-RE-2026.1",
            compliance_score=41.0,
            summary="Identified 5 critical and high-severity compliance issues including unverified superlatives, prohibited guarantees, and banned terminology.",
            scoring_breakdown={
                "scoring": {
                    "base_score": 100.0,
                    "critical_deductions": 25.0,
                    "high_deductions": 24.0,
                    "medium_deductions": 6.0,
                    "low_deductions": 4.0,
                    "total_deductions": 59.0,
                    "final_score": 41.0,
                    "formula_explanation": "Score = 100 - (1 Critical [-25] + 2 High [-24] + 1 Medium [-6] + 2 Low [-4]) = 41.0%"
                },
                "transparency": {
                    "model_used": "Gemini 2.5 Flash",
                    "grounding_rules_provided": 8,
                    "approved_facts_provided": 6,
                    "disclaimer": "AI recommendations are not infallible. Final decisions rest with authorised humans."
                }
            }
        )
        session.add(run2)
        await session.flush()

        # Findings for Submission 2
        f1 = Finding(
            analysis_run_id=run2.id,
            category="claims",
            severity="critical",
            rule_id=rules[13].id,  # Absolute guarantee rule
            source="rule_engine",
            span_start=v2_text.find("100% guaranteed"),
            span_end=v2_text.find("100% guaranteed") + len("100% guaranteed"),
            excerpt="100% guaranteed",
            explanation="Prohibited absolute guarantee claim. Robotics systems operate under probabilistic safety thresholds certified to ISO 10218.",
            evidence_text="Rule: Absolute Guarantee Claim Prohibition (Critical Policy)",
            suggested_fix="rigorously certified",
            confidence="high",
            needs_verification=False,
            status="open"
        )
        f2 = Finding(
            analysis_run_id=run2.id,
            category="claims",
            severity="high",
            rule_id=rules[12].id,  # Superlative rule
            source="rule_engine",
            span_start=v2_text.find("the best"),
            span_end=v2_text.find("the best") + len("the best"),
            excerpt="the best",
            explanation="Unsubstantiated superlative 'the best'. Policy prohibits superlative rankings unless validated by an external analyst audit.",
            evidence_text="Rule: Unsupported Superlative Prohibition",
            suggested_fix="an industry leader",
            confidence="high",
            needs_verification=True,
            status="open"
        )
        f3 = Finding(
            analysis_run_id=run2.id,
            category="terminology",
            severity="high",
            rule_id=rules[4].id,  # Cheap rule
            source="rule_engine",
            span_start=v2_text.find("cheap"),
            span_end=v2_text.find("cheap") + len("cheap"),
            excerpt="cheap",
            explanation="Contains banned term 'cheap'. Guidelines mandate value-focused terminology.",
            evidence_text="Rule: Avoid Deprecating Cost Language",
            suggested_fix="cost-effective",
            confidence="high",
            needs_verification=False,
            status="open"
        )
        f4 = Finding(
            analysis_run_id=run2.id,
            category="tone",
            severity="medium",
            rule_id=rules[0].id,  # Urgency rule
            source="rule_engine",
            span_start=v2_text.find("Act now"),
            span_end=v2_text.find("Act now") + len("Act now"),
            excerpt="Act now",
            explanation="Artificial urgency tactic 'Act now' contradicts Aura's composed and authoritative tone.",
            evidence_text="Rule: Avoid Artificial Urgency Gimmicks",
            suggested_fix="Connect with our engineering team",
            confidence="high",
            needs_verification=False,
            status="open"
        )
        f5 = Finding(
            analysis_run_id=run2.id,
            category="terminology",
            severity="medium",
            rule_id=rules[3].id,  # Partner terminology
            source="rule_engine",
            span_start=v2_text.find("customers"),
            span_end=v2_text.find("customers") + len("customers"),
            excerpt="customers",
            explanation="Preferred terminology: refer to enterprise clients as 'partners' or 'collaborators'.",
            evidence_text="Rule: Preferred Partner Terminology",
            suggested_fix="partners",
            confidence="high",
            needs_verification=False,
            status="open"
        )
        session.add_all([f1, f2, f3, f4, f5])

        # Submission 3: In Review (Reviewer Queue)
        sub3 = Submission(
            org_id=org.id,
            creator_id=creator.id,
            title="Q3 Operational Breakthroughs: Sub-8ms Inference at Edge Scale",
            channel="blog",
            content_type="text",
            status="in_review",
            current_version=2
        )
        session.add(sub3)
        await session.flush()

        v3_text_v1 = "Our engineers made the best vision model ever with 8ms latency. Act now to deploy Sentinel."
        v3_text_v2 = "Our engineering teams demonstrated sub-8ms computer vision inference latency on standard edge TPU hardware, empowering partners to deploy Aura SentinelBot at scale."

        v3_1 = SubmissionVersion(
            submission_id=sub3.id,
            version_no=1,
            text_content=v3_text_v1,
            created_by=creator.id,
            change_note="Version 1 - flagged by PLUMB"
        )
        v3_2 = SubmissionVersion(
            submission_id=sub3.id,
            version_no=2,
            text_content=v3_text_v2,
            created_by=creator.id,
            change_note="Version 2 - applied PLUMB terminology and metric grounding suggestions"
        )
        session.add_all([v3_1, v3_2])
        await session.flush()

        # Submission 4: Approved
        sub4 = Submission(
            org_id=org.id,
            creator_id=creator.id,
            title="Aura Robotics Uptime & Safety Milestone Bulletin",
            channel="email",
            content_type="text",
            status="approved",
            current_version=2
        )
        session.add(sub4)
        await session.flush()

        v4_text = "We are proud to share that our autonomous fleet completed 10 million autonomous operating hours with zero OSHA reportable incidents, while sustaining 99.99% operational uptime across global partner facilities."
        v4_ver = SubmissionVersion(
            submission_id=sub4.id,
            version_no=2,
            text_content=v4_text,
            created_by=creator.id,
            change_note="Grounded in official EHS and SRE approved fact records"
        )
        session.add(v4_ver)
        await session.flush()

        approval4 = Approval(
            submission_id=sub4.id,
            version_no=2,
            reviewer_id=reviewer.id,
            decision="approved",
            comment="Excellent copy. Grounded cleanly in approved SRE and safety metrics. Approved for publication.",
            decided_at=datetime.utcnow() - timedelta(hours=3)
        )
        session.add(approval4)

        # Submission 5: Changes Requested
        sub5 = Submission(
            org_id=org.id,
            creator_id=agency_creator.id,
            title="Next-Gen Warehouse Autonomous Guidance System Press Release",
            channel="web",
            content_type="text",
            status="changes_requested",
            current_version=1
        )
        session.add(sub5)
        await session.flush()

        v5_text = "Deploy autonomous robots in your facility immediately without risk. Achieve unprecedented production volume."
        v5_ver = SubmissionVersion(
            submission_id=sub5.id,
            version_no=1,
            text_content=v5_text,
            created_by=agency_creator.id,
            change_note="Agency submission v1"
        )
        session.add(v5_ver)
        await session.flush()

        approval5 = Approval(
            submission_id=sub5.id,
            version_no=1,
            reviewer_id=reviewer.id,
            decision="changes_requested",
            comment="Missing mandatory autonomous safety disclosure (ISO 10218). Please add the required disclaimer before re-submitting.",
            decided_at=datetime.utcnow() - timedelta(hours=6)
        )
        session.add(approval5)

        # 8. Audit Log records
        audit_records = [
            AuditLog(
                org_id=org.id,
                actor_id=admin.id,
                action="organization.initialized",
                entity_type="organization",
                entity_id=org.id,
                metadata_json={"org_name": org.name},
                created_at=datetime.utcnow() - timedelta(days=2)
            ),
            AuditLog(
                org_id=org.id,
                actor_id=admin.id,
                action="rule.created",
                entity_type="guideline_rule",
                entity_id=rules[9].id,
                metadata_json={"rule_title": rules[9].title, "severity": "critical"},
                created_at=datetime.utcnow() - timedelta(days=1)
            ),
            AuditLog(
                org_id=org.id,
                actor_id=creator.id,
                action="submission.created",
                entity_type="submission",
                entity_id=sub2.id,
                metadata_json={"title": sub2.title, "channel": sub2.channel},
                created_at=datetime.utcnow() - timedelta(hours=5)
            ),
            AuditLog(
                org_id=org.id,
                actor_id=creator.id,
                action="analysis.completed",
                entity_type="analysis_run",
                entity_id=run2.id,
                metadata_json={"score": 41.0, "findings_count": 5},
                created_at=datetime.utcnow() - timedelta(hours=4)
            ),
            AuditLog(
                org_id=org.id,
                actor_id=reviewer.id,
                action="submission.approved",
                entity_type="submission",
                entity_id=sub4.id,
                metadata_json={"decision": "approved", "comment": approval4.comment},
                created_at=datetime.utcnow() - timedelta(hours=3)
            )
        ]
        session.add_all(audit_records)

        await session.commit()
        print("[Seed] Successfully seeded database with complete demo data!")

if __name__ == "__main__":
    asyncio.run(seed_database())
