import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  ArrowRight,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Submission, ChannelType, ContentType } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const SubmissionsPage: React.FC = () => {
  const { role, isExternal } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Submission Modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState<ChannelType>('blog');
  const [newContentType, setNewContentType] = useState<ContentType>('text');
  const [newText, setNewText] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [channelFilter, statusFilter]);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const data = await api.getSubmissions(channelFilter || undefined, statusFilter || undefined);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent, runImmediate: boolean = false) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    setCreating(true);
    try {
      const sub = await api.createSubmission({
        title: newTitle,
        channel: newChannel,
        content_type: newContentType,
        text_content: newText,
      });

      setShowModal(false);
      setNewTitle('');
      setNewText('');

      if (runImmediate && sub.latest_version) {
        // Run check and navigate to detail
        await api.runAnalysis(sub.latest_version.id).catch(() => {});
        navigate(`/app/submissions/${sub.id}`);
      } else {
        navigate(`/app/submissions/${sub.id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create submission');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setNewText(text);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const filtered = submissions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.creator_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
            Content Pipeline & Submissions
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Submit copy or marketing creative for pre-flight AI and deterministic brand governance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(188,2,2,0.4)] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)]"
        >
          <Plus size={16} />
          <span>New Submission</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-[#A3A3A3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs text-[#F5F5F5] placeholder-[#A3A3A3]/50 focus:border-[#BC0202] focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
          >
            <option value="">All Channels</option>
            <option value="blog">Blog</option>
            <option value="social">Social Media</option>
            <option value="email">Email</option>
            <option value="ad">Advertising</option>
            <option value="web">Website Copy</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="findings_ready">Findings Ready</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="changes_requested">Changes Requested</option>
          </select>
        </div>
      </div>

      {/* Submissions Grid / List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#A3A3A3]">Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#A3A3A3]">
          No matching submissions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#830000] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#141414] border border-[#2A2A2A] text-[#A3A3A3]">
                    {sub.channel}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>

                <Link
                  to={`/app/submissions/${sub.id}`}
                  className="font-bold text-sm text-[#F5F5F5] hover:text-[#FF0000] transition-colors line-clamp-2"
                >
                  {sub.title}
                </Link>

                <p className="text-xs text-[#A3A3A3] mt-2 line-clamp-3">
                  {sub.latest_version?.text_content || 'No text content available.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-[#A3A3A3] block">
                    Version v{sub.current_version}
                  </span>
                  <span className="font-mono font-bold text-sm">
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
                        {sub.latest_score}% Compliance
                      </span>
                    ) : (
                      <span className="text-[#A3A3A3] text-xs">Not Checked</span>
                    )}
                  </span>
                </div>

                <Link
                  to={`/app/submissions/${sub.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#141414] hover:bg-[#BC0202] text-[#F5F5F5] font-semibold border border-[#2A2A2A] hover:border-[#BC0202] transition-colors"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-base font-bold text-[#F5F5F5]">New Content Submission</h3>
              <span className="text-xs font-mono text-[#BC0202]">Draft ➔ PLUMB Check</span>
            </div>

            <form className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A3A3A3] font-semibold mb-1">Content Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Q3 Autonomous Logistics Launch Announcement"
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A3A3A3] font-semibold mb-1">Target Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as ChannelType)}
                    className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  >
                    <option value="blog">Blog Post / Article</option>
                    <option value="social">Social Media (Twitter, LinkedIn)</option>
                    <option value="email">Email Campaign</option>
                    <option value="ad">Digital Ad Headline / Copy</option>
                    <option value="web">Website Product Page</option>
                    <option value="other">Other Marketing Collateral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A3A3A3] font-semibold mb-1">Content Type</label>
                  <select
                    value={newContentType}
                    onChange={(e) => setNewContentType(e.target.value as ContentType)}
                    className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  >
                    <option value="text">Plain Text / Markdown</option>
                    <option value="text+image">Text + Supporting Image</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#A3A3A3] font-semibold">Content Body</label>
                  <label className="text-[11px] text-[#BC0202] hover:text-[#FF0000] cursor-pointer flex items-center gap-1 font-mono">
                    <Upload size={12} />
                    <span>Import .txt / .docx</span>
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  required
                  rows={8}
                  placeholder="Paste marketing copy or draft text here..."
                  className="w-full p-3 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] font-mono text-xs leading-relaxed"
                />
                <span className="text-[10px] text-[#A3A3A3] font-mono block text-right mt-1">
                  {newText.length} characters (Limit: 50,000)
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreate(e, false)}
                  disabled={creating}
                  className="px-4 py-2 rounded bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#F5F5F5] font-semibold border border-[#2A2A2A]"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreate(e, true)}
                  disabled={creating}
                  className="px-5 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(188,2,2,0.4)]"
                >
                  <Sparkles size={14} />
                  <span>{creating ? 'Saving...' : 'Save & Run PLUMB Check'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
