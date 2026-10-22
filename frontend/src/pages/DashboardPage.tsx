import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckSquare,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Submission, AnalyticsData, BrandProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AIDisclaimer } from '../components/AIDisclaimer';

export const DashboardPage: React.FC = () => {
  const { user, role, isExternal } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const subs = await api.getSubmissions();
        setSubmissions(subs);

        if (role === 'admin' || role === 'reviewer') {
          const aData = await api.getAnalyticsDashboard().catch(() => null);
          setAnalytics(aData);
        }

        const bp = await api.getBrandProfile().catch(() => null);
        setBrandProfile(bp);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role]);

  // Derived counts
  const inReviewCount = submissions.filter((s) => s.status === 'in_review').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const draftCount = submissions.filter((s) => s.status === 'draft' || s.status === 'findings_ready').length;

  return (
    <div className="space-y-6">
      {/* AI Transparency & Governance Disclaimer */}
      <AIDisclaimer />

      {/* Role-Specific Hero Banner */}
      <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]/60 glow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF0000]">
              WORKSPACE OVERVIEW · {role.toUpperCase()} {isExternal && '(AGENCY PARTNER)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] mt-1">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Team'}.
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Brand:{' '}
            <strong className="text-[#F5F5F5]">{brandProfile?.name || 'Aura Robotics'}</strong> ·
            Tone:{' '}
            <span className="text-[#A3A3A3]">
              {brandProfile?.tone_attributes?.join(', ') || 'Authoritative, Empowering, Direct'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/submissions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(188,2,2,0.4)]"
          >
            <Plus size={15} />
            <span>New Submission</span>
          </Link>
          {(role === 'reviewer' || role === 'admin') && (
            <Link
              to="/app/reviews"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#830000] bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F5F5] text-xs font-semibold transition-colors"
            >
              <CheckSquare size={15} className="text-[#FF0000]" />
              <span>Review Queue ({inReviewCount})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold uppercase tracking-wider">Submissions</span>
            <FileText size={16} className="text-[#BC0202]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
              {submissions.length}
            </span>
            <span className="text-xs text-[#A3A3A3]">active pieces</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold uppercase tracking-wider">In Review Queue</span>
            <Clock size={16} className="text-[#FF0000]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#FF0000] font-mono">
              {inReviewCount}
            </span>
            <span className="text-xs text-[#A3A3A3]">pending approval</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Content</span>
            <ShieldCheck size={16} className="text-[#F5F5F5]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
              {approvedCount}
            </span>
            <span className="text-xs text-[#A3A3A3]">published clean</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Index</span>
            <TrendingUp size={16} className="text-[#BC0202]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
              {analytics?.average_compliance_score || 84.5}%
            </span>
            <span className="text-xs text-[#BC0202]">org average</span>
          </div>
        </div>
      </div>

      {/* Role-Specific Guidance Callout */}
      {isExternal && (
        <div className="p-4 rounded-lg bg-[#830000]/20 border border-[#BC0202] text-xs text-[#F5F5F5] flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#FF0000] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold text-[#F5F5F5]">
              External Agency Access Activated
            </strong>
            <p className="text-[#A3A3A3] mt-0.5">
              You are signed in as an external freelancer/agency creator. In accordance with PLUMB
              RBAC policies, internal confidential brand documents and financial rules are hidden
              from your view and excluded from automated AI retrieval contexts.
            </p>
          </div>
        </div>
      )}

      {/* Recent Submissions Table */}
      <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F5]">Recent Content Pipeline</h3>
            <p className="text-xs text-[#A3A3A3]">
              Review findings, run compliance checks, and track human decisions.
            </p>
          </div>
          <Link
            to="/app/submissions"
            className="text-xs font-semibold text-[#FF0000] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A3A3A3]">
            No submissions found. Click "New Submission" to start your first compliance check.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px] border-b border-[#2A2A2A]">
                <tr>
                  <th className="py-3 px-4">Title & Content</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Compliance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] text-[#F5F5F5]">
                {submissions.slice(0, 5).map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#141414]/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <Link
                        to={`/app/submissions/${sub.id}`}
                        className="text-[#F5F5F5] hover:text-[#FF0000] transition-colors font-semibold block"
                      >
                        {sub.title}
                      </Link>
                      <span className="text-[11px] text-[#A3A3A3] block">
                        Author: {sub.creator_name || 'Creator'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#141414] border border-[#2A2A2A] text-[#A3A3A3]">
                        {sub.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#A3A3A3]">
                      v{sub.current_version}
                    </td>
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
                        <span className="text-[#A3A3A3] text-[11px]">Unchecked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/app/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#141414] hover:bg-[#BC0202] text-[#F5F5F5] text-xs font-medium border border-[#2A2A2A] hover:border-[#BC0202] transition-all"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
