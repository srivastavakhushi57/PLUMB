import {
  AuthToken,
  UserProfile,
  BrandProfile,
  GuidelineRule,
  ApprovedFact,
  BrandAsset,
  Submission,
  SubmissionVersion,
  AnalysisRun,
  Approval,
  AuditLogItem,
  AnalyticsData,
  ContrastCheckResult,
  RoleType,
  FindingStatus,
  Finding
} from '../types';

const STORAGE_KEY = 'plumb_demo_store_v1';

// Pre-seeded Demo Users
const DEMO_USERS: Record<string, UserProfile> = {
  'admin@plumb.brand': {
    id: 'u-admin-01',
    org_id: 'org-aura-01',
    full_name: 'Eleanor Vance',
    email: 'admin@plumb.brand',
    role: 'admin',
    is_external: false,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  'creator@plumb.brand': {
    id: 'u-creator-01',
    org_id: 'org-aura-01',
    full_name: 'Marcus Chen',
    email: 'creator@plumb.brand',
    role: 'creator',
    is_external: false,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  'reviewer@plumb.brand': {
    id: 'u-reviewer-01',
    org_id: 'org-aura-01',
    full_name: 'Sarah Jenkins',
    email: 'reviewer@plumb.brand',
    role: 'reviewer',
    is_external: false,
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
  'agency@partner.agency': {
    id: 'u-agency-01',
    org_id: 'org-aura-01',
    full_name: 'Alex Rivera',
    email: 'agency@partner.agency',
    role: 'creator',
    is_external: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
};

const DEFAULT_BRAND_PROFILE: BrandProfile = {
  id: 'bp-aura-01',
  org_id: 'org-aura-01',
  name: 'Aura Robotics Inc.',
  voice_description:
    'Authoritative, precise, visionary, yet rigorously grounded in engineering safety. We communicate with scientific clarity and uncompromising professional restraint.',
  tone_attributes: ['Authoritative', 'Engineered', 'Visionary', 'Direct', 'Safety-Focused'],
  audience:
    'Enterprise manufacturing leaders, plant operations directors, industrial automation engineers, and safety compliance executives.',
  do_list: [
    'Use concrete engineering metrics (latency, payload, uptime)',
    'Cite verified third-party benchmarks and ISO standards',
    'Emphasise human-machine collaboration over pure replacement',
    'Include safety disclaimers whenever autonomous operations are discussed',
  ],
  dont_list: [
    "Never use corporate buzzwords like 'synergistic' or 'bleeding-edge paradigm shift'",
    'Never claim 100% risk-free operations or absolute zero-error rates',
    "Do not refer to enterprise clients merely as 'customers' — use 'enterprise partners'",
    "Never make ungrounded superlative claims like 'the best' or '#1'",
  ],
  updated_at: new Date().toISOString(),
};

const DEFAULT_RULES: GuidelineRule[] = [
  {
    id: 'r-01',
    org_id: 'org-aura-01',
    category: 'terminology',
    title: 'Forbidden Term: "cheap"',
    description: 'Never describe Aura technology or pricing as "cheap". Use "cost-effective" or "capital-efficient".',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['cheap'], replacement: 'cost-effective' },
    severity_default: 'high',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-02',
    org_id: 'org-aura-01',
    category: 'terminology',
    title: 'Forbidden Term: "bargain-basement"',
    description: 'Colloquial discount descriptors undermine Aura\'s industrial prestige.',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['bargain-basement', 'budget-grade'], replacement: 'accessible' },
    severity_default: 'medium',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-03',
    org_id: 'org-aura-01',
    category: 'terminology',
    title: 'Preferred Nomenclature: "Enterprise Partners"',
    description: 'Refer to B2B clients as "enterprise partners", never just "customers".',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['customers'], replacement: 'enterprise partners' },
    severity_default: 'low',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-04',
    org_id: 'org-aura-01',
    category: 'terminology',
    title: 'Software Platform Naming: "Aura FleetOS"',
    description: 'Use the official product name "Aura FleetOS", never "AuraOS" or "Fleet OS".',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['AuraOS', 'Fleet OS'], replacement: 'Aura FleetOS' },
    severity_default: 'medium',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-05',
    org_id: 'org-aura-01',
    category: 'tone',
    title: 'Prohibit Artificial Urgency & Hype',
    description: 'Avoid aggressive marketing urgency tropes ("hurry", "limited time only", "act fast").',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['hurry', 'limited time only', 'act fast', 'don\'t miss out'], replacement: 'explore our schedule' },
    severity_default: 'high',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-06',
    org_id: 'org-aura-01',
    category: 'tone',
    title: 'Avoid Inflated Corporate Jargon',
    description: 'Replace empty buzzwords ("synergistic", "paradigm shift", "bleeding-edge") with concrete vocabulary.',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['synergistic', 'paradigm shift', 'bleeding-edge'], replacement: 'advanced' },
    severity_default: 'low',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-07',
    org_id: 'org-aura-01',
    category: 'tone',
    title: 'Prohibit ALL-CAPS Text Blocks',
    description: 'Do not use blocks of capitalised text for emphasis. Maintain professional sentence case.',
    rule_type: 'deterministic',
    pattern_config: { regex_pattern: '\\b[A-Z]{4,}(?:\\s+[A-Z]{4,}){2,}\\b', message: 'ALL-CAPS screaming violates professional brand presentation.' },
    severity_default: 'low',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-08',
    org_id: 'org-aura-01',
    category: 'legal',
    title: 'Mandatory Autonomous Safety Disclaimer',
    description: 'Any commercial text describing autonomous operations must include the safety protocol notice.',
    rule_type: 'deterministic',
    pattern_config: {
      required_phrases: [{ trigger_keyword: 'autonomous', phrase: 'Notice: Operational deployment requires adherence to Aura ISO 10218 safety interlocking protocols.' }]
    },
    severity_default: 'critical',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-09',
    org_id: 'org-aura-01',
    category: 'messaging',
    title: 'Internal Tier Margin Confidentiality',
    description: 'Internal margin tier calculations and contractual discount percentages are strictly confidential.',
    rule_type: 'deterministic',
    pattern_config: { banned_words: ['internal tier discount', 'margin formula', 'cost-plus 12%'] },
    severity_default: 'critical',
    is_confidential: true,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r-10',
    org_id: 'org-aura-01',
    category: 'messaging',
    title: 'Channel Length Limitation: Social (LinkedIn/X)',
    description: 'Social posts must be concise and engaging (maximum 600 characters).',
    rule_type: 'deterministic',
    pattern_config: { max_length: 600 },
    severity_default: 'medium',
    is_confidential: false,
    active: true,
    version: 1,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const DEFAULT_FACTS: ApprovedFact[] = [
  {
    id: 'f-01',
    org_id: 'org-aura-01',
    topic: 'Mean Time Between Failures (MTBF)',
    statement: 'Aura SentinelBot v3 delivers an audited 45,000-hour MTBF across continuous multi-axis operation.',
    source_name: 'TÜV SÜD Industrial Reliability Certification Report 2025',
    source_url: 'https://aura.internal/certs/tuv-mtbf-2025',
    valid_from: '2025-01-01',
    valid_until: '2027-12-31',
    is_confidential: false,
    is_expired: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f-02',
    org_id: 'org-aura-01',
    topic: 'Edge Telemetry Latency',
    statement: 'FleetOS edge controller maintains sub-4ms cycle response time over deterministic industrial TSN networks.',
    source_name: 'IEEE TSN Interoperability Whitepaper v4.2',
    source_url: 'https://aura.internal/whitepapers/edge-latency',
    valid_from: '2025-01-01',
    valid_until: '2027-12-31',
    is_confidential: false,
    is_expired: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f-03',
    org_id: 'org-aura-01',
    topic: 'Market Analyst Ranking (Outdated)',
    statement: 'Named Visionary in the 2024 Industrial Robotics Market Report.',
    source_name: 'Gartner Industrial Robotics Magic Quadrant 2024',
    source_url: 'https://gartner.com/robotics-2024',
    valid_from: '2024-01-01',
    valid_until: '2024-12-31', // Expired!
    is_confidential: false,
    is_expired: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f-04',
    org_id: 'org-aura-01',
    topic: 'Energy Efficiency Benchmarks',
    statement: 'Energy consumption is reduced by 28% compared to traditional hydraulic inspection gantries.',
    source_name: 'Green Manufacturing Initiative Audit',
    source_url: 'https://aura.internal/sustainability',
    valid_from: '2024-03-01',
    valid_until: '2027-12-31',
    is_confidential: false,
    is_expired: false,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ASSETS: BrandAsset[] = [
  {
    id: 'a-01',
    org_id: 'org-aura-01',
    type: 'color',
    name: 'Aura Crimson Primary',
    value_or_path: '#BC0202',
    metadata_json: { role: 'primary_accent', wcag_on_white: '4.6:1' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'a-02',
    org_id: 'org-aura-01',
    type: 'color',
    name: 'Aura Deep Onyx Base',
    value_or_path: '#000000',
    metadata_json: { role: 'background_primary' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'a-03',
    org_id: 'org-aura-01',
    type: 'color',
    name: 'Aura Pure White Accent',
    value_or_path: '#FFFFFF',
    metadata_json: { role: 'text_primary' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'a-04',
    org_id: 'org-aura-01',
    type: 'logo',
    name: 'Aura Fleet Shield Mark',
    value_or_path: '/assets/logo-shield.svg',
    metadata_json: { min_clear_space_px: 24, min_width_px: 120 },
    created_at: new Date().toISOString(),
  },
];

// Sample pre-seeded submissions
const DEFAULT_SUBMISSIONS: { submission: Submission; versions: SubmissionVersion[]; analysis: Record<string, AnalysisRun> }[] = [
  {
    submission: {
      id: 'sub-01',
      org_id: 'org-aura-01',
      creator_id: 'u-creator-01',
      creator_name: 'Marcus Chen',
      title: 'Q3 Aura SentinelBot Launch Announcement',
      channel: 'blog',
      content_type: 'text',
      status: 'findings_ready',
      current_version: 1,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      latest_score: 64,
      open_findings_count: 3,
    },
    versions: [
      {
        id: 'ver-01-1',
        submission_id: 'sub-01',
        version_no: 1,
        text_content:
          'Our cheap automation solution helps enterprise customers cut overhead with the best autonomous robotics in the market. HURRY AND ORDER TODAY before slots fill up!',
        created_by: 'u-creator-01',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        change_note: 'Initial draft for review',
      },
    ],
    analysis: {},
  },
  {
    submission: {
      id: 'sub-02',
      org_id: 'org-aura-01',
      creator_id: 'u-creator-01',
      creator_name: 'Marcus Chen',
      title: 'Aura FleetOS Telemetry Product Feature',
      channel: 'social',
      content_type: 'text',
      status: 'in_review',
      current_version: 2,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      latest_score: 88,
      open_findings_count: 1,
    },
    versions: [
      {
        id: 'ver-02-1',
        submission_id: 'sub-02',
        version_no: 1,
        text_content: 'We provide our customers with cheap robotics.',
        created_by: 'u-creator-01',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        change_note: 'Initial draft',
      },
      {
        id: 'ver-02-2',
        submission_id: 'sub-02',
        version_no: 2,
        text_content:
          'Aura FleetOS provides enterprise partners with sub-4ms telemetry response times across high-throughput production lines. Notice: Operational deployment requires adherence to Aura ISO 10218 safety interlocking protocols.',
        created_by: 'u-creator-01',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        change_note: 'Applied terminology and legal disclosure corrections',
      },
    ],
    analysis: {},
  },
  {
    submission: {
      id: 'sub-03',
      org_id: 'org-aura-01',
      creator_id: 'u-creator-01',
      creator_name: 'Marcus Chen',
      title: 'Enterprise Safety Compliance Whitepaper Excerpt',
      channel: 'web',
      content_type: 'text',
      status: 'approved',
      current_version: 1,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      latest_score: 95,
      open_findings_count: 0,
    },
    versions: [
      {
        id: 'ver-03-1',
        submission_id: 'sub-03',
        version_no: 1,
        text_content:
          'Aura SentinelBot v3 delivers an audited 45,000-hour MTBF across continuous multi-axis operation in manufacturing facilities. Notice: Operational deployment requires adherence to Aura ISO 10218 safety interlocking protocols.',
        created_by: 'u-creator-01',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        change_note: 'Final verified release draft',
      },
    ],
    analysis: {},
  },
];

class DemoStore {
  private currentUser: UserProfile = DEMO_USERS['admin@plumb.brand'];
  private brandProfile: BrandProfile = { ...DEFAULT_BRAND_PROFILE };
  private rules: GuidelineRule[] = [...DEFAULT_RULES];
  private facts: ApprovedFact[] = [...DEFAULT_FACTS];
  private assets: BrandAsset[] = [...DEFAULT_ASSETS];
  private submissions: { submission: Submission; versions: SubmissionVersion[]; analysis: Record<string, AnalysisRun> }[] = [
    ...DEFAULT_SUBMISSIONS,
  ];
  private auditLogs: AuditLogItem[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.auditLogs.length === 0) {
      this.auditLogs = [
        {
          id: 'log-01',
          org_id: 'org-aura-01',
          actor_id: 'u-admin-01',
          actor_name: 'Eleanor Vance',
          action: 'RULE_UPDATED',
          entity_type: 'guideline_rule',
          entity_id: 'r-08',
          metadata_json: { title: 'Mandatory Autonomous Safety Disclaimer', version: 1 },
          created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
        {
          id: 'log-02',
          org_id: 'org-aura-01',
          actor_id: 'u-reviewer-01',
          actor_name: 'Sarah Jenkins',
          action: 'SUBMISSION_APPROVED',
          entity_type: 'submission',
          entity_id: 'sub-03',
          metadata_json: { title: 'Enterprise Safety Compliance Whitepaper Excerpt', score: 95 },
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ];
    }
  }

  private saveToStorage() {
    try {
      const data = {
        currentUser: this.currentUser,
        brandProfile: this.brandProfile,
        rules: this.rules,
        facts: this.facts,
        assets: this.assets,
        submissions: this.submissions,
        auditLogs: this.auditLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors in private browsing
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.currentUser) this.currentUser = parsed.currentUser;
        if (parsed.brandProfile) this.brandProfile = parsed.brandProfile;
        if (parsed.rules) this.rules = parsed.rules;
        if (parsed.facts) this.facts = parsed.facts;
        if (parsed.assets) this.assets = parsed.assets;
        if (parsed.submissions) this.submissions = parsed.submissions;
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
      }
    } catch {
      // Fallback to defaults
    }
  }

  // Auth
  async login(email: string): Promise<AuthToken> {
    const user = DEMO_USERS[email] || {
      id: `u-${Date.now()}`,
      org_id: 'org-aura-01',
      full_name: email.split('@')[0],
      email,
      role: (email.includes('admin') ? 'admin' : email.includes('reviewer') ? 'reviewer' : 'creator') as RoleType,
      is_external: email.includes('agency'),
      created_at: new Date().toISOString(),
    };
    this.currentUser = user;
    this.saveToStorage();

    return {
      access_token: `mock-jwt-token-${user.role}-${Date.now()}`,
      token_type: 'bearer',
      role: user.role,
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      is_external: user.is_external,
      org_id: user.org_id,
    };
  }

  async getMe(): Promise<UserProfile> {
    return this.currentUser;
  }

  async switchRole(role: RoleType, is_external: boolean = false): Promise<AuthToken> {
    const emailKey = is_external
      ? 'agency@partner.agency'
      : role === 'admin'
      ? 'admin@plumb.brand'
      : role === 'reviewer'
      ? 'reviewer@plumb.brand'
      : 'creator@plumb.brand';

    return this.login(emailKey);
  }

  // Brand Guidelines
  async getBrandProfile(): Promise<BrandProfile> {
    return this.brandProfile;
  }

  async updateBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
    this.brandProfile = { ...this.brandProfile, ...data, updated_at: new Date().toISOString() };
    this.saveToStorage();
    return this.brandProfile;
  }

  async getRules(category?: string): Promise<GuidelineRule[]> {
    let list = this.rules;
    if (this.currentUser.is_external) {
      list = list.filter((r) => !r.is_confidential);
    }
    if (category) {
      list = list.filter((r) => r.category === category);
    }
    return list;
  }

  async createRule(rule: Partial<GuidelineRule>): Promise<GuidelineRule> {
    const newRule: GuidelineRule = {
      id: `r-${Date.now()}`,
      org_id: 'org-aura-01',
      category: rule.category || 'terminology',
      title: rule.title || 'New Rule',
      description: rule.description || '',
      rule_type: rule.rule_type || 'deterministic',
      pattern_config: rule.pattern_config || {},
      severity_default: rule.severity_default || 'medium',
      is_confidential: !!rule.is_confidential,
      active: rule.active !== undefined ? rule.active : true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.rules.unshift(newRule);
    this.saveToStorage();
    return newRule;
  }

  async updateRule(id: string, updates: Partial<GuidelineRule>): Promise<GuidelineRule> {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.rules[idx] = {
        ...this.rules[idx],
        ...updates,
        version: this.rules[idx].version + 1,
        updated_at: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.rules[idx];
    }
    throw new Error('Rule not found');
  }

  async deleteRule(id: string): Promise<{ message: string }> {
    this.rules = this.rules.filter((r) => r.id !== id);
    this.saveToStorage();
    return { message: 'Rule deleted successfully' };
  }

  async ingestDocument(file: File): Promise<any> {
    const filename = file.name || 'document.txt';
    return {
      message: `Successfully parsed guideline document "${filename}". 3 candidate rules generated for review.`,
      proposed_rules: [
        {
          category: 'messaging',
          title: `Brand Precision Standard (${filename})`,
          description: 'Always describe robotic system responsiveness in deterministic milliseconds.',
          pattern_config: { required_phrases: [{ trigger_keyword: 'latency', phrase: 'sub-4ms' }] },
          severity_default: 'medium',
        },
        {
          category: 'terminology',
          title: 'Autonomous System Nomenclature',
          description: 'Specify SentinelBot series number when referring to mobile inspection units.',
          pattern_config: { banned_words: ['robot rover'], replacement: 'SentinelBot v3' },
          severity_default: 'low',
        },
      ],
    };
  }

  async getFacts(): Promise<ApprovedFact[]> {
    let list = this.facts;
    if (this.currentUser.is_external) {
      list = list.filter((f) => !f.is_confidential);
    }
    return list;
  }

  async createFact(fact: Partial<ApprovedFact>): Promise<ApprovedFact> {
    const newFact: ApprovedFact = {
      id: `f-${Date.now()}`,
      org_id: 'org-aura-01',
      topic: fact.topic || 'Fact Topic',
      statement: fact.statement || '',
      source_name: fact.source_name || 'Internal Source',
      source_url: fact.source_url,
      valid_from: fact.valid_from || new Date().toISOString().split('T')[0],
      valid_until: fact.valid_until,
      is_confidential: !!fact.is_confidential,
      is_expired: false,
      created_at: new Date().toISOString(),
    };
    this.facts.unshift(newFact);
    this.saveToStorage();
    return newFact;
  }

  async deleteFact(id: string): Promise<{ message: string }> {
    this.facts = this.facts.filter((f) => f.id !== id);
    this.saveToStorage();
    return { message: 'Fact deleted successfully' };
  }

  async getAssets(): Promise<BrandAsset[]> {
    return this.assets;
  }

  // Submissions
  async getSubmissions(channel?: string, status_filter?: string): Promise<Submission[]> {
    let list = this.submissions.map((s) => ({
      ...s.submission,
      latest_version: s.versions[s.versions.length - 1],
    }));
    if (channel) list = list.filter((s) => s.channel === channel);
    if (status_filter) list = list.filter((s) => s.status === status_filter);
    return list;
  }

  async createSubmission(payload: {
    title: string;
    channel: string;
    content_type?: string;
    text_content: string;
  }): Promise<Submission> {
    const subId = `sub-${Date.now()}`;
    const verId = `ver-${subId}-1`;

    const newVersion: SubmissionVersion = {
      id: verId,
      submission_id: subId,
      version_no: 1,
      text_content: payload.text_content,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      change_note: 'Initial submission draft',
    };

    const newSub: Submission = {
      id: subId,
      org_id: 'org-aura-01',
      creator_id: this.currentUser.id,
      creator_name: this.currentUser.full_name,
      title: payload.title,
      channel: (payload.channel || 'blog') as any,
      content_type: (payload.content_type || 'text') as any,
      status: 'draft',
      current_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      latest_version: newVersion,
      latest_score: undefined,
      open_findings_count: 0,
    };

    this.submissions.unshift({
      submission: newSub,
      versions: [newVersion],
      analysis: {},
    });
    this.saveToStorage();
    return newSub;
  }

  async getSubmission(id: string): Promise<{ submission: Submission; versions: SubmissionVersion[] }> {
    const item = this.submissions.find((s) => s.submission.id === id);
    if (!item) throw new Error('Submission not found');
    return {
      submission: {
        ...item.submission,
        latest_version: item.versions[item.versions.length - 1],
      },
      versions: item.versions,
    };
  }

  async createVersion(
    subId: string,
    payload: { text_content: string; change_note?: string }
  ): Promise<SubmissionVersion> {
    const item = this.submissions.find((s) => s.submission.id === subId);
    if (!item) throw new Error('Submission not found');

    const nextV = item.versions.length + 1;
    const newVer: SubmissionVersion = {
      id: `ver-${subId}-${nextV}`,
      submission_id: subId,
      version_no: nextV,
      text_content: payload.text_content,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      change_note: payload.change_note || `Version ${nextV} revision`,
    };

    item.versions.push(newVer);
    item.submission.current_version = nextV;
    item.submission.updated_at = new Date().toISOString();
    item.submission.status = 'draft';
    this.saveToStorage();
    return newVer;
  }

  async getVersionDiff(subId: string, vFrom: number, vTo: number) {
    const item = this.submissions.find((s) => s.submission.id === subId);
    if (!item) throw new Error('Submission not found');
    const verFrom = item.versions.find((v) => v.version_no === vFrom) || item.versions[0];
    const verTo = item.versions.find((v) => v.version_no === vTo) || item.versions[item.versions.length - 1];

    const linesFrom = verFrom.text_content.split('\n');
    const linesTo = verTo.text_content.split('\n');
    const diff_lines = linesTo.map((l, i) => (linesFrom[i] !== l ? `+ ${l}` : `  ${l}`));

    return {
      submission_id: subId,
      v_from: verFrom.version_no,
      v_to: verTo.version_no,
      text_from: verFrom.text_content,
      text_to: verTo.text_content,
      diff_lines,
      change_note: verTo.change_note,
    };
  }

  async submitForReview(subId: string) {
    const item = this.submissions.find((s) => s.submission.id === subId);
    if (!item) throw new Error('Submission not found');
    item.submission.status = 'in_review';
    item.submission.updated_at = new Date().toISOString();
    this.saveToStorage();
    return { message: 'Submission entered human review queue.', status: 'in_review' };
  }

  async deleteSubmission(id: string) {
    this.submissions = this.submissions.filter((s) => s.submission.id !== id);
    this.saveToStorage();
    return { message: 'Submission deleted' };
  }

  // Client-Side Compliance Engine
  async runAnalysis(versionId: string): Promise<AnalysisRun> {
    let matchedItem: { submission: Submission; versions: SubmissionVersion[]; analysis: Record<string, AnalysisRun> } | undefined;
    let targetVersion: SubmissionVersion | undefined;

    for (const item of this.submissions) {
      const v = item.versions.find((ver) => ver.id === versionId);
      if (v) {
        matchedItem = item;
        targetVersion = v;
        break;
      }
    }

    if (!matchedItem || !targetVersion) {
      // Default fallback version
      targetVersion = {
        id: versionId,
        submission_id: 'sub-demo',
        version_no: 1,
        text_content: 'Aura robotics cheap inspection system.',
        created_by: this.currentUser.id,
        created_at: new Date().toISOString(),
      };
    }

    const text = targetVersion.text_content;
    const findings: Finding[] = [];
    const runId = `run-${Date.now()}`;

    // 1. Evaluate Banned words / Terminology
    for (const rule of this.rules) {
      if (!rule.active) continue;
      const banned = rule.pattern_config?.banned_words || [];
      for (const word of banned) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          findings.push({
            id: `fnd-${Date.now()}-${findings.length}`,
            analysis_run_id: runId,
            category: rule.category,
            severity: rule.severity_default,
            rule_id: rule.id,
            source: 'rule_engine',
            span_start: m.index,
            span_end: m.index + m[0].length,
            excerpt: m[0],
            explanation: `Contains forbidden term "${word}". Policy requires compliant brand vocabulary.`,
            evidence_text: `Rule: ${rule.title}. Prescribed alternative: "${rule.pattern_config.replacement || 'None'}"`,
            suggested_fix: rule.pattern_config?.replacement,
            confidence: 'high',
            needs_verification: false,
            status: 'open',
            created_at: new Date().toISOString(),
            rule_title: rule.title,
          });
        }
      }

      // Check regex screaming
      if (rule.pattern_config?.regex_pattern) {
        try {
          const re = new RegExp(rule.pattern_config.regex_pattern, 'g');
          let m: RegExpExecArray | null;
          while ((m = re.exec(text)) !== null) {
            findings.push({
              id: `fnd-${Date.now()}-${findings.length}`,
              analysis_run_id: runId,
              category: rule.category,
              severity: rule.severity_default,
              rule_id: rule.id,
              source: 'rule_engine',
              span_start: m.index,
              span_end: m.index + m[0].length,
              excerpt: m[0],
              explanation: rule.pattern_config.message || 'Violates formatting rule.',
              evidence_text: `Rule: ${rule.title}`,
              suggested_fix: m[0].toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
              confidence: 'high',
              needs_verification: false,
              status: 'open',
              created_at: new Date().toISOString(),
              rule_title: rule.title,
            });
          }
        } catch {
          // Ignore bad regex
        }
      }

      // Check mandatory disclaimers
      const reqList = rule.pattern_config?.required_phrases || [];
      for (const req of reqList) {
        if (req.trigger_keyword && new RegExp(`\\b${req.trigger_keyword}\\b`, 'i').test(text)) {
          if (!text.toLowerCase().includes(req.phrase.toLowerCase())) {
            findings.push({
              id: `fnd-${Date.now()}-${findings.length}`,
              analysis_run_id: runId,
              category: 'legal',
              severity: 'critical',
              rule_id: rule.id,
              source: 'rule_engine',
              span_start: 0,
              span_end: Math.min(text.length, 45),
              excerpt: text.slice(0, Math.min(text.length, 45)),
              explanation: `Trigger word "${req.trigger_keyword}" requires mandatory legal disclosure: "${req.phrase}".`,
              evidence_text: `Rule: ${rule.title}. Enterprise safety protocol disclosure mandate.`,
              suggested_fix: `${text.trim()}\n\n${req.phrase}`,
              confidence: 'high',
              needs_verification: false,
              status: 'open',
              created_at: new Date().toISOString(),
              rule_title: rule.title,
            });
          }
        }
      }
    }

    // 2. Check Superlative & Unsupported Claims (Flag for verification)
    const claimPatterns = [
      { pattern: /\b(the\s+)?best\b/gi, label: 'Unsubstantiated superlative "best"' },
      { pattern: /(#1|\bnumber\s+one\b|\bno\.?\s*1\b)/gi, label: 'Unverified ranking claim "#1"' },
      { pattern: /\b(100%\s+guaranteed?|zero\s+risk)\b/gi, label: 'Absolute guarantee / zero-risk claim' },
    ];

    for (const { pattern, label } of claimPatterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        findings.push({
          id: `fnd-${Date.now()}-${findings.length}`,
          analysis_run_id: runId,
          category: 'claims',
          severity: 'medium',
          source: 'rule_engine',
          span_start: m.index,
          span_end: m.index + m[0].length,
          excerpt: m[0],
          explanation: `${label}. Flagged for verification against empirical data or verified sources.`,
          evidence_text: 'Core Principle: Unsupported promotional claims are flagged for verification, never declared false without grounding.',
          suggested_fix: 'Replace superlative with specific verified performance metric.',
          confidence: 'high',
          needs_verification: true,
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
    }

    // 3. Check Expired Facts
    for (const fact of this.facts) {
      if (fact.is_expired && text.toLowerCase().includes(fact.topic.toLowerCase().replace(/\(.*?\)/, '').trim())) {
        const start = text.toLowerCase().indexOf(fact.topic.toLowerCase().replace(/\(.*?\)/, '').trim());
        findings.push({
          id: `fnd-${Date.now()}-${findings.length}`,
          analysis_run_id: runId,
          category: 'claims',
          severity: 'high',
          fact_id: fact.id,
          source: 'rule_engine',
          span_start: start,
          span_end: start + 20,
          excerpt: text.slice(start, start + 20),
          explanation: `References approved fact "${fact.topic}", but this fact EXPIRED on ${fact.valid_until}. Needs verification with updated data.`,
          evidence_text: `Source: ${fact.source_name} (Expired ${fact.valid_until})`,
          suggested_fix: 'Verify with up-to-date metrics or update citation.',
          confidence: 'high',
          needs_verification: true,
          status: 'open',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Compute transparent score
    let critDed = 0;
    let highDed = 0;
    let medDed = 0;
    let lowDed = 0;

    for (const f of findings) {
      if (f.severity === 'critical') critDed += 25;
      else if (f.severity === 'high') highDed += 15;
      else if (f.severity === 'medium') medDed += 8;
      else if (f.severity === 'low') lowDed += 3;
    }

    const totalDed = critDed + highDed + medDed + lowDed;
    const finalScore = Math.max(0, 100 - totalDed);

    const run: AnalysisRun = {
      id: runId,
      submission_version_id: versionId,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      model_used: 'DualEngine-Deterministic-MockAI-v2.5',
      rule_engine_version: '2.5.0-client-demo',
      compliance_score: finalScore,
      summary:
        findings.length === 0
          ? 'Content is fully compliant with all brand voice, terminology, and safety guidelines.'
          : `Identified ${findings.length} findings across brand voice, terminology, and legal categories.`,
      scoring_breakdown: {
        base_score: 100,
        critical_deductions: critDed,
        high_deductions: highDed,
        medium_deductions: medDed,
        low_deductions: lowDed,
        total_deductions: totalDed,
        final_score: finalScore,
        formula_explanation: `Score = 100 - (Critical x 25 + High x 15 + Medium x 8 + Low x 3) = ${finalScore}`,
      },
      transparency_info: {
        model_used: 'DualEngine-Deterministic-MockAI-v2.5',
        rule_engine_version: '2.5.0-client-demo',
        grounding_rules_provided: this.rules.length,
        confidential_rules_excluded: this.currentUser.is_external ? 1 : 0,
        approved_facts_provided: this.facts.length,
        disclaimer: 'AI recommendations are advisory. Authorised human reviewers retain sovereign approval authority.',
      },
      findings,
    };

    if (matchedItem) {
      matchedItem.analysis[versionId] = run;
      matchedItem.submission.status = 'findings_ready';
      matchedItem.submission.latest_score = finalScore;
      matchedItem.submission.open_findings_count = findings.filter((f) => f.status === 'open').length;
      this.saveToStorage();
    }

    return run;
  }

  async getLatestAnalysis(versionId: string): Promise<AnalysisRun> {
    for (const item of this.submissions) {
      if (item.analysis[versionId]) {
        return item.analysis[versionId];
      }
    }
    return this.runAnalysis(versionId);
  }

  async updateFindingStatus(findingId: string, status: FindingStatus, dismissed_reason?: string) {
    for (const item of this.submissions) {
      for (const run of Object.values(item.analysis)) {
        const f = run.findings.find((x) => x.id === findingId);
        if (f) {
          f.status = status;
          if (dismissed_reason) f.dismissed_reason = dismissed_reason;
          item.submission.open_findings_count = run.findings.filter((x) => x.status === 'open').length;
          this.saveToStorage();
          return { message: `Finding status updated to ${status}` };
        }
      }
    }
    return { message: 'Status updated' };
  }

  async submitFindingFeedback(_findingId: string, rating: string, _comment?: string) {
    return { message: `Feedback received: ${rating}` };
  }

  async applyAllLowRisk(versionId: string) {
    const analysis = await this.getLatestAnalysis(versionId);
    let item: { submission: Submission; versions: SubmissionVersion[]; analysis: Record<string, AnalysisRun> } | undefined;
    let targetVer: SubmissionVersion | undefined;

    for (const sub of this.submissions) {
      const v = sub.versions.find((x) => x.id === versionId);
      if (v) {
        item = sub;
        targetVer = v;
        break;
      }
    }

    if (!item || !targetVer) throw new Error('Version not found');

    let revised = targetVer.text_content;
    const lowRiskFindings = analysis.findings.filter(
      (f) => f.status === 'open' && (f.severity === 'low' || f.severity === 'medium') && f.suggested_fix
    );

    for (const f of lowRiskFindings) {
      if (f.suggested_fix && revised.includes(f.excerpt)) {
        revised = revised.replace(f.excerpt, f.suggested_fix);
        f.status = 'fixed';
      }
    }

    const nextV = item.versions.length + 1;
    const newVer: SubmissionVersion = {
      id: `ver-${item.submission.id}-${nextV}`,
      submission_id: item.submission.id,
      version_no: nextV,
      text_content: revised,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      change_note: `Batch applied ${lowRiskFindings.length} low-risk suggestions`,
    };

    item.versions.push(newVer);
    item.submission.current_version = nextV;
    item.submission.updated_at = new Date().toISOString();
    this.saveToStorage();

    return {
      message: `Batch applied ${lowRiskFindings.length} suggestions.`,
      new_version_no: nextV,
      new_version_id: newVer.id,
      applied_count: lowRiskFindings.length,
    };
  }

  async rewriteInBrandVoice(versionId: string) {
    let text = 'Our robotics solution provides advanced automation.';
    for (const sub of this.submissions) {
      const v = sub.versions.find((x) => x.id === versionId);
      if (v) {
        text = v.text_content;
        break;
      }
    }

    const revised = text
      .replace(/\bcheap\b/gi, 'capital-efficient')
      .replace(/\bbargain-basement\b/gi, 'accessible')
      .replace(/\bcustomers\b/gi, 'enterprise partners')
      .replace(/\bthe best\b/gi, 'high-performance')
      .replace(/\b#1\b/gi, 'leading');

    return {
      original_text: text,
      revised_text: revised,
      rationale:
        'Replaced informal pricing terms with enterprise capital-efficiency terminology, adjusted client descriptors to partner status, and softened unsubstantiated ranking superlatives.',
      changes_made: [
        'Replaced colloquial price descriptors',
        'Aligned client terminology with "enterprise partners"',
        'Softened unverified superlative claims',
      ],
    };
  }

  // Reviews
  async getReviewQueue(): Promise<Submission[]> {
    return this.submissions
      .filter((s) => s.submission.status === 'in_review')
      .map((s) => ({
        ...s.submission,
        latest_version: s.versions[s.versions.length - 1],
      }));
  }

  async submitReviewDecision(
    subId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    comment: string
  ): Promise<Approval> {
    const item = this.submissions.find((s) => s.submission.id === subId);
    if (!item) throw new Error('Submission not found');

    item.submission.status = decision;
    item.submission.updated_at = new Date().toISOString();

    const approval: Approval = {
      id: `appr-${Date.now()}`,
      submission_id: subId,
      version_no: item.submission.current_version,
      reviewer_id: this.currentUser.id,
      reviewer_name: this.currentUser.full_name,
      decision,
      comment,
      decided_at: new Date().toISOString(),
    };

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      org_id: 'org-aura-01',
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: `SUBMISSION_${decision.toUpperCase()}`,
      entity_type: 'submission',
      entity_id: subId,
      metadata_json: { decision, comment },
      created_at: new Date().toISOString(),
    });

    this.saveToStorage();
    return approval;
  }

  // Analytics
  async getAnalyticsDashboard(): Promise<AnalyticsData> {
    return {
      total_submissions: this.submissions.length + 12,
      average_compliance_score: 84.5,
      approval_rate: 78.2,
      rejection_rate: 8.4,
      avg_turnaround_hours: 3.2,
      category_chart: [
        { category: 'Terminology', violations: 18 },
        { category: 'Claims', violations: 14 },
        { category: 'Tone', violations: 9 },
        { category: 'Legal', violations: 6 },
        { category: 'Messaging', violations: 4 },
        { category: 'Visual', violations: 3 },
      ],
      channel_chart: [
        { channel: 'Blog', count: 12 },
        { channel: 'Social', count: 8 },
        { channel: 'Ad', count: 5 },
        { channel: 'Web', count: 4 },
      ],
      score_trends: [
        { week: 'W1', score: 68 },
        { week: 'W2', score: 74 },
        { week: 'W3', score: 81 },
        { week: 'W4', score: 86 },
      ],
      top_violated_rules: [
        { rule_id: 'r-01', title: 'Forbidden Term: "cheap"', category: 'terminology', severity: 'high', count: 12 },
        { rule_id: 'r-08', title: 'Mandatory Autonomous Safety Disclaimer', category: 'legal', severity: 'critical', count: 8 },
        { rule_id: 'r-03', title: 'Preferred Nomenclature: "Enterprise Partners"', category: 'terminology', severity: 'low', count: 7 },
        { rule_id: 'r-05', title: 'Prohibit Artificial Urgency & Hype', category: 'tone', severity: 'high', count: 5 },
      ],
      unclear_guidelines: [
        {
          rule_id: 'r-03',
          title: 'Preferred Nomenclature: "Enterprise Partners"',
          dismissal_count: 5,
          diagnosis: 'High dismissal rate suggests authors find this term awkward in informal channels.',
        },
      ],
    };
  }

  // Audit
  async getAuditLogs(_limit: number = 50): Promise<AuditLogItem[]> {
    return this.auditLogs;
  }

  async purgeRetention(days: number = 90) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const initial = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter((l) => l.created_at >= cutoff);
    const purged = initial - this.auditLogs.length;
    this.saveToStorage();
    return { message: `Purged ${purged} audit records older than ${days} days.`, purged_count: purged };
  }

  async deleteMyData() {
    return { message: 'Personal data anonymised in compliance with privacy retention regulations.', deleted_count: 1 };
  }

  // Visual & Contrast
  async checkContrast(fg: string, bg: string): Promise<ContrastCheckResult> {
    const getLum = (hex: string) => {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16) / 255;
      const g = parseInt(c.substring(2, 4), 16) / 255;
      const b = parseInt(c.substring(4, 6), 16) / 255;
      const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    try {
      const l1 = getLum(fg);
      const l2 = getLum(bg);
      const ratio = parseFloat(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));

      return {
        ratio,
        normal_text_aa: ratio >= 4.5,
        normal_text_aaa: ratio >= 7.0,
        large_text_aa: ratio >= 3.0,
        large_text_aaa: ratio >= 4.5,
        recommendation:
          ratio >= 7.0
            ? 'Complies with WCAG AAA for both normal and large text.'
            : ratio >= 4.5
            ? 'Complies with WCAG AA for normal text and AAA for large text.'
            : ratio >= 3.0
            ? 'Passes AA only for large text (18pt+). Fails normal text.'
            : 'Fails WCAG contrast minimums. Increase foreground/background luminance differential.',
      };
    } catch {
      return {
        ratio: 4.8,
        normal_text_aa: true,
        normal_text_aaa: false,
        large_text_aa: true,
        large_text_aaa: true,
        recommendation: 'Complies with WCAG AA specification.',
      };
    }
  }

  async analyzeImage(_file?: File) {
    return {
      dominant_colors: ['#000000', '#BC0202', '#FFFFFF', '#1E1E1E'],
      palette_matches: [
        { name: 'Aura Crimson Primary', hex: '#BC0202', delta_e: 0.8, status: 'pass' },
        { name: 'Aura Deep Onyx Base', hex: '#000000', delta_e: 0.0, status: 'pass' },
      ],
      wcag_analysis: {
        text_contrast_ratio: 5.2,
        wcag_aa_compliant: true,
        wcag_aaa_compliant: false,
      },
      logo_clear_space_passed: true,
    };
  }
}

export const demoStore = new DemoStore();
