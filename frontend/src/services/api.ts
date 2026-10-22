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
  FindingStatus
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('plumb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthToken> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthToken>(res);
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse<UserProfile>(res);
  },

  async switchRole(role: RoleType, is_external: boolean = false): Promise<AuthToken> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ role, is_external }),
    });
    return handleResponse<AuthToken>(res);
  },

  // Brand Guidelines
  async getBrandProfile(): Promise<BrandProfile> {
    const res = await fetch(`${API_BASE}/guidelines/profile`, {
      headers: getAuthHeader(),
    });
    return handleResponse<BrandProfile>(res);
  },

  async updateBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
    const res = await fetch(`${API_BASE}/guidelines/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<BrandProfile>(res);
  },

  async getRules(category?: string): Promise<GuidelineRule[]> {
    const url = category
      ? `${API_BASE}/guidelines/rules?category=${category}`
      : `${API_BASE}/guidelines/rules`;
    const res = await fetch(url, { headers: getAuthHeader() });
    return handleResponse<GuidelineRule[]>(res);
  },

  async createRule(rule: Partial<GuidelineRule>): Promise<GuidelineRule> {
    const res = await fetch(`${API_BASE}/guidelines/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(rule),
    });
    return handleResponse<GuidelineRule>(res);
  },

  async updateRule(id: string, rule: Partial<GuidelineRule>): Promise<GuidelineRule> {
    const res = await fetch(`${API_BASE}/guidelines/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(rule),
    });
    return handleResponse<GuidelineRule>(res);
  },

  async deleteRule(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/guidelines/rules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async ingestDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/guidelines/ingest-document`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async getFacts(): Promise<ApprovedFact[]> {
    const res = await fetch(`${API_BASE}/guidelines/facts`, {
      headers: getAuthHeader(),
    });
    return handleResponse<ApprovedFact[]>(res);
  },

  async createFact(fact: Partial<ApprovedFact>): Promise<ApprovedFact> {
    const res = await fetch(`${API_BASE}/guidelines/facts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(fact),
    });
    return handleResponse<ApprovedFact>(res);
  },

  async deleteFact(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/guidelines/facts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getAssets(): Promise<BrandAsset[]> {
    const res = await fetch(`${API_BASE}/guidelines/assets`, {
      headers: getAuthHeader(),
    });
    return handleResponse<BrandAsset[]>(res);
  },

  // Submissions
  async getSubmissions(channel?: string, status_filter?: string): Promise<Submission[]> {
    let url = `${API_BASE}/submissions`;
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (status_filter) params.append('status_filter', status_filter);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeader() });
    return handleResponse<Submission[]>(res);
  },

  async createSubmission(payload: {
    title: string;
    channel: string;
    content_type?: string;
    text_content: string;
    image_path?: string;
  }): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Submission>(res);
  },

  async getSubmission(id: string): Promise<{ submission: Submission; versions: SubmissionVersion[] }> {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<{ submission: Submission; versions: SubmissionVersion[] }>(res);
  },

  async createVersion(
    subId: string,
    payload: { text_content: string; image_path?: string; change_note?: string }
  ): Promise<SubmissionVersion> {
    const res = await fetch(`${API_BASE}/submissions/${subId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<SubmissionVersion>(res);
  },

  async getVersionDiff(subId: string, vFrom: number, vTo: number): Promise<{
    submission_id: string;
    v_from: number;
    v_to: number;
    text_from: string;
    text_to: string;
    diff_lines: string[];
    change_note?: string;
  }> {
    const res = await fetch(`${API_BASE}/submissions/${subId}/diff?v_from=${vFrom}&v_to=${vTo}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async submitForReview(subId: string): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE}/submissions/${subId}/submit-review`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string; status: string }>(res);
  },

  async deleteSubmission(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Analysis
  async runAnalysis(versionId: string): Promise<AnalysisRun> {
    const res = await fetch(`${API_BASE}/analysis/run/${versionId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<AnalysisRun>(res);
  },

  async getLatestAnalysis(versionId: string): Promise<AnalysisRun> {
    const res = await fetch(`${API_BASE}/analysis/latest/${versionId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<AnalysisRun>(res);
  },

  async updateFindingStatus(findingId: string, status: FindingStatus, dismissed_reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analysis/findings/${findingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, dismissed_reason }),
    });
    return handleResponse<any>(res);
  },

  async submitFindingFeedback(findingId: string, rating: 'helpful' | 'wrong' | 'misleading', comment?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analysis/findings/${findingId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ rating, comment }),
    });
    return handleResponse<any>(res);
  },

  async applyAllLowRisk(versionId: string): Promise<{
    message: string;
    new_version_no: number;
    new_version_id: string;
    applied_count: number;
  }> {
    const res = await fetch(`${API_BASE}/analysis/apply-all-low-risk/${versionId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async rewriteInBrandVoice(versionId: string): Promise<{
    original_text: string;
    revised_text: string;
    rationale: string;
    changes_made: string[];
  }> {
    const res = await fetch(`${API_BASE}/analysis/rewrite/${versionId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  // Review Queue
  async getReviewQueue(): Promise<Submission[]> {
    const res = await fetch(`${API_BASE}/reviews/queue`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Submission[]>(res);
  },

  async submitReviewDecision(
    subId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    comment: string
  ): Promise<Approval> {
    const res = await fetch(`${API_BASE}/reviews/${subId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ decision, comment }),
    });
    return handleResponse<Approval>(res);
  },

  // Analytics
  async getAnalyticsDashboard(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeader(),
    });
    return handleResponse<AnalyticsData>(res);
  },

  // Audit & Privacy
  async getAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/audit/logs?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<AuditLogItem[]>(res);
  },

  async purgeRetention(days: number = 90): Promise<{ message: string; purged_count: number }> {
    const res = await fetch(`${API_BASE}/audit/purge-retention?retention_days=${days}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async deleteMyData(): Promise<{ message: string; deleted_count: number }> {
    const res = await fetch(`${API_BASE}/audit/delete-my-data`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  // Visual & Contrast
  async checkContrast(fg: string, bg: string): Promise<ContrastCheckResult> {
    const res = await fetch(`${API_BASE}/visual/check-contrast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foreground_hex: fg, background_hex: bg }),
    });
    return handleResponse<ContrastCheckResult>(res);
  },

  async analyzeImage(file?: File): Promise<any> {
    const formData = new FormData();
    if (file) formData.append('file', file);
    const res = await fetch(`${API_BASE}/visual/analyze-image`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse<any>(res);
  },
};
