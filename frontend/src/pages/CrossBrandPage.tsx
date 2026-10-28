import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  GitBranch,
  Shield,
  CheckCircle2,
  Sliders,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { SubBrand, GuidelineRule } from '../types';

export const CrossBrandPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandIndustry, setNewBrandIndustry] = useState('');
  const [newBrandVoice, setNewBrandVoice] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#8B5CF6');

  // Queries
  const { data: subBrands = [] } = useQuery({
    queryKey: ['sub-brands'],
    queryFn: () => api.getSubBrands(),
  });

  const { data: activeBrand } = useQuery({
    queryKey: ['active-brand'],
    queryFn: () => api.getActiveBrand(),
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['rules'],
    queryFn: () => api.getRules(),
  });

  // Switch brand mutation
  const switchMutation = useMutation({
    mutationFn: (id: string) => api.switchSubBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-brand'] });
      queryClient.invalidateQueries({ queryKey: ['sub-brands'] });
    },
  });

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<SubBrand>) => api.createSubBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-brands'] });
      setShowAddModal(false);
      setNewBrandName('');
      setNewBrandIndustry('');
      setNewBrandVoice('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newBrandName,
      industry: newBrandIndustry,
      voice_description: newBrandVoice,
      brand_color: newBrandColor,
      tone_attributes: ['Modern', 'Innovative', 'Customer-Centric'],
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#2A2A2A] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-wide bg-[#830000]/40 text-[#FF0000] border border-[#BC0202]">
                PLANNED ROADMAP · NOW LIVE
              </span>
              <span className="text-xs text-[#A3A3A3] font-mono">PDF Slide 07 Scope</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2.5">
              <Building2 className="text-[#BC0202]" size={26} />
              <span>Cross-Brand Governance & Policy Hierarchy</span>
            </h1>
            <p className="mt-1 text-sm text-[#A3A3A3]">
              Govern multi-brand portfolios with global policy inheritance. Global regulations are inherited by all
              subsidiaries, while allowing tailored local brand voices and domain rules.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-xs font-bold tracking-wide transition-all shadow-[0_0_12px_rgba(188,2,2,0.4)] flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Add Subsidiary Brand</span>
          </button>
        </div>
      </div>

      {/* Brand Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {subBrands.map((b) => {
          const isCurrent = activeBrand?.id === b.id;
          return (
            <div
              key={b.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between glow-card ${
                isCurrent
                  ? 'bg-[#141414] border-[#FF0000] ring-1 ring-[#FF0000]/50'
                  : 'bg-[#0A0A0A] border-[#2A2A2A] hover:border-[#830000]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                      style={{ backgroundColor: b.brand_color }}
                    />
                    <div>
                      <h3 className="font-bold text-[#F5F5F5] text-sm leading-tight">{b.name}</h3>
                      <span className="text-[10px] font-mono text-[#A3A3A3]">{b.industry}</span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#830000]/50 text-[#FF0000] border border-[#BC0202] font-bold">
                      Active Target
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A3A3A3] mb-4 italic line-clamp-2 leading-relaxed">
                  "{b.voice_description}"
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {b.tone_attributes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#000000] text-[#F5F5F5] border border-[#2A2A2A] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-[#A3A3A3] font-mono bg-[#000000] p-3 rounded-lg border border-[#2A2A2A]">
                  <div className="flex justify-between">
                    <span>Inherited Global Policies:</span>
                    <strong className="text-[#F5F5F5]">{b.inherited_global_rules_count} rules</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Brand-Specific Rules:</span>
                    <strong className="text-[#F5F5F5]">{b.brand_specific_rules_count} rules</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Compliance:</span>
                    <strong className="text-emerald-400">{b.compliance_avg}%</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#2A2A2A]">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#FF0000] font-semibold">
                    <CheckCircle2 size={14} />
                    <span>Selected Workspace Target</span>
                  </div>
                ) : (
                  <button
                    onClick={() => switchMutation.mutate(b.id)}
                    className="w-full py-1.5 rounded bg-[#141414] hover:bg-[#830000]/30 text-xs font-semibold text-[#F5F5F5] border border-[#2A2A2A] hover:border-[#BC0202] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Switch to this Brand Target</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Policy Inheritance Matrix */}
      <div className="bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] p-6 glow-card">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <GitBranch size={18} className="text-[#BC0202]" />
              <span>Policy Inheritance & Cascade Rules</span>
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Policies cascaded from parent brand <strong className="text-[#F5F5F5]">Aura Global Holdings</strong> to{' '}
              <strong className="text-[#FF0000]">{activeBrand?.name}</strong>.
            </p>
          </div>
          <span className="text-xs font-mono text-[#A3A3A3] flex items-center gap-1.5 bg-[#141414] px-2.5 py-1 rounded border border-[#2A2A2A]">
            <Globe size={13} className="text-[#BC0202]" />
            <span>Parent Org: Aura Global Holdings</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A3A3A3]">
            <thead className="bg-[#141414] text-[11px] uppercase font-mono tracking-wider text-[#A3A3A3] border-b border-[#2A2A2A]">
              <tr>
                <th className="py-2.5 px-4">Rule Title & Criteria</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Origin & Authority</th>
                <th className="py-2.5 px-4">Inheritance Status</th>
                <th className="py-2.5 px-4">Target Brand Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]/60 font-sans">
              {rules.slice(0, 6).map((r, i) => {
                const isGlobal = i % 2 === 0;
                return (
                  <tr key={r.id} className="hover:bg-[#141414]/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#F5F5F5] block">{r.title}</span>
                      <span className="text-[11px] text-[#A3A3A3]/80 line-clamp-1">{r.description}</span>
                    </td>
                    <td className="py-3 px-4 font-mono uppercase text-[10px] text-[#F5F5F5]">{r.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                          isGlobal
                            ? 'bg-[#830000]/30 text-[#FF0000] border border-[#BC0202]'
                            : 'bg-[#141414] text-[#A3A3A3] border border-[#2A2A2A]'
                        }`}
                      >
                        {isGlobal ? <Globe size={10} /> : <Building2 size={10} />}
                        {isGlobal ? 'Global Policy (Mandatory)' : 'Subsidiary Override'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 size={12} />
                        <span>Cascading (Active)</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-[#A3A3A3]">
                        {isGlobal ? 'Enforced across all brands' : 'Local brand tuning'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub-Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-md w-full p-6 shadow-2xl glow-card animate-fadeIn">
            <h3 className="text-base font-bold text-[#F5F5F5] mb-1 flex items-center gap-2">
              <Building2 size={18} className="text-[#BC0202]" />
              <span>Create Subsidiary Brand</span>
            </h3>
            <p className="text-xs text-[#A3A3A3] mb-5">
              Configure a new subsidiary in the Aura Global hierarchy. It will immediately inherit all foundational
              safety, legal, and claims guardrails.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Aerospace Systems"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs focus:border-[#BC0202]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Aviation & Defense"
                  value={newBrandIndustry}
                  onChange={(e) => setNewBrandIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs focus:border-[#BC0202]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  Brand Voice Tone Summary
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mission-critical, ultra-precise, FAA-compliant..."
                  value={newBrandVoice}
                  onChange={(e) => setNewBrandVoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs focus:border-[#BC0202]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                  Brand Identity Accent Hex
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newBrandColor}
                    onChange={(e) => setNewBrandColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer border border-[#2A2A2A]"
                  />
                  <input
                    type="text"
                    value={newBrandColor}
                    onChange={(e) => setNewBrandColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-xs font-bold tracking-wide transition-all shadow-[0_0_10px_rgba(188,2,2,0.4)]"
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Subsidiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
