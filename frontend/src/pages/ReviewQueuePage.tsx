import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Eye,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Submission, ApprovalDecision } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const ReviewQueuePage: React.FC = () => {
  const { user, role } = useAuth();
  const [queue, setQueue] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [decision, setDecision] = useState<ApprovalDecision>('approved');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    try {
      const data = await api.getReviewQueue();
      setQueue(data);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !comment.trim()) return;

    setSubmitting(true);
    try {
      await api.submitReviewDecision(selectedSub.id, decision, comment);
      alert(`Decision recorded: ${decision.toUpperCase()}. Creator has been notified.`);
      setSelectedSub(null);
      setComment('');
      await loadQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
          Compliance Review & Approval Queue
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-0.5">
          Authorized human governance check. Verify cited evidence and make final publication determinations.
        </p>
      </div>

      {/* Queue Table */}
      <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF0000]" />
            <span className="text-sm font-bold text-[#F5F5F5]">Pending Reviews</span>
            <span className="text-xs text-[#A3A3A3]">({queue.length} items awaiting audit)</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#A3A3A3]">Loading review queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A3A3A3]">
            Review queue is clear! All submitted content has been evaluated.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px] border-b border-[#2A2A2A]">
                <tr>
                  <th className="py-3 px-4">Title & Excerpt</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Compliance Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] text-[#F5F5F5]">
                {queue.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#141414]/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/app/submissions/${sub.id}`}
                        className="font-bold text-[#F5F5F5] hover:text-[#FF0000] transition-colors block line-clamp-1"
                      >
                        {sub.title}
                      </Link>
                      <span className="text-[11px] text-[#A3A3A3] line-clamp-1 mt-0.5">
                        {sub.latest_version?.text_content || ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-[#A3A3A3]">
                      {sub.channel}
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A3]">{sub.creator_name || 'Creator'}</td>
                    <td className="py-3.5 px-4 font-mono text-[#A3A3A3]">v{sub.current_version}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {sub.latest_score !== null && sub.latest_score !== undefined ? (
                        <span
                          className={
                            sub.latest_score >= 80
                              ? 'text-[#F5F5F5]'
                              : sub.latest_score >= 60
                              ? 'text-[#BC0202]'
                              : 'text-[#FF0000]'
                          }
                        >
                          {sub.latest_score}%
                        </span>
                      ) : (
                        <span className="text-[#A3A3A3]">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/app/submissions/${sub.id}`}
                          className="px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#2A2A2A]"
                          title="Inspect evidence in Studio"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setDecision('approved');
                            setComment('');
                          }}
                          className="px-3 py-1 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Decision Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/85 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="border-b border-[#2A2A2A] pb-3">
              <h3 className="text-base font-bold text-[#F5F5F5]">
                Evaluate Submission: {selectedSub.title}
              </h3>
              <span className="text-xs text-[#A3A3A3]">
                Channel: {selectedSub.channel.toUpperCase()} · Author: {selectedSub.creator_name}
              </span>
            </div>

            <div className="p-3 rounded bg-[#141414] border border-[#2A2A2A] text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap text-[#A3A3A3]">
              {selectedSub.latest_version?.text_content}
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A3A3A3] font-semibold mb-2">
                  Review Determination
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'approved'
                        ? 'border-[#F5F5F5] bg-[#0A0A0A] text-[#F5F5F5] shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3]'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('changes_requested')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'changes_requested'
                        ? 'border-[#BC0202] bg-[#830000] text-[#F5F5F5]'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3]'
                    }`}
                  >
                    <RotateCcw size={14} />
                    <span>Request Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'rejected'
                        ? 'border-[#FF0000] bg-[#BC0202] text-[#FFFFFF]'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#A3A3A3]'
                    }`}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#A3A3A3] font-semibold mb-1">
                  Mandatory Reviewer Comment / Compliance Rationale
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  placeholder="Explain the approval reasoning or specific revisions required before re-submitting..."
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs"
                />
                <span className="text-[11px] text-[#A3A3A3] block mt-0.5">
                  Minimum 5 characters required for compliance audit trails.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || comment.trim().length < 5}
                  className="px-5 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{submitting ? 'Submitting...' : 'Confirm Determination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
