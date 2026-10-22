import pytest
from backend.app.ai.pipeline import locate_span, compute_compliance_score

def test_exact_span_locator():
    text = "Deploying autonomous robotics systems requires certification."
    excerpt = "autonomous robotics"
    start, end = locate_span(text, excerpt)
    assert text[start:end] == excerpt
    assert start == 10
    assert end == 29

def test_case_insensitive_span_locator():
    text = "WE DELIVER 100% GUARANTEED RESULTS EVERY TIME."
    excerpt = "100% guaranteed"
    start, end = locate_span(text, excerpt)
    assert text[start:end].lower() == excerpt.lower()

def test_scoring_deductions_calculation():
    findings = [
        {"severity": "critical"},
        {"severity": "high"},
        {"severity": "medium"},
        {"severity": "low"},
    ]
    # Critical: -25, High: -12, Medium: -6, Low: -2 = -45
    # Score = 100 - 45 = 55.0
    breakdown = compute_compliance_score(findings)
    assert breakdown.base_score == 100.0
    assert breakdown.critical_deductions == 25.0
    assert breakdown.high_deductions == 12.0
    assert breakdown.medium_deductions == 6.0
    assert breakdown.low_deductions == 2.0
    assert breakdown.total_deductions == 45.0
    assert breakdown.final_score == 55.0
    assert "Score = 100 - (1 Critical" in breakdown.formula_explanation

def test_scoring_floor_at_zero():
    many_critical = [{"severity": "critical"}] * 6  # 6 * 25 = 150 deductions
    breakdown = compute_compliance_score(many_critical)
    assert breakdown.final_score == 0.0
