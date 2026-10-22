import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Palette,
  FileCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ContrastCheckResult } from '../types';

export const VisualStudioPage: React.FC = () => {
  // Contrast state
  const [fgColor, setFgColor] = useState('#F5F5F5');
  const [bgColor, setBgColor] = useState('#000000');
  const [contrastResult, setContrastResult] = useState<ContrastCheckResult | null>({
    ratio: 19.56,
    normal_text_aa: true,
    normal_text_aaa: true,
    large_text_aa: true,
    large_text_aaa: true,
    recommendation: 'Passes WCAG AAA for all text sizes.',
  });
  const [checkingContrast, setCheckingContrast] = useState(false);

  // Image analysis state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageResult, setImageResult] = useState<any>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const brandPresets = [
    { label: 'Off-White on Black', fg: '#F5F5F5', bg: '#000000' },
    { label: 'Crimson on Black', fg: '#BC0202', bg: '#000000' },
    { label: 'Bright Red on Black', fg: '#FF0000', bg: '#000000' },
    { label: 'Off-White on Crimson', fg: '#F5F5F5', bg: '#BC0202' },
    { label: 'Off-White on Deep Red', fg: '#F5F5F5', bg: '#830000' },
    { label: 'Grey on Black', fg: '#A3A3A3', bg: '#000000' },
  ];

  const handleCalculateContrast = async (fg: string, bg: string) => {
    setCheckingContrast(true);
    try {
      const res = await api.checkContrast(fg, bg);
      setContrastResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCheckingContrast(false);
    }
  };

  const handleApplyPreset = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
    handleCalculateContrast(fg, bg);
  };

  const handleAnalyzeImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzingImage(true);
    try {
      const res = await api.analyzeImage(imageFile || undefined);
      setImageResult(res);
    } catch (err: any) {
      alert(err.message || 'Image analysis failed');
    } finally {
      setAnalyzingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
          Visual Identity & WCAG Accessibility Studio
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-0.5">
          Audit color contrast ratios, test brand palette adherence, and evaluate graphic accessibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: WCAG Contrast Calculator */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-[#BC0202]" />
              <h2 className="text-sm font-bold text-[#F5F5F5]">WCAG 2.1 Contrast Calculator</h2>
            </div>
            <span className="text-[11px] font-mono text-[#A3A3A3]">AA / AAA Standards</span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-mono uppercase text-[#A3A3A3] block mb-2">
              Brand Palette Pairings:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {brandPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p.fg, p.bg)}
                  className="px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1C1C1C] border border-[#2A2A2A] text-[#F5F5F5] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color inputs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#A3A3A3] font-semibold mb-1">Foreground (Text)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => {
                    setFgColor(e.target.value);
                    handleCalculateContrast(e.target.value, bgColor);
                  }}
                  className="w-8 h-8 rounded border border-[#2A2A2A] bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => {
                    setFgColor(e.target.value);
                    if (e.target.value.length === 7)
                      handleCalculateContrast(e.target.value, bgColor);
                  }}
                  className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A3A3A3] font-semibold mb-1">Background (Surface)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    handleCalculateContrast(fgColor, e.target.value);
                  }}
                  className="w-8 h-8 rounded border border-[#2A2A2A] bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    if (e.target.value.length === 7)
                      handleCalculateContrast(fgColor, e.target.value);
                  }}
                  className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div
            className="p-6 rounded-lg border border-[#2A2A2A] transition-colors flex flex-col justify-center items-center text-center space-y-1"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <span className="text-lg font-bold">The quick brown fox jumps over the lazy dog.</span>
            <span className="text-xs opacity-80">14pt Regular Body Text Sample Preview</span>
          </div>

          {/* Ratio & Criteria Scorecard */}
          {contrastResult && (
            <div className="p-4 rounded-lg bg-[#141414] border border-[#2A2A2A] space-y-3 text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-[#A3A3A3]">Contrast Ratio:</span>
                <span className="text-2xl font-extrabold font-mono text-[#F5F5F5]">
                  {contrastResult.ratio} : 1
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div
                  className={`p-2 rounded border flex items-center justify-between ${
                    contrastResult.normal_text_aa
                      ? 'border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F5]'
                      : 'border-[#BC0202] bg-[#830000]/20 text-[#FF0000]'
                  }`}
                >
                  <span>Normal Text AA (4.5:1)</span>
                  <span>{contrastResult.normal_text_aa ? 'PASS' : 'FAIL'}</span>
                </div>

                <div
                  className={`p-2 rounded border flex items-center justify-between ${
                    contrastResult.normal_text_aaa
                      ? 'border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F5]'
                      : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3]'
                  }`}
                >
                  <span>Normal Text AAA (7.0:1)</span>
                  <span>{contrastResult.normal_text_aaa ? 'PASS' : 'FAIL'}</span>
                </div>

                <div
                  className={`p-2 rounded border flex items-center justify-between ${
                    contrastResult.large_text_aa
                      ? 'border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F5]'
                      : 'border-[#BC0202] bg-[#830000]/20 text-[#FF0000]'
                  }`}
                >
                  <span>Large Text AA (3.0:1)</span>
                  <span>{contrastResult.large_text_aa ? 'PASS' : 'FAIL'}</span>
                </div>

                <div
                  className={`p-2 rounded border flex items-center justify-between ${
                    contrastResult.large_text_aaa
                      ? 'border-[#2A2A2A] bg-[#0A0A0A] text-[#F5F5F5]'
                      : 'border-[#2A2A2A] bg-[#0A0A0A] text-[#A3A3A3]'
                  }`}
                >
                  <span>Large Text AAA (4.5:1)</span>
                  <span>{contrastResult.large_text_aaa ? 'PASS' : 'FAIL'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#A3A3A3] pt-1">
                Recommendation: {contrastResult.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Image Palette & Graphic Accessibility */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-[#BC0202]" />
              <h2 className="text-sm font-bold text-[#F5F5F5]">Dominant Palette & Asset Inspector</h2>
            </div>
            <span className="text-[11px] font-mono text-[#A3A3A3]">Pillow / ColorThief</span>
          </div>

          <form onSubmit={handleAnalyzeImage} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#A3A3A3] font-semibold mb-1">
                Upload Campaign Graphic / Banner
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
              />
            </div>

            <button
              type="submit"
              disabled={analyzingImage}
              className="w-full py-2.5 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(188,2,2,0.4)]"
            >
              <Palette size={14} />
              <span>{analyzingImage ? 'Extracting Palette...' : 'Extract & Audit Palette'}</span>
            </button>
          </form>

          {imageResult && (
            <div className="space-y-4 text-xs pt-2">
              <div>
                <span className="text-[#A3A3A3] font-bold block mb-2">Dominant Colors:</span>
                <div className="flex gap-2">
                  {imageResult.dominant_palette?.map((color: string, i: number) => (
                    <div key={i} className="flex-1 text-center">
                      <div
                        className="h-10 rounded border border-[#2A2A2A] mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-[10px] text-[#A3A3A3]">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded bg-[#141414] border border-[#2A2A2A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#A3A3A3]">Brand Palette Match:</span>
                  <span
                    className={`font-bold font-mono ${
                      imageResult.brand_palette_match ? 'text-[#F5F5F5]' : 'text-[#FF0000]'
                    }`}
                  >
                    {imageResult.brand_palette_match ? 'ALIGNED' : 'NON-ALIGNED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A3A3A3]">Logo Clearance Zones:</span>
                  <span className="text-[#F5F5F5] font-mono">
                    {imageResult.logo_clearance_status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A3A3A3]">Sample Resolution:</span>
                  <span className="text-[#F5F5F5] font-mono">{imageResult.resolution}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#830000]/20 border border-[#BC0202] text-xs text-[#F5F5F5]">
                <strong className="block text-[#FF0000] mb-0.5">Alt-Text Requirement:</strong>
                <span>{imageResult.alt_text_reminder}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
