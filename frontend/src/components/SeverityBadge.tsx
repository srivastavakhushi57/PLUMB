import React from 'react';
import { Info, AlertTriangle, AlertCircle, OctagonAlert } from 'lucide-react';
import { SeverityType } from '../types';

interface SeverityBadgeProps {
  severity: SeverityType;
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
  className = '',
}) => {
  switch (severity.toLowerCase() as SeverityType) {
    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#A3A3A3] text-[#F5F5F5] bg-[#141414] ${className}`}
          title="Severity: Low (minor phrasing, stylistic polish)"
        >
          {showIcon && <Info size={13} className="text-[#A3A3A3]" aria-hidden="true" />}
          <span>LOW</span>
        </span>
      );

    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#830000] text-[#F5F5F5] border border-[#BC0202]/40 ${className}`}
          title="Severity: Medium (brand tone deviation, unverified claims)"
        >
          {showIcon && <AlertTriangle size={13} className="text-[#F5F5F5]" aria-hidden="true" />}
          <span>MEDIUM</span>
        </span>
      );

    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#BC0202] text-[#F5F5F5] border border-[#FF0000]/30 shadow-[0_0_8px_rgba(188,2,2,0.35)] ${className}`}
          title="Severity: High (banned words, channel violation, unsubstantiated superlative)"
        >
          {showIcon && <AlertCircle size={13} className="text-[#F5F5F5]" aria-hidden="true" />}
          <span>HIGH</span>
        </span>
      );

    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF0000] text-[#000000] border border-[#FFFFFF]/40 shadow-[0_0_14px_rgba(255,0,0,0.7)] animate-pulse ${className}`}
          title="Severity: Critical (legal disclosure missing, prohibited absolute guarantee, confidential policy violation)"
        >
          {showIcon && <OctagonAlert size={14} className="text-[#000000] stroke-[2.5]" aria-hidden="true" />}
          <span className="tracking-wide">CRITICAL</span>
        </span>
      );

    default:
      return (
        <span className="px-2 py-0.5 text-xs text-[#A3A3A3] bg-[#141414] rounded">
          {severity.toUpperCase()}
        </span>
      );
  }
};
