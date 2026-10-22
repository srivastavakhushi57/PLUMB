import json
import asyncio
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from backend.app.database import AsyncSessionLocal, init_db
from backend.app.models import GuidelineRule, ApprovedFact
from backend.app.rule_engine.engine import rule_engine

async def run_evaluation():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Load active rules and facts
        rules_res = await session.execute(select(GuidelineRule).where(GuidelineRule.active == True))
        rules = list(rules_res.scalars().all())

        facts_res = await session.execute(select(ApprovedFact))
        facts = list(facts_res.scalars().all())

    # Load 20 labelled samples
    samples_path = os.path.join(os.path.dirname(__file__), "samples.json")
    with open(samples_path, "r", encoding="utf-8") as f:
        samples = json.load(f)

    tp = 0  # Expected violation correctly flagged
    fp = 0  # Clean content falsely flagged
    fn = 0  # Violation missed
    tn = 0  # Clean content correctly identified as clean

    print(f"\n==================================================================")
    print(f"PLUMB BENCHMARK EVALUATION: {len(samples)} Labelled Test Samples")
    print(f"==================================================================")

    for s in samples:
        s_id = s["id"]
        s_type = s["type"]
        text = s["text"]
        expected_v = s["expected_violations"]

        findings = rule_engine.evaluate(text, channel="social" if s_type == "channel_limits" else "blog", rules=rules, approved_facts=facts)
        actual_v = len(findings)

        if expected_v == 0 and actual_v == 0:
            tn += 1
            status = "PASS (True Negative)"
        elif expected_v > 0 and actual_v > 0:
            tp += 1
            status = f"PASS (True Positive: {actual_v} flagged)"
        elif expected_v == 0 and actual_v > 0:
            fp += 1
            status = f"FAIL (False Positive: {actual_v} flagged on clean text)"
        else:
            fn += 1
            status = f"FAIL (False Negative: missed expected violation)"

        print(f"[{s_id}] ({s_type.ljust(18)}) {status}")

    total = len(samples)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print(f"\n==================================================================")
    print(f"EVALUATION METRICS SUMMARY")
    print(f"==================================================================")
    print(f"Total Samples Evaluated: {total}")
    print(f"True Positives  (TP)   : {tp}")
    print(f"True Negatives  (TN)   : {tn}")
    print(f"False Positives (FP)   : {fp}")
    print(f"False Negatives (FN)   : {fn}")
    print(f"------------------------------------------------------------------")
    print(f"Precision              : {precision * 100:.1f}%")
    print(f"Recall (Sensitivity)   : {recall * 100:.1f}%")
    print(f"False Positive Rate    : {fpr * 100:.1f}%")
    print(f"F1 Score               : {f1 * 100:.1f}%")
    print(f"==================================================================\n")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
