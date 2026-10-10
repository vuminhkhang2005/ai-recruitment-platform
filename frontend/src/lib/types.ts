// Types mirror the Spring Boot DTOs (backend/src/main/java/com/talentbridge/backend/dto).

export type Role = 'ROLE_CANDIDATE' | 'ROLE_RECRUITER' | 'ROLE_ADMIN';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserSummary {
  id: number;
  uuid: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface UserProfile {
  id: number;
  uuid: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  roles: Role[];
  headline: string | null;
  city: string | null;
  country: string | null;
  isOpenToWork: boolean | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  companyId: number | null;
  companyName: string | null;
  companyLogo: string | null;
  jobTitle: string | null;
  teamRole?: 'ADMIN' | 'RECRUITER' | 'INTERVIEWER' | null;
  isCompanyAdmin?: boolean | null;
}

export type UserProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'fullName'
    | 'phone'
    | 'avatarUrl'
    | 'headline'
    | 'city'
    | 'country'
    | 'isOpenToWork'
    | 'jobTitle'
    | 'bio'
    | 'linkedinUrl'
    | 'githubUrl'
    | 'portfolioUrl'
    | 'expectedSalaryMin'
    | 'expectedSalaryMax'
  >
>;

export interface Job {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  companyId: number;
  companyName: string;
  companyLogo: string | null;
  companyCity: string | null;
  locationCity: string | null;
  locationAddress: string | null;
  jobType: string | null;
  expLevel: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  salaryFormatted: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  status: string;
  deadline: string | null;
  viewsCount: number;
  applicationsCount: number;
  skills: string[];
  postedTimeAgo: string;
  createdAt: string | null;
  urgent: boolean;
}

export interface JobInput {
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  jobType: string;
  expLevel: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  isSalaryNegotiable?: boolean;
  locationCity: string;
  locationAddress?: string;
  deadline?: string | null;
  skills: string[];
  status?: string;
}

export interface JobSearchParams {
  keyword?: string;
  city?: string;
  expLevel?: string;
  jobType?: string;
  minSalary?: number;
  page?: number;
  size?: number;
  sortBy?: 'newest' | 'salary' | 'views';
}

export interface Company {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  verificationStatus: string;
  openJobsCount: number;
}

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export interface StageHistoryItem {
  fromStage: Stage | null;
  toStage: Stage;
  note: string | null;
  createdAt: string;
}

export interface Application {
  id: number;
  uuid: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  candidateProfileId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  coverLetter: string | null;
  currentStage: Stage;
  matchScore: number | null;
  rejectionReason: string | null;
  appliedAt: string;
  updatedAt: string | null;
  jobStatus: string | null;
  jobLocation: string | null;
  jobSalary: string | null;
  jobDeadline: string | null;
  candidateUserId: number | null;
  candidateHeadline: string | null;
  candidateCity: string | null;
  candidateSkills: string[];
  cvId: number | null;
  cvTitle: string | null;
  cvFileName: string | null;
  cvDownloadable: boolean | null;
  history: StageHistoryItem[];
}

export interface SkillItem {
  skillId?: number;
  name: string;
  proficiency?: string | null;
  yearsExperience?: number | null;
}

export interface CvItem {
  id: number;
  title: string;
  fileName: string;
  fileSizeBytes: number | null;
  isDefault: boolean;
  downloadable: boolean;
  createdAt: string;
}

export interface MatchScore {
  jobId: number;
  score: number | null;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string | null;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'ROLE_CANDIDATE' | 'ROLE_RECRUITER';
  companyId?: number;
  companyName?: string;
}

export interface TeamMember {
  recruiterProfileId: number;
  userId: number;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  teamRole: 'ADMIN' | 'RECRUITER' | 'INTERVIEWER';
  status: string;
  me: boolean;
  joinedAt: string;
}

export interface TeamInvitation {
  id: number;
  email: string;
  fullName: string | null;
  jobTitle: string | null;
  teamRole: 'ADMIN' | 'RECRUITER' | 'INTERVIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  invitedByName: string | null;
  expiresAt: string;
  createdAt: string;
  expired: boolean;
}

export interface TeamOverview {
  companyId: number;
  companyName: string;
  companyLogo: string | null;
  myRole: string;
  members: TeamMember[];
  pendingInvitations: TeamInvitation[];
}

export interface InvitationPreview {
  companyName: string | null;
  companyLogo: string | null;
  email: string;
  fullName: string | null;
  jobTitle: string | null;
  teamRole: string;
  invitedByName: string | null;
  status: string;
  expired: boolean;
  expiresAt: string;
}

export interface PanelistDto {
  userId: number;
  fullName: string;
  jobTitle: string | null;
  teamRole: string;
  evaluated: boolean;
}

export interface EvaluationDto {
  id: number;
  authorUserId: number;
  authorName: string;
  authorRole: string;
  scorecard: Record<string, number>;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  notes: string | null;
  submittedAt: string;
}

export interface InterviewDto {
  id: number;
  uuid: string;
  applicationId: number;
  roundNumber: number;
  title: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  format: 'ONLINE' | 'OFFLINE';
  location: string | null;
  status: 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notesToCandidate: string | null;
  panelists?: PanelistDto[];
  evaluations?: EvaluationDto[];
  myEvaluation?: EvaluationDto | null;
  canEvaluate?: boolean;
}

export interface NoteDto {
  id: number;
  applicationId: number;
  authorUserId: number;
  authorName: string;
  authorRole: string;
  content: string;
  isPrivate: boolean;
  mine: boolean;
  createdAt: string;
}

export interface MessageDto {
  id: number;
  applicationId: number;
  senderUserId: number;
  senderName: string;
  senderSide: 'CANDIDATE' | 'COMPANY';
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ThreadSummary {
  applicationId: number;
  jobId: number | null;
  jobTitle: string | null;
  companyName: string | null;
  companyLogo: string | null;
  candidateUserId: number | null;
  candidateName: string | null;
  currentStage: string;
  lastMessage: string | null;
  lastSenderSide: 'CANDIDATE' | 'COMPANY' | null;
  lastMessageAt: string | null;
  unreadCount: number;
}
