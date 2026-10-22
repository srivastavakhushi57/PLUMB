import re
import math
from typing import List, Dict, Any, Tuple, Optional
from datetime import date
from backend.app.schemas import FindingItem, SeverityType, CategoryType

def compute_readability_metrics(text: str) -> Dict[str, Any]:
    """Calculate Flesch-Kincaid grade level and Gunning Fog index."""
    words = re.findall(r'\b[a-zA-Z0-9_\'-]+\b', text)
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]

    word_count = len(words)
    sentence_count = max(len(sentences), 1)

    if word_count == 0:
        return {
            "flesch_reading_ease": 100.0,
            "flesch_kincaid_grade": 0.0,
            "gunning_fog_index": 0.0,
            "word_count": 0,
            "sentence_count": 0,
            "reading_level": "N/A"
        }

    # Count syllables (heuristic)
    def count_syllables(word: str) -> int:
        word = word.lower()
        if len(word) <= 3:
            return 1
        word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
        word = re.sub(r'^y', '', word)
        syllables = len(re.findall(r'[aeiouy]{1,2}', word))
        return max(syllables, 1)

    syllables = [count_syllables(w) for w in words]
    total_syllables = sum(syllables)
    complex_words = sum(1 for s in syllables if s >= 3)

    # Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    asl = word_count / sentence_count
    asw = total_syllables / word_count
    fre = 206.835 - (1.015 * asl) - (84.6 * asw)
    fre = round(max(0.0, min(100.0, fre)), 1)

    # Flesch-Kincaid Grade: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
    fkg = (0.39 * asl) + (11.8 * asw) - 15.59
    fkg = round(max(0.0, fkg), 1)

    # Gunning Fog: 0.4 * ((words / sentences) + 100 * (complex_words / words))
    pcw = (complex_words / word_count) * 100
    fog = 0.4 * (asl + pcw)
    fog = round(max(0.0, fog), 1)

    if fre >= 80:
        level = "Easy to read (6th grade)"
    elif fre >= 60:
        level = "Standard (8th–9th grade)"
    elif fre >= 50:
        level = "Fairly difficult (10th–12th grade)"
    elif fre >= 30:
        level = "Difficult (College)"
    else:
        level = "Very difficult (Academic/Professional)"

    return {
        "flesch_reading_ease": fre,
        "flesch_kincaid_grade": fkg,
        "gunning_fog_index": fog,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "reading_level": level
    }

