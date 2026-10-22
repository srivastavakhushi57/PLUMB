import React from 'react';
import {
  FileEdit,
  Loader2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { SubmissionStatus } from '../types';

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[#A3A3A3]/60 text-[#A3A3A3] bg-[#0A0A0A] ${className}`}>
          <FileEdit size={13} aria-hidden="true" />
          <span>Draft</span>
        </span>
      );

    case 'analysing':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[#BC0202] text-[#F5F5F5] bg-[#830000]/30 animate-pulse ${className}`}>
          <Loader2 size={13} className="animate-spin text-[#FF0000]" aria-hidden="true" />
          <span>Analysing...</span>
        </span>
      );

    case 'findings_ready':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[#BC0202] text-[#F5F5F5] bg-[#141414] ${className}`}>
          <Eye size={13} className="text-[#BC0202]" aria-hidden="true" />
          <span>Findings Ready</span>
        </span>
      );

    case 'in_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#BC0202] text-[#F5F5F5] bg-[#830000]/40 shadow-[0_0_8px_rgba(188,2,2,0.3)] ${className}`}>
          <Clock size={13} className="text-[#FF0000]" aria-hidden="true" />
          <span>In Review</span>
        </span>
      );

    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border-2 border-[#F5F5F5] text-[#F5F5F5] bg-[#0A0A0A] shadow-[0_0_10px_rgba(255,255,255,0.2)] ${className}`}>
          <CheckCircle2 size={14} className="text-[#F5F5F5]" aria-hidden="true" />
          <span>APPROVED</span>
        </span>
      );

    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#BC0202] text-[#F5F5F5] border border-[#FF0000] shadow-[0_0_10px_rgba(255,0,0,0.4)] ${className}`}>
          <XCircle size={14} className="text-[#F5F5F5]" aria-hidden="true" />
          <span>REJECTED</span>
        </span>
      );

    case 'changes_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#830000] text-[#F5F5F5] border border-[#BC0202] ${className}`}>
          <RotateCcw size={13} className="text-[#F5F5F5]" aria-hidden="true" />
          <span>Changes Requested</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#A3A3A3] bg-[#141414] rounded ${className}`}>
          <HelpCircle size={12} />
          <span>{status}</span>
        </span>
      );
  }
};
