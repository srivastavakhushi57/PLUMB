import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp, Lock, CheckCircle } from 'lucide-react';
import { AITransparencyInfo } from '../types';

interface AIDisclaimerProps {
  transparency?: AITransparencyInfo;
  className?: string;
}

export const AIDisclaimer: React.FC<AIDisclaimerProps> = ({ transparency, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      aria-label="AI Governance & Transparency Notice"
      className={`rounded-lg border border-[#830000]/60 bg-[#0A0A0A] p-3 text-xs text-[#F5F5F5] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#BC0202] shrink-0" aria-hidden="true" />
          <span className="font-semibold tracking-wide text-[#F5F5F5]">
            AI GOVERNANCE NOTICE:
          </span>
          <span className="text-[#A3A3A3]">
            AI recommendations are not infallible. Final publication authority rests strictly with authorized humans.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors shrink-0 underline"
        >
          <span>{expanded ? 'Hide Details' : 'Transparency Info'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#2A2A2A] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded bg-[#141414] border border-[#2A2A2A]">
            <span className="text-[#A3A3A3] block text-[11px]">ACTIVE MODEL</span>
            <span className="font-mono text-[#F5F5F5] font-semibold">
              {transparency?.model_used || 'Gemini 2.5 Flash'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#141414] border border-[#2A2A2A]">
            <span className="text-[#A3A3A3] block text-[11px]">GROUNDING RULES</span>
            <span className="font-mono text-[#F5F5F5] font-semibold flex items-center gap-1">
              <CheckCircle size={12} className="text-[#BC0202]" />
              {transparency?.grounding_rules_provided || 8} Active Guidelines
            </span>
          </div>

          <div className="p-2 rounded bg-[#141414] border border-[#2A2A2A]">
            <span className="text-[#A3A3A3] block text-[11px]">CONFIDENTIAL GUARD</span>
            <span className="font-mono text-[#F5F5F5] font-semibold flex items-center gap-1">
              <Lock size={12} className="text-[#A3A3A3]" />
              {transparency?.confidential_rules_excluded ? `${transparency.confidential_rules_excluded} Hidden from External` : 'Enforced via RBAC'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#141414] border border-[#2A2A2A]">
            <span className="text-[#A3A3A3] block text-[11px]">UNCERTAINTY PROTOCOL</span>
            <span className="font-mono text-[#BC0202] font-semibold">
              Needs Verification Only
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
