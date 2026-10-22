import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  Trash2,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BrandProfile,
  GuidelineRule,
  ApprovedFact,
  BrandAsset,
  CategoryType,
  SeverityType
} from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const GuidelinesPage: React.FC = () => {
  const { role, isExternal } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'profile' | 'assets'>('rules');

  const [rules, setRules] = useState<GuidelineRule[]>([]);
  const [facts, setFacts] = useState<ApprovedFact[]>([]);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Modal
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleCategory, setNewRuleCategory] = useState<CategoryType>('terminology');
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<SeverityType>('medium');
  const [newRuleConfidential, setNewRuleConfidential] = useState(false);
  const [newRuleAvoid, setNewRuleAvoid] = useState('');
  const [newRulePrefer, setNewRulePrefer] = useState('');

  // Ingest Document Modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestFile, setIngestFile] = useState<File | null>(null);
  const [ingestResult, setIngestResult] = useState<any>(null);
  const [ingesting, setIngesting] = useState(false);

  // New Fact Modal
  const [showAddFactModal, setShowAddFactModal] = useState(false);
  const [newFactTopic, setNewFactTopic] = useState('');
  const [newFactStatement, setNewFactStatement] = useState('');
  const [newFactSource, setNewFactSource] = useState('');
  const [newFactUrl, setNewFactUrl] = useState('');
  const [newFactDaysValid, setNewFactDaysValid] = useState(365);
  const [newFactConfidential, setNewFactConfidential] = useState(false);

  useEffect(() => {
    loadAll();
  }, [role]);

  async function loadAll() {
    setLoading(true);
    try {
      const [rData, fData, pData, aData] = await Promise.all([
        api.getRules(),
        api.getFacts(),
        api.getBrandProfile().catch(() => null),
        api.getAssets().catch(() => []),
      ]);
      setRules(rData);
      setFacts(fData);
      setProfile(pData);
      setAssets(aData);
    } catch (err) {
      console.error('Failed to load guidelines:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patternConfig: Record<string, any> = {};
      if (newRuleAvoid && newRulePrefer) {
        patternConfig.terminology_mappings = { [newRuleAvoid]: newRulePrefer };
      }
      await api.createRule({
        category: newRuleCategory,
        title: newRuleTitle,
        description: newRuleDesc,
        rule_type: newRuleAvoid ? 'deterministic' : 'contextual',
        pattern_config: patternConfig,
        severity_default: newRuleSeverity,
        is_confidential: newRuleConfidential,
      });
      setShowAddRuleModal(false);
      setNewRuleTitle('');
      setNewRuleDesc('');
      setNewRuleAvoid('');
      setNewRulePrefer('');
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create rule');
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const until = new Date();
      until.setDate(until.getDate() + Number(newFactDaysValid));
      await api.createFact({
        topic: newFactTopic,
        statement: newFactStatement,
        source_name: newFactSource,
        source_url: newFactUrl,
        valid_until: until.toISOString().split('T')[0],
        is_confidential: newFactConfidential,
      });
      setShowAddFactModal(false);
      setNewFactTopic('');
      setNewFactStatement('');
      setNewFactSource('');
      setNewFactUrl('');
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create fact');
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestFile) return;
    setIngesting(true);
    try {
      const res = await api.ingestDocument(ingestFile);
      setIngestResult(res);
    } catch (err: any) {
      alert(err.message || 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guideline rule?')) return;
    try {
      await api.deleteRule(id);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule');
    }
  };

  const handleDeleteFact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this approved fact?')) return;
    try {
      await api.deleteFact(id);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete fact');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
            Brand Governance Guidelines & Grounding Repository
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Manage deterministic rules, approved empirical facts, voice attributes, and brand assets.
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowIngestModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F5F5] text-xs font-semibold border border-[#830000] transition-colors"
            >
              <Upload size={14} className="text-[#FF0000]" />
              <span>Ingest Document (AI)</span>
            </button>
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-xs font-semibold shadow-[0_0_12px_rgba(188,2,2,0.4)] transition-all"
            >
              <Plus size={14} />
              <span>New Rule</span>
            </button>
            <button
              onClick={() => setShowAddFactModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#830000] hover:bg-[#BC0202] text-[#FFFFFF] text-xs font-semibold transition-colors"
            >
              <Plus size={14} />
              <span>Add Approved Fact</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#2A2A2A] text-xs font-medium">
        <button
          onClick={() => setActiveTab('rules')}
          className={`py-2.5 px-4 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-[#FF0000] text-[#FF0000] bg-[#141414]/50'
              : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F5]'
          }`}
        >
          <span>Guideline Rules</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#2A2A2A] text-[#F5F5F5]">
            {rules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`py-2.5 px-4 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'facts'
              ? 'border-[#FF0000] text-[#FF0000] bg-[#141414]/50'
              : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F5]'
          }`}
        >
          <span>Approved Facts & Evidence</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#2A2A2A] text-[#F5F5F5]">
            {facts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-4 font-semibold transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#FF0000] text-[#FF0000] bg-[#141414]/50'
              : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F5]'
          }`}
        >
          Brand Voice Profile
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`py-2.5 px-4 font-semibold transition-colors border-b-2 ${
            activeTab === 'assets'
              ? 'border-[#FF0000] text-[#FF0000] bg-[#141414]/50'
              : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F5]'
          }`}
        >
          Brand Assets
        </button>
      </div>

      {/* Tab 1: Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#830000] transition-colors relative"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#141414] border border-[#2A2A2A] text-[#A3A3A3]">
                      {rule.category}
                    </span>
                    <SeverityBadge severity={rule.severity_default} />
                    {rule.is_confidential && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#830000] text-[#F5F5F5]">
                        <Lock size={10} />
                        <span>CONFIDENTIAL</span>
                      </span>
                    )}
                  </div>

                  {role === 'admin' && (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-[#A3A3A3] hover:text-[#FF0000] p-1 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#F5F5F5]">{rule.title}</h3>
                <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                  {rule.description}
                </p>

                {/* Pattern info */}
                {rule.pattern_config && Object.keys(rule.pattern_config).length > 0 && (
                  <div className="mt-3 p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[11px] font-mono text-[#A3A3A3]">
                    <span className="text-[#BC0202] font-semibold block mb-0.5">Constraint Pattern:</span>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(rule.pattern_config, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] text-[#A3A3A3] font-mono">
                  <span>Type: {rule.rule_type}</span>
                  <span>Version {rule.version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Approved Facts */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs text-[#A3A3A3] flex items-center gap-2">
            <Info size={16} className="text-[#BC0202] shrink-0" />
            <span>
              Approved facts serve as ground truth for empirical claims. Claims not matched to an
              approved fact are flagged as <strong className="text-[#FF0000]">"needs verification"</strong>, never declared false.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className={`p-5 rounded-xl bg-[#0A0A0A] border transition-colors ${
                  fact.is_expired ? 'border-[#FF0000]/60' : 'border-[#2A2A2A] hover:border-[#830000]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#141414] border border-[#2A2A2A] text-[#BC0202] font-semibold">
                      {fact.topic}
                    </span>
                    {fact.is_expired && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0000] text-[#000000] animate-pulse">
                        OUTDATED / EXPIRED
                      </span>
                    )}
                    {fact.is_confidential && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#830000] text-[#F5F5F5]">
                        <Lock size={10} />
                        <span>INTERNAL ONLY</span>
                      </span>
                    )}
                  </div>

                  {role === 'admin' && (
                    <button
                      onClick={() => handleDeleteFact(fact.id)}
                      className="text-[#A3A3A3] hover:text-[#FF0000] p-1 transition-colors"
                      title="Delete fact"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#F5F5F5] font-medium mt-2 leading-relaxed">
                  "{fact.statement}"
                </p>

                <div className="mt-4 pt-3 border-t border-[#2A2A2A] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#A3A3A3]">
                    <span>Source: {fact.source_name}</span>
                    {fact.source_url && (
                      <a
                        href={fact.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#BC0202] hover:text-[#FF0000] flex items-center gap-1"
                      >
                        <span>Verify Source</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#A3A3A3] font-mono">
                    <Calendar size={12} />
                    <span>
                      Valid: {fact.valid_from} to {fact.valid_until || 'Indefinite'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Brand Voice Profile */}
      {activeTab === 'profile' && profile && (
        <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]/60 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#F5F5F5]">{profile.name} Brand Voice</h3>
            <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
              {profile.voice_description}
            </p>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#BC0202] block mb-2">
              Tone Attributes
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.tone_attributes.map((attr, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#141414] border border-[#BC0202] text-[#F5F5F5]"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
            <div className="p-4 rounded-lg bg-[#141414] border border-[#2A2A2A]">
              <h4 className="text-xs font-bold font-mono uppercase text-[#F5F5F5] mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#BC0202]" />
                <span>What to Do (Brand Dos)</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#A3A3A3]">
                {profile.do_list.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#BC0202] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-[#2A2A2A]">
              <h4 className="text-xs font-bold font-mono uppercase text-[#FF0000] mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-[#FF0000]" />
                <span>What to Avoid (Brand Don'ts)</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#A3A3A3]">
                {profile.dont_list.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#FF0000] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Brand Assets */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#141414] text-[#A3A3A3]">
                {asset.type}
              </span>
              <h4 className="text-sm font-bold text-[#F5F5F5] mt-2">{asset.name}</h4>
              <p className="text-xs font-mono text-[#FF0000] mt-1 break-all">
                {asset.value_or_path}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5]">Create New Guideline Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Category</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as CategoryType)}
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                >
                  <option value="terminology">Terminology</option>
                  <option value="tone">Tone</option>
                  <option value="messaging">Messaging</option>
                  <option value="legal">Legal & Compliance</option>
                  <option value="claims">Empirical Claims</option>
                  <option value="visual">Visual</option>
                  <option value="accessibility">Accessibility</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  required
                  placeholder="e.g. Prohibit Deprecating Cost Terms"
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Description</label>
                <textarea
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain the brand rationale..."
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Avoid Word / Phrase</label>
                  <input
                    type="text"
                    value={newRuleAvoid}
                    onChange={(e) => setNewRuleAvoid(e.target.value)}
                    placeholder="e.g. cheap"
                    className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Preferred Alternative</label>
                  <input
                    type="text"
                    value={newRulePrefer}
                    onChange={(e) => setNewRulePrefer(e.target.value)}
                    placeholder="e.g. cost-effective"
                    className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Default Severity</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as SeverityType)}
                    className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="confidentialRule"
                    checked={newRuleConfidential}
                    onChange={(e) => setNewRuleConfidential(e.target.checked)}
                    className="rounded bg-[#141414] border-[#2A2A2A] text-[#BC0202]"
                  />
                  <label htmlFor="confidentialRule" className="text-[#F5F5F5] font-semibold">
                    Confidential (Hide from external creators)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Fact */}
      {showAddFactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5]">Add Approved Fact & Grounding Source</h3>
            <form onSubmit={handleCreateFact} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Topic / Domain</label>
                <input
                  type="text"
                  value={newFactTopic}
                  onChange={(e) => setNewFactTopic(e.target.value)}
                  required
                  placeholder="e.g. Uptime Benchmark"
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block text-[#A3A3A3] mb-1 font-semibold">Approved Statement</label>
                <textarea
                  value={newFactStatement}
                  onChange={(e) => setNewFactStatement(e.target.value)}
                  required
                  rows={3}
                  placeholder="Exact validated claim..."
                  className="w-full p-2.5 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Source Name</label>
                  <input
                    type="text"
                    value={newFactSource}
                    onChange={(e) => setNewFactSource(e.target.value)}
                    required
                    placeholder="e.g. ISO 9001 Audit Report"
                    className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#A3A3A3] mb-1 font-semibold">Source URL (Optional)</label>
                  <input
                    type="url"
                    value={newFactUrl}
                    onChange={(e) => setNewFactUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowAddFactModal(false)}
                  className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-[#FFFFFF] font-semibold"
                >
                  Save Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ingest Document */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#830000] rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5]">Upload Guideline Document</h3>
            <p className="text-xs text-[#A3A3A3]">
              Upload a brand document (PDF, TXT, DOCX). AI extracts proposed draft rules for admin
              review and approval before they become active.
            </p>

            <form onSubmit={handleIngestDocument} className="space-y-4 text-xs">
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={(e) => setIngestFile(e.target.files?.[0] || null)}
                className="w-full p-3 rounded bg-[#141414] border border-[#2A2A2A] text-[#F5F5F5]"
              />

              <button
                type="submit"
                disabled={!ingestFile || ingesting}
                className="w-full py-2.5 rounded bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>{ingesting ? 'Analyzing with AI...' : 'Extract Draft Rules'}</span>
              </button>
            </form>

            {ingestResult && (
              <div className="mt-4 p-3 rounded bg-[#141414] border border-[#2A2A2A] text-xs space-y-2">
                <span className="text-[#FF0000] font-bold block">Extraction Complete:</span>
                <p className="text-[#A3A3A3]">{ingestResult.message}</p>
                <div className="space-y-2 mt-2">
                  {ingestResult.proposed_rules?.map((pr: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-[#0A0A0A] border border-[#2A2A2A]">
                      <span className="font-bold text-[#F5F5F5]">{pr.title}</span>
                      <p className="text-[#A3A3A3] text-[11px]">{pr.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowIngestModal(false);
                  setIngestResult(null);
                }}
                className="px-4 py-2 rounded bg-[#141414] text-[#A3A3A3] hover:text-[#F5F5F5] text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
