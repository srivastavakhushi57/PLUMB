import os
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import Optional

from backend.app.schemas import (
    ContrastCheckRequest,
    ContrastCheckResponse,
    ReadabilityScore
)
from backend.app.visual.analyzer import (
    calculate_contrast_ratio,
    evaluate_wcag_compliance,
    visual_analyzer
)
from backend.app.rule_engine.engine import compute_readability_metrics

router = APIRouter(prefix="/api/visual", tags=["Visual & Accessibility Engine"])

@router.post("/check-contrast", response_model=ContrastCheckResponse)
async def check_contrast(payload: ContrastCheckRequest):
    """Calculates WCAG 2.1 AA and AAA contrast ratio between two hex colors."""
    ratio = calculate_contrast_ratio(payload.foreground_hex, payload.background_hex)
    comp = evaluate_wcag_compliance(ratio)
    return ContrastCheckResponse(
        ratio=comp["ratio"],
        normal_text_aa=comp["normal_text_aa"],
        normal_text_aaa=comp["normal_text_aaa"],
        large_text_aa=comp["large_text_aa"],
        large_text_aaa=comp["large_text_aaa"],
        recommendation=comp["recommendation"]
    )

@router.post("/analyze-image")
async def analyze_image(
    file: Optional[UploadFile] = File(None)
):
    """
    Extracts dominant color palette, computes WCAG contrast against dark backgrounds,
    checks alignment with PLUMB brand colors, and inspects logo clearance heuristics.
    """
    if file:
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        results = visual_analyzer.analyze_image_palette(temp_path)
        try:
            os.remove(temp_path)
        except Exception:
            pass
        return results

    # Fallback to demo analysis
    return visual_analyzer.analyze_image_palette("")

@router.post("/readability", response_model=ReadabilityScore)
async def analyze_readability(text: str = Form(...)):
    """Computes Flesch Reading Ease, Flesch-Kincaid Grade, and Gunning Fog index."""
    metrics = compute_readability_metrics(text)
    return ReadabilityScore(**metrics)
