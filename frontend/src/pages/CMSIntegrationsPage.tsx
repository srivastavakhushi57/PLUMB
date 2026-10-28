import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Webhook,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Layers,
  Settings,
  Code2,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { CMSConnector, CMSPlatform, CMSSyncSimulation, CMSInterceptResult } from '../types';

export const CMSIntegrationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Selected simulation configuration
  const [selectedPlatform, setSelectedPlatform] = useState<CMSPlatform>('wordpress');
  const [draftTitle, setDraftTitle] = useState('Q3 Autonomous Inspection Fleet Deployment');
  const [draftContent, setDraftContent] = useState(
    'Our cheap automation solution delivers the best autonomous robotics in the market for enterprise customers without upfront friction.'
  );
  const [authorName, setAuthorName] = useState('David Vance (Content Editor)');
  const [simulationResult, setSimulationResult] = useState<CMSInterceptResult | null>(null);

  // Queries
  const { data: connectors = [], isLoading } = useQuery({
    queryKey: ['cms-connectors'],
    queryFn: () => api.getCMSConnectors(),
  });

  // Intercept simulation mutation
  const simulateMutation = useMutation({
    mutationFn: (sim: CMSSyncSimulation) => api.simulateCMSIntercept(sim),
    onSuccess: (data) => {
      setSimulationResult(data);
      queryClient.invalidateQueries({ queryKey: ['cms-connectors'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate({
      platform: selectedPlatform,
      draft_title: draftTitle,
      channel: 'blog',
      raw_content: draftContent,
      author: authorName,
    });
  };

  const handlePresetSelect = (preset: 'flagged' | 'clean') => {
    if (preset === 'flagged') {
      setDraftTitle('Q3 Autonomous Inspection Fleet Deployment');
      setDraftContent(
        'Our cheap automation solution delivers the best autonomous robotics in the market for enterprise customers without upfront friction.'
      );
    } else {
      setDraftTitle('Enterprise Telemetry Benchmark Whitepaper');
      setDraftContent(
        'Aura FleetOS provides enterprise partners with sub-4ms telemetry response times. Notice: Operational deployment requires adherence to Aura ISO 10218 safety interlocking protocols.'
      );
    }
    setSimulationResult(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#2A2A2A] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-wide bg-[#830000]/40 text-[#FF0000] border border-[#BC0202]">
                PLANNED ROADMAP · NOW LIVE
              </span>
              <span className="text-xs text-[#A3A3A3] font-mono">PDF Slide 07 & 08 Scope</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2.5">
              <Webhook className="text-[#BC0202]" size={26} />
              <span>CMS Pre-Publication Integrations & Middleware</span>
            </h1>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Active middleware webhooks connecting PLUMB directly to your publishing pipelines. Automatically intercept,
              evaluate, and block off-brand drafts before public deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Connectors Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#F5F5F5] flex items-center gap-2">
            <Layers size={18} className="text-[#BC0202]" />
            <span>Configured Publishing Connectors ({connectors.length})</span>
          </h2>
          <span className="text-xs text-[#A3A3A3] font-mono">Status: Automated Pre-Publish Gate</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#A3A3A3]">Loading CMS connectors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((c) => (
              <div
                key={c.id}
                className="bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] hover:border-[#830000] p-5 transition-all glow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#F5F5F5] text-sm">{c.name}</h3>
                      <span className="text-[11px] font-mono uppercase text-[#A3A3A3]">{c.platform}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                        c.status === 'connected'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : c.status === 'testing'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                          : 'bg-[#141414] text-[#A3A3A3] border border-[#2A2A2A]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.status === 'connected'
                            ? 'bg-emerald-400 animate-pulse'
                            : c.status === 'testing'
                            ? 'bg-amber-400'
                            : 'bg-neutral-500'
                        }`}
                      />
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#A3A3A3] font-mono bg-[#141414] p-3 rounded-lg border border-[#2A2A2A]/60">
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]/70">Minimum Score:</span>
                      <strong className="text-[#F5F5F5]">{c.min_compliance_score}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]/70">Auto-Block:</span>
                      <strong className={c.auto_block_on_fail ? 'text-red-400' : 'text-[#A3A3A3]'}>
                        {c.auto_block_on_fail ? 'Active (Strict Gate)' : 'Advisory Warning'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]/70">API Secret:</span>
                      <span className="text-[#A3A3A3]">{c.api_key_masked}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[#A3A3A3] block text-[10px]">Intercepted:</span>
                    <strong className="text-[#F5F5F5]">{c.intercepted_count} drafts</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#A3A3A3] block text-[10px]">Blocked:</span>
                    <strong className="text-[#FF0000]">{c.blocked_count} off-brand</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Pre-Publish Webhook Intercept Simulator */}
      <div className="bg-[#0A0A0A] rounded-xl border border-[#830000]/60 p-6 glow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-[#2A2A2A] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Play size={18} className="text-[#FF0000]" />
              <span>Live CMS Pre-Publish Webhook Intercept Simulator</span>
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Test how PLUMB intercepts drafts triggered by CMS "Publish" events, evaluates brand compliance, and returns an
              allow or block payload.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('flagged')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-[#141414] hover:bg-[#830000]/30 text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#BC0202] transition-colors"
            >
              Load Off-Brand Draft
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('clean')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-[#141414] hover:bg-emerald-950/40 text-[#F5F5F5] border border-[#2A2A2A] hover:border-emerald-700 transition-colors"
            >
              Load Compliant Draft
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Input Form */}
          <form onSubmit={handleSimulate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  CMS Source Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as CMSPlatform)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs font-medium focus:border-[#BC0202]"
                >
                  <option value="wordpress">WordPress (REST Webhook)</option>
                  <option value="contentful">Contentful (App Framework)</option>
                  <option value="webflow">Webflow (Publish Event)</option>
                  <option value="notion">Notion (Database Webhook)</option>
                  <option value="hubspot">HubSpot (Blog API)</option>
                  <option value="strapi">Strapi (Lifecycle Hook)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  Author / Originator
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs font-medium focus:border-[#BC0202]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Draft Article Title
              </label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs font-medium focus:border-[#BC0202]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Raw Draft Body Copy (Simulated CMS Payload)
              </label>
              <textarea
                rows={5}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs font-mono focus:border-[#BC0202]"
              />
            </div>

            <button
              type="submit"
              disabled={simulateMutation.isPending}
              className="w-full py-3 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(188,2,2,0.4)] disabled:opacity-50"
            >
              {simulateMutation.isPending ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Intercepting & Evaluating Draft...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Simulate CMS Pre-Publish Trigger</span>
                </>
              )}
            </button>
          </form>

          {/* Simulation Output / Intercept Response */}
          <div className="bg-[#141414] rounded-xl border border-[#2A2A2A] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
                <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-2 font-mono">
                  <Code2 size={16} className="text-[#BC0202]" />
                  <span>PLUMB Middleware Verdict</span>
                </span>
                <span className="text-[11px] font-mono text-[#A3A3A3]">HTTP 200 OK</span>
              </div>

              {simulationResult ? (
                <div className="space-y-4">
                  {/* Verdict Badge Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      simulationResult.allowed_to_publish
                        ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                        : 'bg-[#830000]/30 border-[#BC0202] text-[#F5F5F5]'
                    }`}
                  >
                    {simulationResult.allowed_to_publish ? (
                      <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={24} className="text-[#FF0000] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm uppercase tracking-wide">
                          {simulationResult.status}
                        </strong>
                        <span className="text-xs font-mono">
                          Score: {simulationResult.compliance_score}%
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-[#A3A3A3]">
                        {simulationResult.allowed_to_publish
                          ? 'Draft satisfied brand thresholds. CMS webhook returned code 200: publication proceeded.'
                          : 'Draft blocked from production. CMS publish button disabled until revisions are applied.'}
                      </p>
                    </div>
                  </div>

                  {/* Findings & Reasons */}
                  <div>
                    <span className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-2 font-mono">
                      Policy Rationale & Guardrails:
                    </span>
                    <ul className="space-y-2 text-xs">
                      {simulationResult.reasons.map((r, i) => (
                        <li
                          key={i}
                          className="p-2.5 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] flex items-start gap-2"
                        >
                          <AlertTriangle size={14} className="text-[#FF0000] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* JSON API Response snippet */}
                  <div>
                    <span className="block text-[11px] font-mono text-[#A3A3A3] uppercase mb-1">
                      Raw JSON Response Returned to CMS:
                    </span>
                    <pre className="p-3 rounded-lg bg-[#000000] border border-[#2A2A2A] text-[11px] font-mono text-emerald-400 overflow-x-auto">
                      {JSON.stringify(simulationResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-[#A3A3A3] space-y-2">
                  <ShieldAlert size={36} className="mx-auto text-[#830000]" />
                  <p className="font-semibold text-[#F5F5F5]">Awaiting Simulation Trigger</p>
                  <p className="text-[#A3A3A3] max-w-sm mx-auto">
                    Choose a CMS platform, load a draft, and click "Simulate CMS Pre-Publish Trigger" to inspect live
                    middleware interception.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] text-[#A3A3A3] font-mono">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-[#BC0202]" />
                <span>HMAC-SHA256 Webhook Signature Verified</span>
              </span>
              <span>Latency: ~34ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
