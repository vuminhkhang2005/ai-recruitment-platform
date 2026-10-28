import type {
  ApiEnvelope,
  Application,
  AuthResponse,
  Company,
  CvItem,
  Job,
  JobInput,
  JobSearchParams,
  MatchScore,
  NotificationItem,
  Page,
  RegisterInput,
  SkillItem,
  Stage,
  EvaluationDto,
  InterviewDto,
  InvitationPreview,
  MessageDto,
  NoteDto,
  TeamInvitation,
  TeamMember,
  TeamOverview,
  ThreadSummary,
  UserProfile,
  UserProfileUpdate,
  UserSummary,
  AiResumeParseResult,
  CoverLetterResponse,
  AtsMatchAnalysis,
  RecruitmentAnalytics,
  TalentPoolCandidate,
  InviteCandidateRequest,
  InviteCandidateResponse,
  RecommendedJob,
  PlatformOverview,
  AdminUser,
  AdminCompany,
  AdminJob,
  AdminSkill,
  SaveSkillInput,
  AuditLogEntry,
  EmailLogEntry,
  CompanyReview,
  CompanyReviewEligibility,
  CompanyReviewInput,
  CompanyReviewPage,
} from './types';

/** Same-origin base path; Vite proxies /api to the Spring Boot server. */
const BASE = '/api/v1';
const ACCESS_KEY = 'talentbridge_access_token';
const REFRESH_KEY = 'talentbridge_refresh_token';

export const SESSION_EXPIRED_EVENT = 'talentbridge:session-expired';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(auth: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) {
    localStorage.setItem(ACCESS_KEY, auth.accessToken);
    if (auth.refreshToken) localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const url = BASE + path;
  if (!query) return url;
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = `Lỗi ${res.status}`;
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
    const fieldErrors = body?.data ?? body?.errors;
    if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
      const first = Object.values(fieldErrors)[0];
      if (typeof first === 'string') message = first;
    }
  } catch {
    if (res.status >= 500) message = 'Máy chủ đang gặp sự cố, vui lòng thử lại sau.';
  }
  return new ApiError(res.status, message);
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokens.refresh;
  if (!refreshToken) return false;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(BASE + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const body = (await res.json()) as ApiEnvelope<AuthResponse>;
        tokens.set(body.data);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => (refreshing = null), 0);
      }
    })();
  }
  return refreshing;
}

/** Exchanges the stored refresh token for a new access token (shared single-flight with HTTP requests). */
export const refreshAccessToken = tryRefresh;

/** True when the JWT is malformed or expires within `skewMs`. */
export function isJwtExpired(token: string, skewMs = 15_000): boolean {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp !== 'number' || json.exp * 1000 <= Date.now() + skewMs;
  } catch {
    return true;
  }
}

