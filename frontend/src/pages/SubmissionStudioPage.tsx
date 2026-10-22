import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  History,
  GitCompare,
  Send,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Edit3,
  Save,
  HelpCircle,
  FileCheck2,
  Lock,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Submission,
  SubmissionVersion,
  AnalysisRun,
  Finding,
  CategoryType,
  SeverityType,
  FindingStatus
} from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AIDisclaimer } from '../components/AIDisclaimer';

export const SubmissionStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [versions, setVersions] = useState<SubmissionVersion[]>([]);
  const [activeVersionNo, setActiveVersionNo] = useState<number>(1);
  const [analysisRun, setAnalysisRun] = useState<AnalysisRun | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Manual Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Rewrite in Brand Voice Modal
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewriteData, setRewriteData] = useState<any>(null);
  const [rewriting, setRewriting] = useState(false);

  // Version Diff Modal
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [diffData, setDiffData] = useState<any>(null);

  // Dismiss Modal
  const [dismissFindingId, setDismissFindingId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  const findingsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadSubmissionDetails();
    }
  }, [id]);

  async function loadSubmissionDetails() {
    if (!id) return;
    try {
      const data = await api.getSubmission(id);
      setSubmission(data.submission);
      setVersions(data.versions);
      const curVer = data.submission.current_version;
      setActiveVersionNo(curVer);

      const targetVersion = data.versions.find((v) => v.version_no === curVer) || data.versions[0];
      if (targetVersion) {
        setEditedText(targetVersion.text_content);
        loadLatestAnalysis(targetVersion.id);
      }
    } catch (err) {
      console.error('Failed to load submission studio:', err);
    }
  }

  async function loadLatestAnalysis(versionId: string) {
    try {
      const run = await api.getLatestAnalysis(versionId);
      setAnalysisRun(run);
    } catch {
      setAnalysisRun(null);
    }
  }

  const activeVersion = versions.find((v) => v.version_no === activeVersionNo) || versions[0];

  const handleRunCheck = async () => {
    if (!activeVersion) return;
    setAnalyzing(true);
    try {
      const run = await api.runAnalysis(activeVersion.id);
      setAnalysisRun(run);
      if (submission) {
        setSubmission({
          ...submission,
          status: 'findings_ready',
          latest_score: run.compliance_score,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Analysis check failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveManualEdit = async () => {
    if (!submission || !id) return;
    try {
      const newVer = await api.createVersion(id, {
        text_content: editedText,
        change_note: 'Manual edit in Studio',
      });
      setIsEditing(false);
      await loadSubmissionDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to save version');
    }
  };

  const handleApplySingleSuggestion = async (finding: Finding) => {
    if (!activeVersion || !finding.suggested_fix || !submission || !id) return;
    const text = activeVersion.text_content;
    let newText = text;
    if (finding.excerpt && text.includes(finding.excerpt)) {
      newText =
        text.slice(0, finding.span_start) + finding.suggested_fix + text.slice(finding.span_end);
    } else {
      newText = text.replace(finding.excerpt, finding.suggested_fix);
    }

    try {
      await api.updateFindingStatus(finding.id, 'accepted');
      await api.createVersion(id, {
        text_content: newText,
        change_note: `Applied correction for: "${finding.excerpt}" ➔ "${finding.suggested_fix}"`,
      });
      await loadSubmissionDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to apply fix');
    }
  };

  const handleApplyAllLowRisk = async () => {
    if (!activeVersion) return;
    try {
      const res = await api.applyAllLowRisk(activeVersion.id);
      alert(res.message);
      await loadSubmissionDetails();
    } catch (err: any) {
      alert(err.message || 'Batch apply failed');
    }
  };

  const handleRewriteInBrandVoice = async () => {
    if (!activeVersion) return;
    setRewriting(true);
    setShowRewriteModal(true);
    try {
      const data = await api.rewriteInBrandVoice(activeVersion.id);
      setRewriteData(data);
    } catch (err: any) {
      alert(err.message || 'Rewrite generation failed');
      setShowRewriteModal(false);
    } finally {
      setRewriting(false);
    }
  };

  const handleAcceptRewrite = async () => {
    if (!rewriteData || !submission || !id) return;
    try {
      await api.createVersion(id, {
        text_content: rewriteData.revised_text,
        change_note: 'Accepted full AI brand-voice revision',
      });
      setShowRewriteModal(false);
      setRewriteData(null);
      await loadSubmissionDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to apply revision');
    }
  };

  const handleConfirmDismiss = async () => {
    if (!dismissFindingId || !dismissReason.trim()) return;
    try {
      await api.updateFindingStatus(dismissFindingId, 'dismissed', dismissReason);
      setDismissFindingId(null);
      setDismissReason('');
      if (activeVersion) {
        await loadLatestAnalysis(activeVersion.id);
      }
    } catch (err: any) {
      alert(err.message || 'Dismiss failed');
    }
  };

  const handleFeedback = async (findingId: string, rating: 'helpful' | 'wrong' | 'misleading') => {
    try {
      await api.submitFindingFeedback(findingId, rating);
      alert(`Recorded feedback: ${rating}. This helps reduce false positives.`);
    } catch (err: any) {
      alert(err.message || 'Feedback failed');
    }
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    try {
      await api.submitForReview(id);
      alert('Content submitted to compliance review queue!');
      navigate('/app/submissions');
    } catch (err: any) {
      alert(err.message || 'Failed to submit for review');
    }
  };

  const handleOpenDiff = async () => {
    if (!id || versions.length < 2) return;
    try {
      const vFrom = versions[versions.length - 1].version_no;
      const vTo = versions[0].version_no;
      const diff = await api.getVersionDiff(id, vFrom, vTo);
      setDiffData(diff);
      setShowDiffModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to calculate diff');
    }
  };

  // Filtered findings
  const findings = analysisRun?.findings || [];
  const filteredFindings = findings.filter((f) => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  // Render text with clickable styled highlight spans
  const renderHighlightedContent = (text: string) => {
    if (!findings || findings.length === 0) {
      return <span>{text}</span>;
    }

    // Sort findings by span_start
    const sorted = [...findings].sort((a, b) => a.span_start - b.span_start);
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    sorted.forEach((f, idx) => {
      if (f.span_start >= lastIdx && f.span_end <= text.length && f.span_start < f.span_end) {
        // Plain text before finding
        if (f.span_start > lastIdx) {
          elements.push(
            <span key={`plain-${lastIdx}`}>{text.substring(lastIdx, f.span_start)}</span>
          );
        }

        // Highlight class based on severity
        const underlineClass =
          f.severity === 'critical'
            ? 'span-highlight-critical'
            : f.severity === 'high'
            ? 'span-highlight-high'
            : f.severity === 'medium'
            ? 'span-highlight-medium'
            : 'span-highlight-low';

        const isSelected = selectedFindingId === f.id;

        elements.push(
          <mark
            key={`finding-${f.id || idx}`}
            onClick={() => {
              setSelectedFindingId(f.id);
              const el = document.getElementById(`finding-card-${f.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            className={`span-highlight ${underlineClass} ${
              isSelected ? 'active-highlight ring-2 ring-[#FF0000]' : ''
            }`}
            title={`[${f.severity.toUpperCase()}] ${f.explanation}`}
          >
            {text.substring(f.span_start, f.span_end)}
          </mark>
        );

        lastIdx = f.span_end;
      }
    });

    if (lastIdx < text.length) {
      elements.push(<span key={`plain-end`}>{text.substring(lastIdx)}</span>);
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app/submissions"
            className="p-1.5 rounded-md text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]"
            title="Back to submissions"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#F5F5F5]">{submission?.title}</h1>
              {submission && <StatusBadge status={submission.status} />}
            </div>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Channel: <span className="font-mono text-[#F5F5F5] uppercase">{submission?.channel}</span> ·
              Active Version: <span className="font-mono text-[#FF0000]">v{activeVersionNo}</span>
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {versions.length > 1 && (
            <button
              onClick={handleOpenDiff}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F5F5] border border-[#2A2A2A]"
            >
              <GitCompare size={14} className="text-[#BC0202]" />
              <span>Version Diff</span>
            </button>
          )}

          <button
            onClick={handleRewriteInBrandVoice}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F5F5] border border-[#830000]"
          >
            <Wand2 size={14} className="text-[#FF0000]" />
            <span>Rewrite in Brand Voice</span>
          </button>

          <button
            onClick={handleRunCheck}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold shadow-[0_0_15px_rgba(188,2,2,0.4)] disabled:opacity-50 transition-all"
          >
            <Sparkles size={14} />
            <span>{analyzing ? 'Checking Guidelines...' : 'Run PLUMB Check'}</span>
          </button>

          {submission?.status !== 'in_review' && submission?.status !== 'approved' && (
            <button
              onClick={handleSubmitReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#F5F5F5] bg-[#0A0A0A] hover:bg-[#141414] text-[#F5F5F5] font-semibold transition-colors"
            >
              <Send size={14} />
              <span>Submit for Review</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Disclaimer Bar */}
      <AIDisclaimer transparency={analysisRun?.transparency_info} />

      {/* Score Summary Card */}
      {analysisRun && (
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#830000]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black font-mono text-[#F5F5F5]">
                {analysisRun.compliance_score}%
              </span>
              <span className="text-xs uppercase font-mono tracking-wider text-[#A3A3A3]">
                Explainable Compliance Score
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-1 font-mono">
              {analysisRun.scoring_breakdown.formula_explanation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyAllLowRisk}
              className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#830000] text-[#F5F5F5] text-xs font-semibold border border-[#BC0202] transition-colors"
            >
              Apply All Low-Risk Fixes
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Content Viewer & Highlighting) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
            {/* Studio Header */}
            <div className="p-3 bg-[#141414] border-b border-[#2A2A2A] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#F5F5F5]">Content Viewer</span>
                <span className="text-[#A3A3A3]">· Spans styled by severity</span>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={handleSaveManualEdit}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#BC0202] text-[#FFFFFF] font-semibold"
                  >
                    <Save size={12} />
                    <span>Save Version</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#2A2A2A]"
                  >
                    <Edit3 size={12} />
                    <span>Edit Copy</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 min-h-[380px] text-sm leading-relaxed font-mono">
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={14}
                  className="w-full h-full p-3 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] font-mono text-sm leading-relaxed"
                />
              ) : (
                <div className="whitespace-pre-wrap select-text">
                  {renderHighlightedContent(activeVersion?.text_content || '')}
                </div>
              )}
            </div>

            {/* Severity Underline Legend */}
            <div className="p-3 bg-[#0A0A0A] border-t border-[#2A2A2A] flex flex-wrap items-center gap-4 text-[11px] text-[#A3A3A3]">
              <span className="font-bold text-[#F5F5F5]">Underline Legend:</span>
              <span className="span-highlight-low">Dotted: Low</span>
              <span className="span-highlight-medium">Dashed: Medium</span>
              <span className="span-highlight-high">Solid: High</span>
              <span className="span-highlight-critical">Wavy: Critical</span>
            </div>
          </div>
        </div>

        {/* Right Column (Explainable Findings Inspector) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F5]">Compliance Findings</h3>
                <span className="text-xs text-[#A3A3A3]">
                  {filteredFindings.length} issue{filteredFindings.length !== 1 ? 's' : ''} detected
                </span>
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-1.5 rounded bg-[#141414] border border-[#2A2A2A] text-xs text-[#F5F5F5]"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open Only</option>
                <option value="accepted">Accepted</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Category and Severity Pill Filters */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['all', 'claims', 'terminology', 'tone', 'legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded font-mono uppercase transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#BC0202] text-[#FFFFFF]'
                      : 'bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Findings List */}
            <div ref={findingsListRef} className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredFindings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A3A3A3]">
                  {analysisRun
                    ? 'No findings match the active filters.'
                    : 'Click "Run PLUMB Check" to evaluate this version.'}
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <div
                    id={`finding-card-${finding.id}`}
                    key={finding.id}
                    className={`p-4 rounded-lg bg-[#141414] border transition-all ${
                      selectedFindingId === finding.id
                        ? 'border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                        : 'border-[#2A2A2A] hover:border-[#830000]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={finding.severity} />
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1C1C1C] text-[#A3A3A3]">
                          {finding.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#A3A3A3] capitalize">
                        Status: <strong className="text-[#F5F5F5]">{finding.status}</strong>
                      </span>
                    </div>

                    {/* Excerpt */}
                    <div className="p-2 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-xs font-mono text-[#FF0000] mb-2 break-all">
                      "{finding.excerpt}"
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-[#F5F5F5] leading-relaxed mb-2">
                      {finding.explanation}
                    </p>

                    {/* Cited Evidence */}
                    <div className="p-2 rounded bg-[#0A0A0A] text-[11px] text-[#A3A3A3] border-l-2 border-[#BC0202] mb-3">
                      <strong className="text-[#BC0202] block">Cited Grounding Evidence:</strong>
                      <span>{finding.evidence_text}</span>
                    </div>

                    {/* Suggested Fix */}
                    {finding.suggested_fix && (
                      <div className="p-2 rounded bg-[#830000]/20 border border-[#BC0202] text-xs mb-3">
                        <span className="text-[#A3A3A3] block text-[11px] font-semibold">
                          Proposed Correction:
                        </span>
                        <span className="text-[#F5F5F5] font-mono font-bold">
                          {finding.suggested_fix}
                        </span>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A2A2A] text-xs">
                      <div className="flex items-center gap-1.5">
                        {finding.suggested_fix && finding.status === 'open' && (
                          <button
                            onClick={() => handleApplySingleSuggestion(finding)}
                            className="px-2.5 py-1 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center gap-1"
                          >
                            <Check size={12} />
                            <span>Apply Fix</span>
                          </button>
                        )}

                        {finding.status === 'open' && (
                          <button
                            onClick={() => setDismissFindingId(finding.id)}
                            className="px-2 py-1 rounded bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5]"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>

                      {/* False Positive Feedback */}
                      <div className="flex items-center gap-1 text-[#A3A3A3]">
                        <button
                          onClick={() => handleFeedback(finding.id, 'helpful')}
                          className="p-1 hover:text-[#F5F5F5]"
                          title="Helpful finding"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={() => handleFeedback(finding.id, 'wrong')}
                          className="p-1 hover:text-[#FF0000]"
                          title="Wrong / False Positive"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Rewrite in Brand Voice */}
      {showRewriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/85 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-[#FF0000]" />
                <h3 className="text-base font-bold text-[#F5F5F5]">Rewrite in Brand Voice (Diff)</h3>
              </div>
              <span className="text-xs text-[#A3A3A3]">Never overwrites without approval</span>
            </div>

            {rewriting ? (
              <div className="p-12 text-center text-xs text-[#A3A3A3]">
                Generating brand voice revision...
              </div>
            ) : rewriteData ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded bg-[#141414] border border-[#2A2A2A]">
                  <strong className="text-[#FF0000] block mb-1">Stylistic Rationale:</strong>
                  <p className="text-[#A3A3A3]">{rewriteData.rationale}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-[#141414] border border-[#2A2A2A]">
                    <span className="text-[#A3A3A3] font-bold block mb-2">Original Copy:</span>
                    <p className="font-mono text-xs whitespace-pre-wrap text-[#A3A3A3]">
                      {rewriteData.original_text}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#830000]/20 border border-[#BC0202]">
                    <span className="text-[#F5F5F5] font-bold block mb-2">Revised Brand Copy:</span>
                    <p className="font-mono text-xs whitespace-pre-wrap text-[#F5F5F5]">
                      {rewriteData.revised_text}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#141414] border border-[#2A2A2A]">
                  <span className="text-[#F5F5F5] font-bold block mb-1">Key Changes:</span>
                  <ul className="list-disc list-inside space-y-1 text-[#A3A3A3]">
                    {rewriteData.changes_made?.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-4 border-t border-[#2A2A2A] text-xs">
              <button
                onClick={() => setShowRewriteModal(false)}
                className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRewrite}
                className="px-5 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold"
              >
                Accept and Save New Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Version Diff */}
      {showDiffModal && diffData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/85 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-base font-bold text-[#F5F5F5]">
                Version Diff (v{diffData.v_from} ➔ v{diffData.v_to})
              </h3>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded bg-[#141414] border border-[#2A2A2A] font-mono text-xs max-h-[400px] overflow-y-auto space-y-1">
              {diffData.diff_lines?.map((line: string, i: number) => (
                <div
                  key={i}
                  className={
                    line.startsWith('+')
                      ? 'text-[#F5F5F5] bg-[#830000]/30 px-1'
                      : line.startsWith('-')
                      ? 'text-[#A3A3A3] bg-[#2A2A2A]/40 line-through px-1'
                      : 'text-[#A3A3A3] px-1'
                  }
                >
                  {line}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 rounded bg-[#141414] text-[#F5F5F5] text-xs"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dismiss with Reason */}
      {dismissFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-[#F5F5F5]">Dismiss Finding</h3>
            <p className="text-[#A3A3A3]">
              Provide a rationale for dismissing this guideline violation. Repeated dismissals help
              identify ambiguous or impractical rules for brand governance optimization.
            </p>

            <textarea
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Approved intentional exception for specialized technical audience..."
              className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDismissFindingId(null)}
                className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDismiss}
                disabled={!dismissReason.trim()}
                className="px-4 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold disabled:opacity-50"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
