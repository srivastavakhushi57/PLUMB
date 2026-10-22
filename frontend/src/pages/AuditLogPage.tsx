import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Trash2,
  Lock,
  UserX,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePurgeRetention = async () => {
    if (!confirm('Purge all draft and unapproved submissions older than 90 days?')) return;
    setPurging(true);
    try {
      const res = await api.purgeRetention(90);
      alert(res.message);
      await loadLogs();
    } catch (err: any) {
      alert(err.message || 'Purge failed');
    } finally {
      setPurging(false);
    }
  };

  const handleDeleteMyData = async () => {
    if (!confirm('Permanently wipe all private draft submissions authored by your account?')) return;
    setErasing(true);
    try {
      const res = await api.deleteMyData();
      alert(res.message);
      await loadLogs();
    } catch (err: any) {
      alert(err.message || 'Erasure failed');
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Responsible Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
            Immutable Audit Log & Data Governance
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Cryptographically timestamped audit trail of all governance events, rule revisions, and human approval decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePurgeRetention}
            disabled={purging}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#830000] text-[#F5F5F5] text-xs font-semibold border border-[#2A2A2A] hover:border-[#BC0202] transition-colors"
          >
            <Clock size={14} className="text-[#BC0202]" />
            <span>{purging ? 'Purging...' : 'Purge Retention (90 Days)'}</span>
          </button>

          <button
            onClick={handleDeleteMyData}
            disabled={erasing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#830000] hover:bg-[#BC0202] text-[#FFFFFF] text-xs font-semibold transition-colors"
          >
            <UserX size={14} />
            <span>{erasing ? 'Wiping...' : 'Delete My Draft Data'}</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck size={16} className="text-[#BC0202]" />
            <span className="font-bold text-[#F5F5F5]">Append-Only System Log</span>
            <span className="text-[#A3A3A3]">({logs.length} logged actions)</span>
          </div>
          <button
            onClick={loadLogs}
            className="p-1 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#A3A3A3]">Loading audit events...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A3A3A3]">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#A3A3A3] font-mono uppercase tracking-wider text-[11px] border-b border-[#2A2A2A]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] text-[#F5F5F5] font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141414]/60">
                    <td className="py-3 px-4 text-[#A3A3A3] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F5]">
                      {log.actor_name || 'System / Auto'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#FF0000] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{log.entity_type}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#A3A3A3]">
                      {JSON.stringify(log.metadata_json)}
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
