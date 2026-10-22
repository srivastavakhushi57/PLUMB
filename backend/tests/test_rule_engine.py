import pytest
from backend.app.rule_engine.engine import rule_engine, compute_readability_metrics

class MockRule:
    def __init__(self, id, title, category, rule_type, pattern_config, severity_default="medium", active=True):
        self.id = id
        self.title = title
        self.category = category
        self.rule_type = rule_type
        self.pattern_config = pattern_config
        self.severity_default = severity_default
        self.active = active

def test_banned_words_detection():
    rule = MockRule(
        id="r1",
        title="Prohibit Cheap Language",
        category="terminology",
        rule_type="deterministic",
        pattern_config={"banned_words": ["cheap", "bargain"], "replacement": "cost-effective"},
        severity_default="high"
    )
    text = "Our cheap automation solution delivers great results."
    findings = rule_engine.evaluate(text, channel="blog", rules=[rule], approved_facts=[])

    assert len(findings) >= 1
    cheap_finding = next(f for f in findings if f["excerpt"].lower() == "cheap")
    assert cheap_finding["severity"] == "high"
    assert cheap_finding["suggested_fix"] == "cost-effective"
    assert cheap_finding["span_start"] == 4
    assert cheap_finding["span_end"] == 9

def test_preferred_terminology_mapping():
    rule = MockRule(
        id="r2",
        title="Partner Terminology",
        category="terminology",
        rule_type="deterministic",
        pattern_config={"terminology_mappings": {"customers": "partners"}},
        severity_default="medium"
    )
    text = "We serve enterprise customers worldwide."
    findings = rule_engine.evaluate(text, channel="blog", rules=[rule], approved_facts=[])

    assert len(findings) >= 1
    term_finding = next(f for f in findings if f["excerpt"].lower() == "customers")
    assert term_finding["suggested_fix"] == "partners"

def test_unsupported_superlative_detection():
    text = "Aura provides the best robotics platform on the market."
    findings = rule_engine.evaluate(text, channel="blog", rules=[], approved_facts=[])

    claim_finding = next((f for f in findings if "best" in f["excerpt"].lower()), None)
    assert claim_finding is not None
    assert claim_finding["category"] == "claims"
    assert claim_finding["needs_verification"] is True

def test_readability_metrics():
    simple_text = "The dog ran down the hill. It was a sunny day. The sky was blue."
    metrics = compute_readability_metrics(simple_text)
    assert metrics["word_count"] > 10
    assert metrics["sentence_count"] == 3
    assert metrics["flesch_reading_ease"] >= 70.0
