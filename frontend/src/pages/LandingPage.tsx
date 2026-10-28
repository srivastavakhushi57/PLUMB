import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  FileCheck2,
  Lock,
  Search,
  Scale,
  Cpu,
  Eye,
  GitPullRequest,
  Users,
  Compass,
  FileText,
  Sliders
} from 'lucide-react';
import { ShieldLogo } from '../components/ShieldLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] selection:bg-[#BC0202] selection:text-[#FFFFFF]">
      {/* Top Header */}
      <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldLogo size={36} />
            <div>
              <span className="text-xl font-bold tracking-wider text-[#F5F5F5]">PLUMB</span>
              <span className="text-[10px] text-[#A3A3A3] block -mt-0.5 tracking-wide">
                Every Detail. On Brand.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(188,2,2,0.4)] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-b border-[#2A2A2A]">
        {/* Glow ambient background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FF0000 0%, #830000 60%, transparent 80%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#830000] bg-[#141414] text-xs font-mono uppercase tracking-widest text-[#FF0000] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-pulse" />
            01 · PRE-PUBLICATION GOVERNANCE
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F5F5] leading-tight">
            Every Detail.{' '}
            <span className="text-[#FF0000] drop-shadow-[0_0_25px_rgba(255,0,0,0.6)]">
              On Brand.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#A3A3A3] max-w-3xl mx-auto leading-relaxed">
            The AI-assisted brand-governance and content-compliance platform that sits between{' '}
            <strong className="text-[#F5F5F5]">Draft</strong> and{' '}
            <strong className="text-[#F5F5F5]">Review</strong>. Cites approved rules, grounds claims
            in empirical facts, and keeps humans in final control.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#BC0202] hover:bg-[#FF0000] text-[#FFFFFF] font-semibold text-base tracking-wide transition-all shadow-[0_0_20px_rgba(188,2,2,0.5)] hover:shadow-[0_0_30px_rgba(255,0,0,0.8)]"
            >
              <span>Explore Live Interactive App</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="#workflow"
              className="px-6 py-3.5 rounded-lg border border-[#830000] bg-[#0A0A0A] hover:bg-[#141414] text-[#F5F5F5] font-semibold text-base transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Workflow Sequence Pill */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-xs font-mono text-[#A3A3A3]">
            <span>Draft</span>
            <span className="text-[#BC0202]">➔</span>
            <span className="px-2 py-0.5 rounded bg-[#BC0202] text-[#FFFFFF] font-bold">
              PLUMB Check
            </span>
            <span className="text-[#BC0202]">➔</span>
            <span>Review</span>
            <span className="text-[#BC0202]">➔</span>
            <span>Publish</span>
          </div>
        </div>
      </section>

      {/* Problem Section (Lucidpress Stats) */}
      <section className="py-20 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
              02 · THE CONSISTENCY CRISIS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">
              Off-brand content costs revenue and erodes trust.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#830000]/60 glow-card">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#FF0000] mb-2 font-mono">
                77%
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">
                Off-Brand Content Prevalence
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                Of companies frequently struggle with rogue, inconsistent, or off-brand content
                published across decentralized channels.
              </p>
              <div className="text-xs font-mono text-[#A3A3A3] pt-3 border-t border-[#2A2A2A]">
                Citation: Lucidpress State of Brand Consistency Report (2021, 450+ respondents)
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#830000]/60 glow-card">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#FF0000] mb-2 font-mono">
                +33%
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">
                Measurable Revenue Lift
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                Estimated revenue increase attributed to maintaining consistent brand presentation
                across all customer-facing touchpoints.
              </p>
              <div className="text-xs font-mono text-[#A3A3A3] pt-3 border-t border-[#2A2A2A]">
                Citation: Lucidpress Brand Consistency Benchmark Study (2019)
              </div>
            </div>

            {/* Stat Card 3 (Clearly labelled Research to be conducted) */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#2A2A2A] relative">
              <div className="inline-block px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#830000]/40 text-[#FF0000] border border-[#BC0202]/50 mb-3">
                Research to be conducted
              </div>
              <div className="text-3xl font-extrabold text-[#A3A3A3] mb-2 font-mono">
                TBD · Empirical
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">
                Pre-Publication Governance ROI
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                Field investigation to measure reduction in PR redactions and legal remediation costs
                when automated pre-flight checks sit before approval.
              </p>
              <div className="text-xs font-mono text-[#A3A3A3] pt-3 border-t border-[#2A2A2A]">
                Planned study: Formal evaluation on 20+ enterprise pilot deployments.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types / RBAC */}
      <section className="py-20 border-b border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
              03 · ROLE-BASED ACCESS CONTROL
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">
              Designed for the entire publication team.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]/60">
              <div className="w-10 h-10 rounded-lg bg-[#830000]/40 flex items-center justify-center text-[#FF0000] mb-4">
                <Sliders size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5]">Brand Manager (Admin)</h3>
              <p className="text-sm text-[#A3A3A3] mt-2">
                Authors guideline rules, manages approved empirical facts, uploads brand assets, and
                inspects organizational compliance analytics.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]/60">
              <div className="w-10 h-10 rounded-lg bg-[#830000]/40 flex items-center justify-center text-[#FF0000] mb-4">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5]">Creator (Copy / Social)</h3>
              <p className="text-sm text-[#A3A3A3] mt-2">
                Drafts content, runs real-time PLUMB pre-flight checks, inspects cited evidence,
                applies suggestions, and resubmits.
              </p>
              <div className="mt-3 text-xs text-[#A3A3A3] flex items-center gap-1.5 font-mono">
                <Lock size={12} className="text-[#BC0202]" />
                <span>External agency mode hides confidential items.</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]/60">
              <div className="w-10 h-10 rounded-lg bg-[#830000]/40 flex items-center justify-center text-[#FF0000] mb-4">
                <UserCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F5]">Reviewer (Compliance)</h3>
              <p className="text-sm text-[#A3A3A3] mt-2">
                Evaluates approval queue with diff comparisons and cited fact evidence; approves or
                requests revisions with mandatory comments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Step Interactive Workflow */}
      <section id="workflow" className="py-20 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
              04 · THE 10-STEP WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">
              Human discretion backed by automated grounding.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '01',
                actor: 'Human',
                title: 'Draft Creation',
                desc: 'Creator authors copy or visual asset in their preferred tool.',
              },
              {
                step: '02',
                actor: 'Human',
                title: 'Content Ingestion',
                desc: 'Creator submits draft into PLUMB specifying target channel (social, blog, ad).',
              },
              {
                step: '03',
                actor: 'System',
                title: 'Deterministic Rule Engine',
                desc: 'Exact constraint checks execute (banned words, required phrases, casing, regex).',
              },
              {
                step: '04',
                actor: 'System',
                title: 'Grounding & Retrieval',
                desc: 'Embeddings / similarity ranker pulls top-k relevant guideline rules & approved facts.',
              },
              {
                step: '05',
                actor: 'System',
                title: 'Contextual AI Evaluation',
                desc: 'LLM performs tone analysis, detects unsupported claims, and cites rule/fact IDs.',
              },
              {
                step: '06',
                actor: 'System',
                title: 'Span Locator & Scoring',
                desc: 'Server-side offsets anchor findings to exact characters; explainable score generated.',
              },
              {
                step: '07',
                actor: 'Human',
                title: 'Creator Revision',
                desc: 'Creator reviews findings, applies corrections, or uses Brand Voice Rewrite diff.',
              },
              {
                step: '08',
                actor: 'Human',
                title: 'Review Submission',
                desc: 'Creator submits vetted version to organizational review queue.',
              },
              {
                step: '09',
                actor: 'Human',
                title: 'Compliance Evaluation',
                desc: 'Reviewer inspects version diff, cited evidence, and open findings.',
              },
              {
                step: '10',
                actor: 'Human',
                title: 'Decision & Audit Record',
                desc: 'Reviewer approves or requests changes with mandatory rationale comment.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-[#141414] border border-[#2A2A2A] hover:border-[#830000] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#FF0000]">{item.step}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F5]">{item.title}</h4>
                    <p className="text-xs text-[#A3A3A3]">{item.desc}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-bold shrink-0 ${
                    item.actor === 'Human'
                      ? 'bg-[#BC0202] text-[#FFFFFF]'
                      : 'bg-[#1C1C1C] text-[#A3A3A3] border border-[#2A2A2A]'
                  }`}
                >
                  [{item.actor}]
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Roadmap */}
      <section className="py-20 border-b border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
              05 · FEATURES ROADMAP
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">
              Built with clarity on what is live today.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core MVP */}
            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#BC0202]">
              <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold bg-[#BC0202] text-[#FFFFFF] mb-4">
                Core MVP (Active)
              </div>
              <ul className="space-y-2 text-xs text-[#F5F5F5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Deterministic Rule Engine (Regex, Banned, Casing)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Top-K Retrieval & Grounding Context</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Structured AI finding generator with Server-side Spans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Side-by-side interactive findings inspector</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Apply all low-risk fixes & Brand Voice Rewrite diff</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#BC0202]" />
                  <span>Reviewer approval queue with mandatory rationale</span>
                </li>
              </ul>
            </div>

            {/* Extended */}
            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#830000]">
              <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold bg-[#830000] text-[#FFFFFF] mb-4">
                Extended (Active)
              </div>
              <ul className="space-y-2 text-xs text-[#F5F5F5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>Unsupported promotional claim detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>Approved facts verification with validity dates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>WCAG 2.1 AA/AAA contrast ratio calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>Image dominant palette extraction & brand alignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>Flesch-Kincaid & Gunning Fog readability scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#FF0000]" />
                  <span>Unclear guideline detection (frequently dismissed rules)</span>
                </li>
              </ul>
            </div>

            {/* Future Scope - Integrated & Live */}
            <div className="p-6 rounded-xl bg-[#0A0A0A] border border-[#BC0202] shadow-[0_0_20px_rgba(188,2,2,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold bg-[#BC0202] text-[#FFFFFF]">
                  Integrated & Live
                </div>
                <span className="text-[10px] font-mono text-[#00FF66] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#F5F5F5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF66]" />
                  <span><strong>Multilingual brand engine</strong> (ES, FR, DE, JA, HI)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF66]" />
                  <span><strong>CMS Pre-Publish Middleware</strong> (WordPress, Webflow, Notion)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF66]" />
                  <span><strong>Cross-Brand Governance</strong> (Aura Holdings hierarchy & overrides)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF66]" />
                  <span><strong>Validation Gate & Benchmark Lab</strong> (20-sample regression suite)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00FF66]" />
                  <span><strong>SHA-256 Merkle Chain</strong> cryptographic audit immutability</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-[#2A2A2A]">
                <Link
                  to="/login"
                  className="text-[11px] font-mono text-[#BC0202] hover:text-[#FF0000] flex items-center gap-1 font-bold transition-colors"
                >
                  Explore integrated modules <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Design & Security Commitments */}
      <section className="py-16 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
            06 · RESPONSIBLE DESIGN COMMITMENTS
          </span>
          <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">
            Honest declarations on privacy, security, and AI safety
          </h3>
          <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-2xl mx-auto">
            Security features (RBAC, confidential rule concealment, immutable audit logs, minimal
            retention purging) are implemented as{' '}
            <strong className="text-[#F5F5F5]">active design commitments</strong> in code, not as
            completed third-party SOC 2 certifications. AI suggestions are explicitly marked with
            uncertainty flags; unverified claims are labelled as{' '}
            <span className="text-[#FF0000] font-mono">needs verification</span>, never declared
            false without grounded proof.
          </p>
        </div>
      </section>

      {/* Team Credits */}
      <section className="py-20 border-b border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[#BC0202] block mb-2">
            07 · ENGINEERING TEAM
          </span>
          <h2 className="text-3xl font-bold text-[#F5F5F5] mb-12">
            Crafted with precision by the PLUMB team.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg bg-[#0A0A0A] border border-[#830000]/60">
              <h4 className="font-bold text-[#F5F5F5] text-sm">Khushi Srivastava</h4>
              <p className="text-xs text-[#BC0202] mt-1 font-mono">Team Leader & Integration</p>
            </div>

            <div className="p-5 rounded-lg bg-[#0A0A0A] border border-[#830000]/60">
              <h4 className="font-bold text-[#F5F5F5] text-sm">Juvyansh Tyagi</h4>
              <p className="text-xs text-[#BC0202] mt-1 font-mono">AI & Backend Architecture</p>
            </div>

            <div className="p-5 rounded-lg bg-[#0A0A0A] border border-[#830000]/60">
              <h4 className="font-bold text-[#F5F5F5] text-sm">Mahi Arora</h4>
              <p className="text-xs text-[#BC0202] mt-1 font-mono">Frontend & UX Engineering</p>
            </div>

            <div className="p-5 rounded-lg bg-[#0A0A0A] border border-[#830000]/60">
              <h4 className="font-bold text-[#F5F5F5] text-sm">Naitik Singh Bhadoriya</h4>
              <p className="text-xs text-[#BC0202] mt-1 font-mono">Database, Workflow & Testing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#000000] text-center text-xs text-[#A3A3A3]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldLogo size={24} glow={false} />
          <span className="font-bold text-[#F5F5F5]">PLUMB</span>
          <span>— Every Detail. On Brand.</span>
        </div>
        <p className="font-mono text-[#A3A3A3]">
          ABES Engineering College · Hackathon 2026
        </p>
      </footer>
    </div>
  );
};