class DeterministicRuleEngine:
    """
    Executes exact, predictable checks:
    - Banned words / forbidden phrases
    - Preferred terminology mappings
    - Mandatory disclaimers / required phrases
    - Regex patterns
    - Channel limits (max length, hashtag count, emoji count)
    - All-caps screaming & casing rules
    - Unsupported promotional claim patterns (superlatives, absolute guarantees)
    """

    SUPERLATIVE_PATTERNS = [
        (r'\b(?:the\s+)?best\b', 'Unsubstantiated superlative "best"'),
        (r'(?:#1|\b(?:number\s+one|number\s+1|no\.?\s*1)\b)', 'Unverified ranking claim'),
        (r'\b(?:100%\s+guaranteed?|guaranteed\s+results?)\b', 'Absolute guarantee claim'),
        (r'\b(?:clinically\s+proven|scientifically\s+proven)\b', 'Unreferenced medical/scientific proof claim'),
        (r'\b(?:world\'?s?\s+first|industry\s+first)\b', 'Unverified "first" claim'),
        (r'\b(?:never\s+fails?|zero\s+risk|foolproof)\b', 'Absolute efficacy/risk-free claim'),
        (r'\b(?:miracle|revolutionary|magic)\b', 'Hyperbolic buzzword'),
    ]

    def evaluate(
        self,
        text: str,
        channel: str,
        rules: List[Any],
        approved_facts: List[Any],
    ) -> List[Dict[str, Any]]:
        findings: List[Dict[str, Any]] = []

        # 1. Evaluate explicit guideline rules configured in DB
        for rule in rules:
            if not getattr(rule, "active", True):
                continue

            config = getattr(rule, "pattern_config", {}) or {}
            rule_type = getattr(rule, "rule_type", "deterministic")
            # Evaluate if rule is deterministic OR has actionable pattern config
            has_patterns = bool(config.get("banned_words") or config.get("terminology_map") or config.get("regex_pattern") or config.get("required_phrases") or config.get("max_length"))
            if rule_type != "deterministic" and not has_patterns:
                continue

            rule_id = str(getattr(rule, "id", ""))
            rule_title = getattr(rule, "title", "Rule violation")
            severity: SeverityType = getattr(rule, "severity_default", "medium")
            category: CategoryType = getattr(rule, "category", "terminology")

            # Check: Banned words
            banned_words = config.get("banned_words", [])
            for word in banned_words:
                pattern = rf'\b{re.escape(word)}\b'
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    start, end = match.span()
                    excerpt = text[start:end]
                    findings.append({
                        "category": category,
                        "severity": severity,
                        "rule_id": rule_id,
                        "fact_id": None,
                        "source": "rule_engine",
                        "span_start": start,
                        "span_end": end,
                        "excerpt": excerpt,
                        "explanation": f'Contains banned term "{word}". Guideline policy prohibits this wording.',
                        "evidence_text": f'Rule: {rule_title}. Configured banned words list.',
                        "suggested_fix": config.get("replacement", None),
                        "confidence": "high",
                        "needs_verification": False,
                        "status": "open",
                    })

            # Check: Preferred terminology mappings
            term_map = config.get("terminology_mappings", {})
            for avoid_term, prefer_term in term_map.items():
                pattern = rf'\b{re.escape(avoid_term)}\b'
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    start, end = match.span()
                    excerpt = text[start:end]
                    findings.append({
                        "category": category or "terminology",
                        "severity": severity,
                        "rule_id": rule_id,
                        "fact_id": None,
                        "source": "rule_engine",
                        "span_start": start,
                        "span_end": end,
                        "excerpt": excerpt,
                        "explanation": f'Use preferred brand terminology "{prefer_term}" instead of "{avoid_term}".',
                        "evidence_text": f'Rule: {rule_title}. Terminology preference table.',
                        "suggested_fix": prefer_term,
                        "confidence": "high",
                        "needs_verification": False,
                        "status": "open",
                    })

            # Check: Custom Regex Pattern
            custom_regex = config.get("regex_pattern")
            if custom_regex:
                try:
                    # Do not ignore case if pattern contains uppercase character ranges or if case_sensitive is True
                    flags = 0 if ("[A-Z]" in custom_regex or config.get("case_sensitive", False)) else re.IGNORECASE
                    for match in re.finditer(custom_regex, text, flags):
                        start, end = match.span()
                        excerpt = text[start:end]
                        findings.append({
                            "category": category,
                            "severity": severity,
                            "rule_id": rule_id,
                            "fact_id": None,
                            "source": "rule_engine",
                            "span_start": start,
                            "span_end": end,
                            "excerpt": excerpt,
                            "explanation": config.get("message", f'Violates regex pattern constraint in rule "{rule_title}".'),
                            "evidence_text": f'Rule: {rule_title}. Pattern: {custom_regex}',
                            "suggested_fix": config.get("replacement"),
                            "confidence": "high",
                            "needs_verification": False,
                            "status": "open",
                        })
                except re.error:
                    pass

            # Check: Required Phrase or Disclaimer
            required_phrases = config.get("required_phrases", [])
            for req in required_phrases:
                phrase = req.get("phrase", "")
                trigger_keyword = req.get("trigger_keyword", "")
                if trigger_keyword and re.search(rf'\b{re.escape(trigger_keyword)}\b', text, re.IGNORECASE):
                    if not re.search(re.escape(phrase), text, re.IGNORECASE):
                        findings.append({
                            "category": "legal",
                            "severity": severity or "critical",
                            "rule_id": rule_id,
                            "fact_id": None,
                            "source": "rule_engine",
                            "span_start": 0,
                            "span_end": min(len(text), 60),
                            "excerpt": text[:min(len(text), 60)],
                            "explanation": f'Trigger keyword "{trigger_keyword}" requires mandatory disclaimer: "{phrase}".',
                            "evidence_text": f'Rule: {rule_title}. Mandatory legal disclosure requirements.',
                            "suggested_fix": f'{text.strip()}\n\n{phrase}',
                            "confidence": "high",
                            "needs_verification": False,
                            "status": "open",
                        })

            # Check: Channel length constraints
            max_chars = config.get("max_length")
            if max_chars and len(text) > max_chars:
                findings.append({
                    "category": category or "messaging",
                    "severity": severity or "high",
                    "rule_id": rule_id,
                    "fact_id": None,
                    "source": "rule_engine",
                    "span_start": max_chars,
                    "span_end": len(text),
                    "excerpt": text[max_chars:min(len(text), max_chars + 50)] + "...",
                    "explanation": f'Content exceeds maximum allowed length of {max_chars} characters for {channel} channel (current: {len(text)}).',
                    "evidence_text": f'Rule: {rule_title}. Length limitation for channel {channel}.',
                    "suggested_fix": f"Trim {len(text) - max_chars} characters.",
                    "confidence": "high",
                    "needs_verification": False,
                    "status": "open",
                })

        # 2. Check: Unsupported promotional claims (superlatives / guarantees)
        for pattern_str, label in self.SUPERLATIVE_PATTERNS:
            for match in re.finditer(pattern_str, text, re.IGNORECASE):
                start, end = match.span()
                excerpt = text[start:end]

                # Check if this excerpt is grounded in an approved fact
                matched_fact = None
                today = date.today()
                for fact in approved_facts:
                    statement = getattr(fact, "statement", "")
                    valid_until = getattr(fact, "valid_until", None)
                    if excerpt.lower() in statement.lower():
                        if valid_until and valid_until < today:
                            # Outdated fact
                            matched_fact = (fact, True)  # (fact, is_expired)
                        else:
                            matched_fact = (fact, False)
                        break

                if matched_fact is not None:
                    fact_obj, is_expired = matched_fact
                    if is_expired:
                        findings.append({
                            "category": "claims",
                            "severity": "high",
                            "rule_id": None,
                            "fact_id": str(getattr(fact_obj, "id", "")),
                            "source": "rule_engine",
                            "span_start": start,
                            "span_end": end,
                            "excerpt": excerpt,
                            "explanation": f'Claim matches approved fact "{getattr(fact_obj, "topic", "")}", but the fact EXPIRED on {fact_obj.valid_until}. Needs verification with updated data.',
                            "evidence_text": f'Source: {getattr(fact_obj, "source_name", "Fact Database")} (Expired {fact_obj.valid_until})',
                            "suggested_fix": "Verify with up-to-date metrics or remove promotional superlative.",
                            "confidence": "high",
                            "needs_verification": True,
                            "status": "open",
                        })
                else:
                    findings.append({
                        "category": "claims",
                        "severity": "medium",
                        "rule_id": None,
                        "fact_id": None,
                        "source": "rule_engine",
                        "span_start": start,
                        "span_end": end,
                        "excerpt": excerpt,
                        "explanation": f'{label}. Unverified promotional claims require human verification against empirical evidence or approved sources.',
                        "evidence_text": "Core Principle: Unsupported promotional claims must be flagged for verification, never declared false without grounding.",
                        "suggested_fix": "Provide specific metric or soften claim (e.g. 'high-performing' instead of 'best').",
                        "confidence": "high",
                        "needs_verification": True,
                        "status": "open",
                    })

        # 3. Check: ALL-CAPS screaming (consecutive all-caps words)
        screaming_pattern = r'\b([A-Z]{4,}(?:\s+[A-Z]{4,}){2,})\b'
        for match in re.finditer(screaming_pattern, text):
            start, end = match.span()
            excerpt = text[start:end]
            findings.append({
                "category": "tone",
                "severity": "low",
                "rule_id": None,
                "fact_id": None,
                "source": "rule_engine",
                "span_start": start,
                "span_end": end,
                "excerpt": excerpt,
                "explanation": "Avoid ALL-CAPS text blocks. Use sentence case or Title Case for emphasis.",
                "evidence_text": "Brand Voice Guideline: Professional, composed, authoritative tone.",
                "suggested_fix": excerpt.title(),
                "confidence": "high",
                "needs_verification": False,
                "status": "open",
            })

        # 4. Check: Channel-specific hashtag limits (e.g. LinkedIn / Blog shouldn't have > 5 hashtags)
        hashtags = re.findall(r'#[a-zA-Z0-9_]+', text)
        max_hashtags = 3 if channel in ["social", "ad"] else 5
        if len(hashtags) > max_hashtags:
            first_extra = hashtags[max_hashtags]
            pos = text.find(first_extra)
            findings.append({
                "category": "messaging",
                "severity": "low",
                "rule_id": None,
                "fact_id": None,
                "source": "rule_engine",
                "span_start": max(0, pos),
                "span_end": min(len(text), max(0, pos) + len(first_extra)),
                "excerpt": " ".join(hashtags[max_hashtags:]),
                "explanation": f'Exceeded recommended hashtag limit for {channel} channel (found {len(hashtags)}, max recommended is {max_hashtags}).',
                "evidence_text": f'Channel standards for {channel}.',
                "suggested_fix": "Keep only the top 3 most targeted hashtags.",
                "confidence": "high",
                "needs_verification": False,
                "status": "open",
            })

        # 5. Check: Citations of expired or outdated approved facts
        today = date.today()
        for fact in approved_facts:
            valid_until = getattr(fact, "valid_until", None)
            if valid_until and valid_until < today:
                statement = getattr(fact, "statement", "")
                topic = getattr(fact, "topic", "")
                # Check for distinctive phrases (e.g. report name or multi-word segments)
                check_candidates = []
                if topic:
                    clean_t = re.sub(r'\(.*?\)', '', topic).strip()
                    if len(clean_t) >= 6:
                        check_candidates.append(clean_t)
                words = statement.split()
                if len(words) >= 4:
                    for i in range(len(words) - 3):
                        check_candidates.append(" ".join(words[i:i+4]).strip(".,;:\"'"))

                for cand in check_candidates:
                    if cand.lower() in text.lower():
                        match_idx = text.lower().find(cand.lower())
                        cand_len = len(cand)
                        # Check if not already flagged in this span
                        already_flagged = any(f.get("fact_id") == str(getattr(fact, "id", "")) for f in findings)
                        if not already_flagged:
                            findings.append({
                                "category": "claims",
                                "severity": "high",
                                "rule_id": None,
                                "fact_id": str(getattr(fact, "id", "")),
                                "source": "rule_engine",
                                "span_start": match_idx,
                                "span_end": match_idx + cand_len,
                                "excerpt": text[match_idx:match_idx + cand_len],
                                "explanation": f'Claim references approved fact "{topic}", but this fact EXPIRED on {valid_until}. Needs verification with updated data.',
                                "evidence_text": f'Source: {getattr(fact, "source_name", "Fact Database")} (Expired {valid_until})',
                                "suggested_fix": "Verify with up-to-date metrics or update citation.",
                                "confidence": "high",
                                "needs_verification": True,
                                "status": "open",
                            })
                        break

        return findings

rule_engine = DeterministicRuleEngine()
