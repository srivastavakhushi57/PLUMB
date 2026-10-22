import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.models import (
    SubmissionVersion,
    AnalysisRun,
    Finding,
    GuidelineRule,
    ApprovedFact,
    BrandProfile,
    Profile
)
from backend.app.schemas import ScoringBreakdown, AITransparencyInfo
from backend.app.rule_engine.engine import rule_engine
from backend.app.retrieval.grounding import grounding_retriever
from backend.app.ai.provider import get_llm_provider
from backend.app.auth import filter_confidential_rules, filter_confidential_facts

def locate_span(text: str, excerpt: str) -> Tuple[int, int]:
    """
    Locates exact start and end indices of excerpt in the original text.
    Handles case variations and whitespace normalization fallback.
    """
    if not excerpt:
        return 0, 0

    # 1. Exact match
    idx = text.find(excerpt)
    if idx != -1:
        return idx, idx + len(excerpt)

    # 2. Case-insensitive match
    match = re.search(re.escape(excerpt), text, re.IGNORECASE)
    if match:
        return match.start(), match.end()

    # 3. Normalized whitespace match
    clean_excerpt = re.sub(r'\s+', r'\\s+', re.escape(excerpt.strip()))
    match = re.search(clean_excerpt, text, re.IGNORECASE)
    if match:
        return match.start(), match.end()

    # 4. Fallback: return 0, 0
    return 0, 0

def compute_compliance_score(findings: List[Dict[str, Any]]) -> ScoringBreakdown:
    """Computes an explainable compliance score from findings."""
    crit_count = sum(1 for f in findings if f.get("severity") == "critical")
    high_count = sum(1 for f in findings if f.get("severity") == "high")
    med_count = sum(1 for f in findings if f.get("severity") == "medium")
    low_count = sum(1 for f in findings if f.get("severity") == "low")

    crit_ded = crit_count * 25.0
    high_ded = high_count * 12.0
    med_ded = med_count * 6.0
    low_ded = low_count * 2.0
    total_ded = crit_ded + high_ded + med_ded + low_ded

    final_score = max(0.0, round(100.0 - total_ded, 1))

    explanation = (
        f"Score = 100 - ("
        f"{crit_count} Critical [-{crit_ded:.0f}] + "
        f"{high_count} High [-{high_ded:.0f}] + "
        f"{med_count} Medium [-{med_ded:.0f}] + "
        f"{low_count} Low [-{low_ded:.0f}]) = {final_score:.1f}%"
    )

    return ScoringBreakdown(
        base_score=100.0,
        critical_deductions=crit_ded,
        high_deductions=high_ded,
        medium_deductions=med_ded,
        low_deductions=low_ded,
        total_deductions=total_ded,
        final_score=final_score,
        formula_explanation=explanation
    )

