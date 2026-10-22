import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter

def tokenize(text: str) -> List[str]:
    return re.findall(r'\b[a-zA-Z0-9_\'-]{3,}\b', text.lower())

def compute_similarity(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Compute cosine similarity over token frequency vectors."""
    if not query_tokens or not doc_tokens:
        return 0.0
    vec1 = Counter(query_tokens)
    vec2 = Counter(doc_tokens)
    
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum(vec1[x] * vec2[x] for x in intersection)
    
    sum1 = sum(v ** 2 for v in vec1.values())
    sum2 = sum(v ** 2 for v in vec2.values())
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    return float(numerator) / denominator

class GroundingRetriever:
    """
    Ranks and retrieves top-k relevant guideline rules and approved facts
    for grounded LLM prompt construction.
    """

    def retrieve_relevant_rules(
        self,
        text: str,
        rules: List[Any],
        top_k: int = 8
    ) -> List[Tuple[Any, float]]:
        query_tokens = tokenize(text)
        scored: List[Tuple[Any, float]] = []

        for rule in rules:
            if not getattr(rule, "active", True):
                continue
            title = getattr(rule, "title", "")
            desc = getattr(rule, "description", "")
            cat = getattr(rule, "category", "")
            config = str(getattr(rule, "pattern_config", {}))

            rule_text = f"{title} {desc} {cat} {config}"
            score = compute_similarity(query_tokens, tokenize(rule_text))
            
            # Boost deterministic/high-severity rules slightly so critical policies are always grounded
            if getattr(rule, "severity_default", "") == "critical":
                score += 0.2
            elif getattr(rule, "severity_default", "") == "high":
                score += 0.1

            scored.append((rule, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def retrieve_relevant_facts(
        self,
        text: str,
        facts: List[Any],
        top_k: int = 6
    ) -> List[Tuple[Any, float]]:
        query_tokens = tokenize(text)
        scored: List[Tuple[Any, float]] = []

        for fact in facts:
            topic = getattr(fact, "topic", "")
            stmt = getattr(fact, "statement", "")
            source = getattr(fact, "source_name", "")

            fact_text = f"{topic} {stmt} {source}"
            score = compute_similarity(query_tokens, tokenize(fact_text))
            scored.append((fact, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def format_grounding_context(
        self,
        rules: List[Any],
        facts: List[Any],
        brand_profile: Any = None
    ) -> str:
        lines: List[str] = []

        if brand_profile:
            lines.append("=== BRAND PROFILE ===")
            lines.append(f"Brand Name: {getattr(brand_profile, 'name', 'Brand')}")
            lines.append(f"Voice: {getattr(brand_profile, 'voice_description', '')}")
            lines.append(f"Tone Attributes: {', '.join(getattr(brand_profile, 'tone_attributes', []))}")
            lines.append(f"Audience: {getattr(brand_profile, 'audience', '')}")
            lines.append(f"Dos: {', '.join(getattr(brand_profile, 'do_list', []))}")
            lines.append(f"Don'ts: {', '.join(getattr(brand_profile, 'dont_list', []))}\n")

        lines.append("=== APPROVED GUIDELINE RULES (GROUND TRUTH) ===")
        for r in rules:
            rule_id = str(getattr(r, "id", ""))
            lines.append(
                f"[RULE_ID: {rule_id}] | Category: {getattr(r, 'category', '')} | "
                f"Severity: {getattr(r, 'severity_default', 'medium')} | Title: {getattr(r, 'title', '')}\n"
                f"Description: {getattr(r, 'description', '')}"
            )

        lines.append("\n=== APPROVED FACTS & EMPIRICAL SOURCES (GROUND TRUTH) ===")
        for f in facts:
            fact_id = str(getattr(f, "id", ""))
            v_until = getattr(f, "valid_until", "No expiration")
            lines.append(
                f"[FACT_ID: {fact_id}] | Topic: {getattr(f, 'topic', '')} | Valid Until: {v_until} | "
                f"Source: {getattr(f, 'source_name', '')} ({getattr(f, 'source_url', 'N/A')})\n"
                f"Approved Statement: {getattr(f, 'statement', '')}"
            )

        return "\n".join(lines)

grounding_retriever = GroundingRetriever()
