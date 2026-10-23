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
import { demoStore } from './demoStore';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// Tracks whether the backend is offline or static deploy mode
let isBackendUnavailable = false;

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

async function tryFetch<T>(
  url: string,
  options: RequestInit,
  fallback: () => Promise<T>
): Promise<T> {
  // If we already know the backend is not hosted on this domain (e.g. static Vercel/GitHub Pages deploy)
  if (isBackendUnavailable) {
    return fallback();
  }

  try {
    const res = await fetch(url, options);
    // If backend endpoint is missing (404), gateway timeout (504), bad gateway (502)
    if (res.status === 404 || res.status === 502 || res.status === 504) {
      console.warn(`[PLUMB] Backend at ${url} returned HTTP ${res.status}. Seamlessly falling back to client-side Demo Store.`);
      isBackendUnavailable = true;
      return fallback();
    }
    return await handleResponse<T>(res);
  } catch (err) {
    console.warn(`[PLUMB] Network request to ${url} failed. Seamlessly falling back to client-side Demo Store.`, err);
    isBackendUnavailable = true;
    return fallback();
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthToken> {
    return tryFetch(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      () => demoStore.login(email)
    );
  },

  async getMe(): Promise<UserProfile> {
    return tryFetch(
      `${API_BASE}/auth/me`,
      { headers: getAuthHeader() },
      () => demoStore.getMe()
    );
  },

  async switchRole(role: RoleType, is_external: boolean = false): Promise<AuthToken> {
    return tryFetch(
      `${API_BASE}/auth/switch-role`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ role, is_external }),
      },
      () => demoStore.switchRole(role, is_external)
    );
  },

  // Brand Guidelines
  async getBrandProfile(): Promise<BrandProfile> {
    return tryFetch(
      `${API_BASE}/guidelines/profile`,
      { headers: getAuthHeader() },
      () => demoStore.getBrandProfile()
    );
  },

  async updateBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
    return tryFetch(
      `${API_BASE}/guidelines/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      },
      () => demoStore.updateBrandProfile(data)
    );
  },

  async getRules(category?: string): Promise<GuidelineRule[]> {
    const url = category
      ? `${API_BASE}/guidelines/rules?category=${category}`
      : `${API_BASE}/guidelines/rules`;

    return tryFetch(
      url,
      { headers: getAuthHeader() },
      () => demoStore.getRules(category)
    );
  },

  async createRule(rule: Partial<GuidelineRule>): Promise<GuidelineRule> {
    return tryFetch(
      `${API_BASE}/guidelines/rules`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(rule),
      },
      () => demoStore.createRule(rule)
    );
  },

  async updateRule(id: string, rule: Partial<GuidelineRule>): Promise<GuidelineRule> {
    return tryFetch(
      `${API_BASE}/guidelines/rules/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(rule),
      },
      () => demoStore.updateRule(id, rule)
    );
  },

  async deleteRule(id: string): Promise<{ message: string }> {
    return tryFetch(
      `${API_BASE}/guidelines/rules/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(),
      },
      () => demoStore.deleteRule(id)
    );
  },

  async ingestDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return tryFetch(
      `${API_BASE}/guidelines/ingest-document`,
      {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      },
      () => demoStore.ingestDocument(file)
    );
  },

  async getFacts(): Promise<ApprovedFact[]> {
    return tryFetch(
      `${API_BASE}/guidelines/facts`,
      { headers: getAuthHeader() },
      () => demoStore.getFacts()
    );
  },

  async createFact(fact: Partial<ApprovedFact>): Promise<ApprovedFact> {
    return tryFetch(
      `${API_BASE}/guidelines/facts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(fact),
      },
      () => demoStore.createFact(fact)
    );
  },

  async deleteFact(id: string): Promise<{ message: string }> {
    return tryFetch(
      `${API_BASE}/guidelines/facts/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(),
      },
      () => demoStore.deleteFact(id)
    );
  },

  async getAssets(): Promise<BrandAsset[]> {
    return tryFetch(
      `${API_BASE}/guidelines/assets`,
      { headers: getAuthHeader() },
      () => demoStore.getAssets()
    );
  },

  // Submissions
  async getSubmissions(channel?: string, status_filter?: string): Promise<Submission[]> {
    let url = `${API_BASE}/submissions`;
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (status_filter) params.append('status_filter', status_filter);
    if (params.toString()) url += `?${params.toString()}`;

    return tryFetch(
      url,
      { headers: getAuthHeader() },
      () => demoStore.getSubmissions(channel, status_filter)
    );
  },

  async createSubmission(payload: {
    title: string;
    channel: string;
    content_type?: string;
    text_content: string;
    image_path?: string;
  }): Promise<Submission> {
    return tryFetch(
      `${API_BASE}/submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      },
      () => demoStore.createSubmission(payload)
    );
  },

  async getSubmission(id: string): Promise<{ submission: Submission; versions: SubmissionVersion[] }> {
    return tryFetch(
      `${API_BASE}/submissions/${id}`,
      { headers: getAuthHeader() },
      () => demoStore.getSubmission(id)
    );
  },

  async createVersion(
    subId: string,
    payload: { text_content: string; image_path?: string; change_note?: string }
  ): Promise<SubmissionVersion> {
    return tryFetch(
      `${API_BASE}/submissions/${subId}/versions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      },
      () => demoStore.createVersion(subId, payload)
    );
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
    return tryFetch(
      `${API_BASE}/submissions/${subId}/diff?v_from=${vFrom}&v_to=${vTo}`,
      { headers: getAuthHeader() },
      () => demoStore.getVersionDiff(subId, vFrom, vTo)
    );
  },

  async submitForReview(subId: string): Promise<{ message: string; status: string }> {
    return tryFetch(
      `${API_BASE}/submissions/${subId}/submit-review`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.submitForReview(subId)
    );
  },

  async deleteSubmission(id: string): Promise<{ message: string }> {
    return tryFetch(
      `${API_BASE}/submissions/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(),
      },
      () => demoStore.deleteSubmission(id)
    );
  },

  // Analysis
  async runAnalysis(versionId: string): Promise<AnalysisRun> {
    return tryFetch(
      `${API_BASE}/analysis/run/${versionId}`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.runAnalysis(versionId)
    );
  },

  async getLatestAnalysis(versionId: string): Promise<AnalysisRun> {
    return tryFetch(
      `${API_BASE}/analysis/latest/${versionId}`,
      { headers: getAuthHeader() },
      () => demoStore.getLatestAnalysis(versionId)
    );
  },

  async updateFindingStatus(findingId: string, status: FindingStatus, dismissed_reason?: string): Promise<any> {
    return tryFetch(
      `${API_BASE}/analysis/findings/${findingId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status, dismissed_reason }),
      },
      () => demoStore.updateFindingStatus(findingId, status, dismissed_reason)
    );
  },

  async submitFindingFeedback(findingId: string, rating: 'helpful' | 'wrong' | 'misleading', comment?: string): Promise<any> {
    return tryFetch(
      `${API_BASE}/analysis/findings/${findingId}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ rating, comment }),
      },
      () => demoStore.submitFindingFeedback(findingId, rating, comment)
    );
  },

  async applyAllLowRisk(versionId: string): Promise<{
    message: string;
    new_version_no: number;
    new_version_id: string;
    applied_count: number;
  }> {
    return tryFetch(
      `${API_BASE}/analysis/apply-all-low-risk/${versionId}`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.applyAllLowRisk(versionId)
    );
  },

  async rewriteInBrandVoice(versionId: string): Promise<{
    original_text: string;
    revised_text: string;
    rationale: string;
    changes_made: string[];
  }> {
    return tryFetch(
      `${API_BASE}/analysis/rewrite/${versionId}`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.rewriteInBrandVoice(versionId)
    );
  },

  // Review Queue
  async getReviewQueue(): Promise<Submission[]> {
    return tryFetch(
      `${API_BASE}/reviews/queue`,
      { headers: getAuthHeader() },
      () => demoStore.getReviewQueue()
    );
  },

  async submitReviewDecision(
    subId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    comment: string
  ): Promise<Approval> {
    return tryFetch(
      `${API_BASE}/reviews/${subId}/decision`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ decision, comment }),
      },
      () => demoStore.submitReviewDecision(subId, decision, comment)
    );
  },

  // Analytics
  async getAnalyticsDashboard(): Promise<AnalyticsData> {
    return tryFetch(
      `${API_BASE}/analytics/dashboard`,
      { headers: getAuthHeader() },
      () => demoStore.getAnalyticsDashboard()
    );
  },

  // Audit & Privacy
  async getAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
    return tryFetch(
      `${API_BASE}/audit/logs?limit=${limit}`,
      { headers: getAuthHeader() },
      () => demoStore.getAuditLogs(limit)
    );
  },

  async purgeRetention(days: number = 90): Promise<{ message: string; purged_count: number }> {
    return tryFetch(
      `${API_BASE}/audit/purge-retention?retention_days=${days}`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.purgeRetention(days)
    );
  },

  async deleteMyData(): Promise<{ message: string; deleted_count: number }> {
    return tryFetch(
      `${API_BASE}/audit/delete-my-data`,
      {
        method: 'POST',
        headers: getAuthHeader(),
      },
      () => demoStore.deleteMyData()
    );
  },

  // Visual & Contrast
  async checkContrast(fg: string, bg: string): Promise<ContrastCheckResult> {
    return tryFetch(
      `${API_BASE}/visual/check-contrast`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foreground_hex: fg, background_hex: bg }),
      },
      () => demoStore.checkContrast(fg, bg)
    );
  },

  async analyzeImage(file?: File): Promise<any> {
    const formData = new FormData();
    if (file) formData.append('file', file);

    return tryFetch(
      `${API_BASE}/visual/analyze-image`,
      {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      },
      () => demoStore.analyzeImage(file)
    );
  },
};
