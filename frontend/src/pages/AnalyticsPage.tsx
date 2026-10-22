import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await api.getAnalyticsDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  // Palette colors for charts
  const RED_PALETTE = ['#BC0202', '#830000', '#FF0000', '#A3A3A3', '#F5F5F5', '#660000'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
          Brand Governance & Consistency Analytics
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-0.5">
          Real-time metrics on compliance scores, turnaround velocity, repeated violations, and unclear guideline signals.
        </p>
      </div>

      {loading || !data ? (
        <div className="p-12 text-center text-xs text-[#A3A3A3]">Loading analytics metrics...</div>
      ) : (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[11px] font-mono uppercase text-[#A3A3A3]">
                Avg Compliance Score
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                  {data.average_compliance_score}%
                </span>
                <span className="text-xs text-[#BC0202]">Past 30 Days</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[11px] font-mono uppercase text-[#A3A3A3]">Approval Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                  {data.approval_rate}%
                </span>
                <span className="text-xs text-[#A3A3A3]">First-pass rate</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[11px] font-mono uppercase text-[#A3A3A3]">Rejection Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#FF0000] font-mono">
                  {data.rejection_rate}%
                </span>
                <span className="text-xs text-[#A3A3A3]">Requires revision</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="text-[11px] font-mono uppercase text-[#A3A3A3]">
                Avg Turnaround Time
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#F5F5F5] font-mono">
                  {data.avg_turnaround_hours}h
                </span>
                <span className="text-xs text-[#A3A3A3]">Review queue speed</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Violations by Category */}
            <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F5F5]">Violations by Category</h3>
                <span className="text-xs font-mono text-[#A3A3A3]">Frequency distribution</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.category_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" />
                    <XAxis dataKey="category" stroke="#A3A3A3" fontSize={11} />
                    <YAxis stroke="#A3A3A3" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141414',
                        borderColor: '#830000',
                        color: '#F5F5F5',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="violations" fill="#BC0202">
                      {data.category_chart.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={RED_PALETTE[index % RED_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Compliance Score Trend */}
            <div className="lg:col-span-6 p-6 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F5F5]">Compliance Score Trend</h3>
                <span className="text-xs font-mono text-[#BC0202]">6-Week Trajectory</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.score_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" />
                    <XAxis dataKey="week" stroke="#A3A3A3" fontSize={11} />
                    <YAxis stroke="#A3A3A3" fontSize={11} domain={[50, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141414',
                        borderColor: '#830000',
                        color: '#F5F5F5',
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#FF0000"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#BC0202' }}
                      activeDot={{ r: 6, fill: '#FF0000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Violated Rules Table */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-bold text-[#F5F5F5]">Top Violated Guideline Rules</h3>
              <p className="text-xs text-[#A3A3A3]">
                Rules with highest recurrence across submissions. Candidate areas for copywriter education.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px] border-b border-[#2A2A2A]">
                  <tr>
                    <th className="py-3 px-4">Rule Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4 text-right">Violation Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A] text-[#F5F5F5]">
                  {data.top_violated_rules?.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-[#141414]/60">
                      <td className="py-3 px-4 font-semibold text-[#F5F5F5]">{rule.title}</td>
                      <td className="py-3 px-4 text-[#A3A3A3]">{rule.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#BC0202]">
                        {rule.severity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#FF0000]">
                        {rule.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unclear Guideline Suggestions (Frequently Dismissed Rules) */}
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#BC0202]/50 glow-card space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={20} className="text-[#FF0000]" />
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F5]">
                  Unclear Guideline Insights (Optimization Signals)
                </h3>
                <p className="text-xs text-[#A3A3A3]">
                  Rules with unusually high creator dismissal rates. Indicates ambiguous wording or impractical constraints.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {data.unclear_guidelines?.map((ug, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#141414] border border-[#2A2A2A]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-[#F5F5F5] text-xs">{ug.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#830000] text-[#F5F5F5]">
                      {ug.dismissal_count} Dismissals
                    </span>
                  </div>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">{ug.diagnosis}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