class AnalysisPipeline:
    """Orchestrates end-to-end compliance analysis: rules, retrieval, AI, deduplication, scoring."""

    async def run(
        self,
        submission_version: SubmissionVersion,
        user: Profile,
        channel: str,
        db: AsyncSession
    ) -> AnalysisRun:
        text = submission_version.text_content
        org_id = user.org_id

        # 1. Fetch brand profile
        bp_res = await db.execute(select(BrandProfile).where(BrandProfile.org_id == org_id))
        brand_profile = bp_res.scalars().first()

        # 2. Fetch all active guideline rules & approved facts for org
        r_res = await db.execute(
            select(GuidelineRule).where(GuidelineRule.org_id == org_id, GuidelineRule.active == True)
        )
        all_rules = list(r_res.scalars().all())

        f_res = await db.execute(
            select(ApprovedFact).where(ApprovedFact.org_id == org_id)
        )
        all_facts = list(f_res.scalars().all())

        # RBAC Confidentiality filtering
        active_rules = filter_confidential_rules(all_rules, user)
        active_facts = filter_confidential_facts(all_facts, user)
        confidential_excluded = len(all_rules) - len(active_rules)

        # 3. Deterministic rule engine evaluation
        rule_findings = rule_engine.evaluate(
            text=text,
            channel=channel,
            rules=active_rules,
            approved_facts=active_facts
        )

        # 4. Retrieval: rank top-k relevant rules and facts
        top_rules = [r for r, score in grounding_retriever.retrieve_relevant_rules(text, active_rules, top_k=8)]
        top_facts = [f for f, score in grounding_retriever.retrieve_relevant_facts(text, active_facts, top_k=6)]

        grounding_context = grounding_retriever.format_grounding_context(
            rules=top_rules,
            facts=top_facts,
            brand_profile=brand_profile
        )

        # 5. LLM Analysis
        llm_provider = get_llm_provider()
        ai_output = await llm_provider.analyze_content(
            content=text,
            channel=channel,
            grounding_context=grounding_context
        )

        # 6. Deduplicate & merge findings
        all_candidate_findings: List[Dict[str, Any]] = list(rule_findings)

        # Convert LLM findings with server-side span calculation
        for llm_f in ai_output.findings:
            span_start, span_end = locate_span(text, llm_f.excerpt)
            
            # Avoid duplicate if rule engine already flagged the exact same excerpt and category
            is_dup = any(
                rf["excerpt"].lower() == llm_f.excerpt.lower() and rf["category"] == llm_f.category
                for rf in rule_findings
            )
            if not is_dup:
                all_candidate_findings.append({
                    "category": llm_f.category,
                    "severity": llm_f.severity,
                    "rule_id": llm_f.rule_id if llm_f.rule_id and len(llm_f.rule_id) > 10 else None,
                    "fact_id": llm_f.fact_id if llm_f.fact_id and len(llm_f.fact_id) > 10 else None,
                    "source": "ai",
                    "span_start": span_start,
                    "span_end": span_end,
                    "excerpt": llm_f.excerpt,
                    "explanation": llm_f.explanation,
                    "evidence_text": llm_f.evidence_text,
                    "suggested_fix": llm_f.suggested_fix,
                    "confidence": llm_f.confidence,
                    "needs_verification": llm_f.needs_verification,
                    "status": "open",
                })

        # Sort findings by span_start
        all_candidate_findings.sort(key=lambda x: (x.get("span_start", 0), x.get("severity", "")))

        # 7. Compute scoring
        breakdown = compute_compliance_score(all_candidate_findings)

        # Transparency info
        transparency = {
            "model_used": "Gemini 2.5 Flash" if getattr(llm_provider, "api_key", None) else "Deterministic Mock Engine v1.0",
            "rule_engine_version": "PLUMB-RE-2026.1",
            "grounding_rules_provided": len(top_rules),
            "confidential_rules_excluded": confidential_excluded,
            "approved_facts_provided": len(top_facts),
            "disclaimer": "AI recommendations are not infallible. Final decisions rest with authorised humans."
        }

        # 8. Persist AnalysisRun and Findings
        analysis_run = AnalysisRun(
            submission_version_id=submission_version.id,
            completed_at=datetime.utcnow(),
            model_used=transparency["model_used"],
            rule_engine_version="PLUMB-RE-2026.1",
            compliance_score=breakdown.final_score,
            summary=ai_output.overall_summary,
            scoring_breakdown={
                "scoring": breakdown.dict(),
                "transparency": transparency
            }
        )
        db.add(analysis_run)
        await db.flush()

        for f_data in all_candidate_findings:
            finding = Finding(
                analysis_run_id=analysis_run.id,
                category=f_data["category"],
                severity=f_data["severity"],
                rule_id=f_data.get("rule_id"),
                fact_id=f_data.get("fact_id"),
                source=f_data["source"],
                span_start=f_data["span_start"],
                span_end=f_data["span_end"],
                excerpt=f_data["excerpt"],
                explanation=f_data["explanation"],
                evidence_text=f_data["evidence_text"],
                suggested_fix=f_data.get("suggested_fix"),
                confidence=f_data.get("confidence", "high"),
                needs_verification=f_data.get("needs_verification", False),
                status="open"
            )
            db.add(finding)

        await db.commit()
        await db.refresh(analysis_run)
        return analysis_run

analysis_pipeline = AnalysisPipeline()