interface RequestOptions {
  method?: string;
  query?: Query;
  body?: unknown;
  form?: FormData;
  raw?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {};
  const access = tokens.access;
  if (access) headers.Authorization = `Bearer ${access}`;
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? 'GET',
      headers,
      body,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
  }

  if (res.status === 401 && access && !retried) {
    if (await tryRefresh()) return request<T>(path, opts, true);
    tokens.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  if (!res.ok) throw await parseError(res);
  if (opts.raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as ApiEnvelope<T>;
  return json.data;
}

// ---------------------------------------------------------------- endpoints

export interface OAuth2LoginPayload {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  token?: string;
  authCode?: string;
  redirectUri?: string;
  role?: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (input: RegisterInput) => request<AuthResponse>('/auth/register', { method: 'POST', body: input }),
  oauth2Config: () =>
    request<{
      googleClientId: string;
      linkedinClientId: string;
      googleConfigured: boolean;
      linkedinConfigured: boolean;
      sandboxEnabled?: boolean;
    }>('/auth/oauth2/config'),
  oauth2Authorize: (
    provider: 'google' | 'linkedin',
    payload: { email: string; fullName: string; avatarUrl?: string; role?: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER'; redirectUri?: string }
  ) =>
    request<{ code: string; provider: string; state: string; redirectUri: string }>(`/auth/oauth2/${provider}/authorize`, {
      method: 'POST',
      body: {
        provider: provider.toUpperCase(),
        email: payload.email,
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        role: payload.role,
        redirectUri: payload.redirectUri ?? `${window.location.origin}/login`,
      },
    }),
  oauth2: (provider: 'google' | 'linkedin', payload?: OAuth2LoginPayload) =>
    request<AuthResponse>(`/auth/oauth2/${provider}`, {
      method: 'POST',
      body: {
        provider: provider.toUpperCase(),
        email: payload?.email,
        fullName: payload?.fullName,
        avatarUrl: payload?.avatarUrl,
        token: payload?.token,
        authCode: payload?.authCode,
        redirectUri: payload?.redirectUri,
        role: payload?.role,
      },
    }),
  me: () => request<UserSummary>('/auth/me'),
  logout: (refreshToken: string | null) =>
    request<void>('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined),
};

export const userApi = {
  getMe: () => request<UserProfile>('/users/me'),
  updateMe: (input: UserProfileUpdate) => request<UserProfile>('/users/me', { method: 'PUT', body: input }),
  changePassword: (
    arg: { currentPassword: string; newPassword: string } | string,
    newPassword?: string
  ) => {
    const body =
      typeof arg === 'string'
        ? { currentPassword: arg, newPassword: newPassword! }
        : arg;
    return request<AuthResponse>('/users/me/password', { method: 'POST', body });
  },
};

export const jobApi = {
  search: (params: JobSearchParams) => request<Page<Job>>('/jobs', { query: { ...params } }),
  get: (id: number | string) => request<Job>(`/jobs/${id}`),
  featured: () => request<Job[]>('/jobs/featured'),
  mine: () => request<Job[]>('/jobs/mine'),
  create: (input: JobInput) => request<Job>('/jobs', { method: 'POST', body: input }),
  update: (id: number, input: Partial<JobInput>) => request<Job>(`/jobs/${id}`, { method: 'PUT', body: input }),
  setStatus: (id: number, status: string) => request<Job>(`/jobs/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id: number) => request<void>(`/jobs/${id}`, { method: 'DELETE' }),
};

export const companyApi = {
  list: () => request<Company[]>('/companies'),
  get: (id: number | string) => request<Company>(`/companies/${id}`),
  jobs: (id: number | string) => request<Job[]>(`/companies/${id}/jobs`),
  update: (id: number | string, data: Partial<Company>) =>
    request<Company>(`/companies/${id}`, { method: 'PUT', body: data }),
};

export type ReviewSort = 'newest' | 'highest' | 'lowest';

export const reviewApi = {
  list: (companyId: number | string, sort: ReviewSort = 'newest', page = 0, size = 5) =>
    request<CompanyReviewPage>(`/companies/${companyId}/reviews`, { query: { sort, page, size } }),
  eligibility: (companyId: number | string) =>
    request<CompanyReviewEligibility>(`/companies/${companyId}/reviews/eligibility`),
  create: (companyId: number | string, input: CompanyReviewInput) =>
    request<CompanyReview>(`/companies/${companyId}/reviews`, { method: 'POST', body: input }),
  updateMine: (companyId: number | string, input: CompanyReviewInput) =>
    request<CompanyReview>(`/companies/${companyId}/reviews/mine`, { method: 'PUT', body: input }),
  deleteMine: (companyId: number | string) =>
    request<void>(`/companies/${companyId}/reviews/mine`, { method: 'DELETE' }),
  // Admin moderation
  adminList: (filters: { status?: string; keyword?: string } = {}) =>
    request<CompanyReview[]>('/admin/reviews', { query: filters }),
  adminModerate: (reviewId: number, status: 'PUBLISHED' | 'HIDDEN', note?: string) =>
    request<CompanyReview>(`/admin/reviews/${reviewId}/status`, { method: 'PATCH', body: { status, note } }),
};

export const applicationApi = {
  apply: (
    jobId: number,
    cvId: number | null,
    coverLetter: string,
    options?: { allowAiMatching?: boolean; aiMatchScore?: number | null },
  ) =>
    request<Application>('/applications', {
      method: 'POST',
      body: {
        jobId,
        cvId,
        coverLetter,
        allowAiMatching: options?.allowAiMatching,
        aiMatchScore: options?.aiMatchScore ?? undefined,
      },
    }),
  mine: () => request<Application[]>('/applications/me'),
  get: (id: number) => request<Application>(`/applications/${id}`),
  forRecruiter: () => request<Application[]>('/applications/recruiter'),
  forJob: (jobId: number) => request<Application[]>(`/applications/job/${jobId}`),
  updateStage: (
    id: number,
    currentStage: Stage,
    rejectionReason?: string,
    options?: {
      note?: string;
      sendEmail?: boolean;
      customEmailSubject?: string;
      customEmailBody?: string;
      sendChatMessage?: boolean;
    },
  ) =>
    request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: {
        currentStage,
        rejectionReason,
        note: options?.note,
        sendEmail: options?.sendEmail ?? true,
        customEmailSubject: options?.customEmailSubject,
        customEmailBody: options?.customEmailBody,
        sendChatMessage: options?.sendChatMessage ?? false,
      },
    }),
  bulkUpdateStage: (payload: {
    applicationIds: number[];
    currentStage: Stage;
    rejectionReason?: string;
    note?: string;
    sendEmail?: boolean;
    customEmailSubject?: string;
    customEmailBody?: string;
    sendChatMessage?: boolean;
  }) =>
    request<{
      totalRequested: number;
      updatedCount: number;
      skippedCount: number;
      emailSentCount: number;
      updatedApplications: Application[];
      skippedReasons: string[];
    }>('/applications/bulk-status', {
      method: 'POST',
      body: payload,
    }),
  withdraw: (id: number) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
};

export const candidateApi = {
  getSkills: () => request<SkillItem[]>('/candidates/me/skills'),
  saveSkills: (skills: SkillItem[]) =>
    request<SkillItem[]>('/candidates/me/skills', { method: 'PUT', body: { skills } }),
  matchScores: (jobIds: number[]) =>
    jobIds.length
      ? request<MatchScore[]>('/candidates/me/match-scores', { query: { jobIds: jobIds.join(',') } })
      : Promise.resolve([] as MatchScore[]),
  listCvs: () => request<CvItem[]>('/candidates/me/cvs'),
  uploadCv: (file: File, title?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    return request<CvItem>('/candidates/me/cvs', { method: 'POST', form });
  },
  setDefaultCv: (id: number) => request<CvItem>(`/candidates/me/cvs/${id}/default`, { method: 'PATCH' }),
  deleteCv: (id: number) => request<void>(`/candidates/me/cvs/${id}`, { method: 'DELETE' }),
};

/** Downloads a CV through the authenticated endpoint and opens it in a new tab. */
export async function openCvFile(cvId: number) {
  const tab = window.open('', '_blank');
  try {
    const res = await request<Response>(`/cvs/${cvId}/file`, { raw: true });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    tab?.close();
    throw e;
  }
}

/** Reads the file name from a Content-Disposition header (RFC 5987 filename* first). */
function fileNameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/"/g, ''));
    } catch {
      /* ignore malformed encoding */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : fallback;
}

/** Downloads an authenticated file (e.g. CSV export) and saves it with the server-provided file name. */
export async function downloadAuthenticatedFile(path: string, query?: Query, fallbackName = 'export.csv') {
  const res = await request<Response>(path, { raw: true, query });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNameFromDisposition(res.headers.get('Content-Disposition'), fallbackName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export type ExportLang = 'vi' | 'en';

export const exportApi = {
  /** Applicants of one job, or of all the recruiter's jobs when jobId is omitted. */
  applications: (lang: ExportLang, jobId?: number | null) =>
    downloadAuthenticatedFile('/exports/applications', { jobId: jobId ?? undefined, lang }, 'applicants.csv'),
  analytics: (lang: ExportLang) => downloadAuthenticatedFile('/exports/analytics', { lang }, 'recruitment_report.csv'),
  adminUsers: (lang: ExportLang, filters: { keyword?: string; role?: string; status?: string } = {}) =>
    downloadAuthenticatedFile('/exports/admin/users', { ...filters, lang }, 'users.csv'),
  adminCompanies: (lang: ExportLang, filters: { keyword?: string; verificationStatus?: string } = {}) =>
    downloadAuthenticatedFile('/exports/admin/companies', { ...filters, lang }, 'companies.csv'),
  adminJobs: (lang: ExportLang, filters: { keyword?: string; status?: string; companyId?: number } = {}) =>
    downloadAuthenticatedFile('/exports/admin/jobs', { ...filters, lang }, 'jobs.csv'),
};

export const notificationApi = {
  list: (limit = 20) => request<NotificationItem[]>('/notifications', { query: { limit } }),
  unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markRead: (id: number) => request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'PATCH' }),
};

export const teamApi = {
  overview: () => request<TeamOverview>('/team/overview'),
  members: () => request<TeamMember[]>('/team/members'),
  invite: (input: { email: string; fullName?: string; jobTitle?: string; teamRole: string }) =>
    request<TeamInvitation>('/team/invitations', { method: 'POST', body: input }),
  resendInvitation: (id: number) => request<TeamInvitation>(`/team/invitations/${id}/resend`, { method: 'POST' }),
  revokeInvitation: (id: number) => request<void>(`/team/invitations/${id}`, { method: 'DELETE' }),
  updateMember: (id: number, data: { teamRole?: string; jobTitle?: string }) =>
    request<TeamMember>(`/team/members/${id}`, { method: 'PATCH', body: data }),
  deactivateMember: (id: number) => request<TeamMember>(`/team/members/${id}/deactivate`, { method: 'POST' }),
  reactivateMember: (id: number) => request<TeamMember>(`/team/members/${id}/reactivate`, { method: 'POST' }),
  previewInvitation: (token: string) => request<InvitationPreview>(`/auth/invitations/${token}`),
  acceptInvitation: (token: string, data: { fullName: string; password: string; phone?: string }) =>
    request<AuthResponse>(`/auth/invitations/${token}/accept`, { method: 'POST', body: data }),
};

export const interviewApi = {
  listForApplication: (applicationId: number) =>
    request<InterviewDto[]>(`/applications/${applicationId}/interviews`),
  schedule: (applicationId: number, data: {
    roundNumber?: number;
    title?: string;
    scheduledStart: string;
    scheduledEnd?: string;
    format: 'ONLINE' | 'OFFLINE';
    location: string;
    notesToCandidate?: string;
    panelistUserIds?: number[];
  }) => request<InterviewDto>(`/applications/${applicationId}/interviews`, { method: 'POST', body: data }),
  update: (interviewId: number, data: {
    scheduledStart?: string;
    scheduledEnd?: string;
    format?: 'ONLINE' | 'OFFLINE';
    location?: string;
    status?: 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
    notesToCandidate?: string;
    panelistUserIds?: number[];
  }) => request<InterviewDto>(`/interviews/${interviewId}`, { method: 'PATCH', body: data }),
  evaluate: (interviewId: number, data: {
    scorecard: Record<string, number>;
    recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE';
    notes?: string;
  }) => request<EvaluationDto>(`/interviews/${interviewId}/evaluations`, { method: 'POST', body: data }),
  upcoming: () => request<InterviewDto[]>('/interviews/upcoming'),
};

export const noteApi = {
  list: (applicationId: number) => request<NoteDto[]>(`/applications/${applicationId}/notes`),
  create: (
    applicationId: number,
    arg: string | { content: string; isPrivate?: boolean },
    isPrivate = false
  ) => {
    const body =
      typeof arg === 'string'
        ? { content: arg, isPrivate }
        : { content: arg.content, isPrivate: !!arg.isPrivate };
    return request<NoteDto>(`/applications/${applicationId}/notes`, { method: 'POST', body });
  },
  delete: (noteId: number) => request<void>(`/notes/${noteId}`, { method: 'DELETE' }),
};

export const messageApi = {
  list: (applicationId: number) => request<MessageDto[]>(`/applications/${applicationId}/messages`),
  send: (applicationId: number, content: string) =>
    request<MessageDto>(`/applications/${applicationId}/messages`, { method: 'POST', body: { content } }),
  markRead: (applicationId: number) =>
    request<{ markedRead: number }>(`/applications/${applicationId}/messages/read`, { method: 'PATCH' }),
  threads: () => request<ThreadSummary[]>('/messages/threads'),
  unreadCount: () => request<{ unreadCount: number }>('/messages/unread-count'),
};

export const aiApi = {
  parseCvText: (text: string, cvId?: number) =>
    request<AiResumeParseResult>('/ai/parse-cv-text', { method: 'POST', body: { text, cvId } }),
  parseCvFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<AiResumeParseResult>('/ai/parse-cv', { method: 'POST', form });
  },
  syncSkills: (skills: SkillItem[], replaceExisting = false) =>
    request<SkillItem[]>('/ai/sync-parsed-skills', {
      method: 'POST',
      body: { skills, replaceExisting },
    }),
  generateCoverLetter: (jobId: number, tone = 'PROFESSIONAL', candidateHighlights?: string) =>
    request<CoverLetterResponse>('/ai/generate-cover-letter', {
      method: 'POST',
      body: { jobId, tone, candidateHighlights },
    }),
  matchAnalysis: (jobId: number, cvId?: number | null, file?: File | null) => {
    if (file) {
      const form = new FormData();
      form.append('file', file);
      return request<AtsMatchAnalysis>('/ai/match-analysis', {
        method: 'POST',
        query: { jobId, ...(cvId ? { cvId } : {}) },
        form,
      });
    }
    return request<AtsMatchAnalysis>('/ai/match-analysis', {
      query: { jobId, ...(cvId ? { cvId } : {}) },
    });
  },
  getRecommendedJobs: (limit = 12, cvId?: number | null, minScore = 45) =>
    request<RecommendedJob[]>('/ai/recommended-jobs', {
      query: { limit, minScore, ...(cvId ? { cvId } : {}) },
    }),
};

export const analyticsApi = {
  getAnalytics: () => request<RecruitmentAnalytics>('/employer/analytics'),
};

export const talentPoolApi = {
  search: (params?: { keyword?: string; city?: string; jobId?: number }) =>
    request<TalentPoolCandidate[]>('/employer/talent-pool', { query: params }),
  invite: (data: InviteCandidateRequest) =>
    request<InviteCandidateResponse>('/employer/talent-pool/invite', { method: 'POST', body: data }),
};

export const adminApi = {
  getOverview: () => request<PlatformOverview>('/admin/overview'),
  getUsers: (params?: { keyword?: string; role?: string; status?: string }) =>
    request<AdminUser[]>('/admin/users', { query: params }),
  updateUserStatus: (id: number, status: string, reason?: string) =>
    request<AdminUser>(`/admin/users/${id}/status`, { method: 'PATCH', body: { status, reason } }),
  updateUserRoles: (id: number, roles: string[]) =>
    request<AdminUser>(`/admin/users/${id}/roles`, { method: 'PUT', body: { roles } }),
  getCompanies: (params?: { keyword?: string; verificationStatus?: string }) =>
    request<AdminCompany[]>('/admin/companies', { query: params }),
  verifyCompany: (id: number, verificationStatus: string, note?: string) =>
    request<AdminCompany>(`/admin/companies/${id}/verify`, { method: 'PATCH', body: { verificationStatus, note } }),
  getJobs: (params?: { keyword?: string; status?: string; companyId?: number }) =>
    request<AdminJob[]>('/admin/jobs', { query: params }),
  moderateJob: (id: number, status: string, reason?: string) =>
    request<AdminJob>(`/admin/jobs/${id}/moderate`, { method: 'PATCH', body: { status, reason } }),
  getSkills: (params?: { keyword?: string; category?: string; activeOnly?: boolean }) =>
    request<AdminSkill[]>('/admin/skills', { query: params }),
  createSkill: (data: SaveSkillInput) =>
    request<AdminSkill>('/admin/skills', { method: 'POST', body: data }),
  updateSkill: (id: number, data: SaveSkillInput) =>
    request<AdminSkill>(`/admin/skills/${id}`, { method: 'PUT', body: data }),
  toggleSkill: (id: number) =>
    request<AdminSkill>(`/admin/skills/${id}`, { method: 'DELETE' }),
  getAuditLogs: (params?: { action?: string; entityName?: string; keyword?: string; limit?: number }) =>
    request<AuditLogEntry[]>('/admin/audit-logs', { query: params }),
  getEmailLogs: (params?: { status?: string; limit?: number }) =>
    request<EmailLogEntry[]>('/admin/email-logs', { query: params }),
};


