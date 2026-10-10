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

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (input: RegisterInput) => request<AuthResponse>('/auth/register', { method: 'POST', body: input }),
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

export const applicationApi = {
  apply: (jobId: number, cvId: number | null, coverLetter: string) =>
    request<Application>('/applications', { method: 'POST', body: { jobId, cvId, coverLetter } }),
  mine: () => request<Application[]>('/applications/me'),
  get: (id: number) => request<Application>(`/applications/${id}`),
  forRecruiter: () => request<Application[]>('/applications/recruiter'),
  forJob: (jobId: number) => request<Application[]>(`/applications/job/${jobId}`),
  updateStage: (id: number, currentStage: Stage, rejectionReason?: string) =>
    request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: { currentStage, rejectionReason },
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
