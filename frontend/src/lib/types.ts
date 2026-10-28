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
  senderAvatar?: string | null;
  senderSide: 'CANDIDATE' | 'COMPANY';
  content: string;
  createdAt: string;
  readAt: string | null;
  optimistic?: boolean;
}

export interface ReadReceiptDto {
  applicationId: number;
  readerSide: 'CANDIDATE' | 'COMPANY';
  readAt: string;
  count: number;
}

export interface ThreadSummary {
  applicationId: number;
  jobId: number | null;
  jobTitle: string | null;
  jobLocation?: string | null;
  companyId?: number | null;
  companyName: string | null;
  companyLogo: string | null;
  candidateUserId: number | null;
  candidateName: string | null;
  candidateAvatar?: string | null;
  candidateHeadline?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  candidateCity?: string | null;
  currentStage: string;
  appliedAt?: string | null;
  lastMessage: string | null;
  lastSenderSide: 'CANDIDATE' | 'COMPANY' | null;
  lastSenderName?: string | null;
  lastMessageAt: string | null;
  lastMessageReadAt?: string | null;
  unreadCount: number;
  totalMessages?: number;
}

// ------------------------------------------------------------------ AI & Analytics Types

export interface ExtractedSkillItem {
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience: number;
  confidenceScore?: number;
  isCore?: boolean;
}

export interface ExtractedExperienceItem {
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface ExtractedEducationItem {
  school: string;
  degree: string;
  year: string;
  details?: string;
}

export interface AiResumeParseResult {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  headline: string;
  summary: string;
  skills: ExtractedSkillItem[];
  experiences: ExtractedExperienceItem[];
  educations: ExtractedEducationItem[];
  suggestedJobRoles: string[];
  overallQualityScore: number;
}

export interface CoverLetterResponse {
  jobId: number;
  jobTitle: string;
  companyName: string;
  tone: string;
  subject: string;
  coverLetter: string;
  highlightedSkills: string[];
}

export interface AtsSkillBreakdown {
  name: string;
  requiredYears: number;
  candidateYears: number;
  isMatched: boolean;
  isRequired: boolean;
  recommendation: string;
}

export interface JdCriterionComparison {
  criterion: string;
  cvValue: string;
  jdValue: string;
  status: 'MATCH' | 'PARTIAL' | 'GAP' | string;
}

export interface AtsMatchAnalysis {
  jobId: number;
  jobTitle: string;
  companyName: string;
  analyzedCvId?: number | null;
  analyzedCvName?: string;
  matchScore: number;
  skillMatchScore?: number;
  experienceMatchScore?: number;
  keywordMatchScore?: number;
  modelName?: string;
  modelVersion?: string;
  semanticSimilarity?: number;
  inferenceTimeMs?: number;
  matchRating: string;
  ratingColor: string;
  matchedSkills: AtsSkillBreakdown[];
  missingSkills: AtsSkillBreakdown[];
  jdCriteriaComparison?: JdCriterionComparison[];
  keyStrengths: string[];
  preparationTips: string[];
  summaryComment: string;
}

export interface FunnelMetrics {
  appliedCount: number;
  screeningCount: number;
  interviewCount: number;
  offeredCount: number;
  hiredCount: number;
  rejectedCount: number;
  screeningRate: number;
  interviewRate: number;
  offerRate: number;
  hireRate: number;
  overallHireRate: number;
}

export interface KpiMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  freshApplications: number;
  scheduledInterviews: number;
  avgDaysToReview: number;
  avgDaysToHire: number;
}

export interface QualityDistribution {
  highMatchCount: number;
  mediumMatchCount: number;
  lowMatchCount: number;
  highMatchPct: number;
  mediumMatchPct: number;
  lowMatchPct: number;
}

export interface TopJobMetric {
  jobId: number;
  jobTitle: string;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  interviewCount: number;
  hiredCount: number;
  avgMatchScore: number;
}

export interface TimelinePoint {
  periodLabel: string;
  applicationsCount: number;
  interviewsCount: number;
  hiresCount: number;
}

export interface RecruitmentAnalytics {
  companyId: number;
  companyName: string;
  kpis: KpiMetrics;
  funnel: FunnelMetrics;
  quality: QualityDistribution;
  topJobs: TopJobMetric[];
  weeklyTrend: TimelinePoint[];
}

export interface CandidateSkillSummary {
  name: string;
  proficiency: string;
  yearsExperience: number;
}

export interface TalentPoolCandidate {
  candidateProfileId: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  headline?: string;
  city?: string;
  bio?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  isOpenToWork: boolean;
  skills: CandidateSkillSummary[];
  matchScore?: number;
  matchRating?: string;
  matchedSkills?: string[];
}

export interface InviteCandidateRequest {
  candidateUserId: number;
  jobId: number;
  customMessage?: string;
}

export interface InviteCandidateResponse {
  candidateUserId: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  status: string;
  message: string;
}

export interface RecommendedJob {
  job: Job;
  matchScore: number;
  skillMatchScore?: number;
  experienceMatchScore?: number;
  domainMatchScore?: number;
  matchRating: string;
  ratingColor: string;
  levelMatched?: boolean;
  locationMatched?: boolean;
  locationStatus?: 'SAME_CITY' | 'REMOTE' | 'UNKNOWN' | 'OTHER_CITY';
  candidateCity?: string | null;
  alreadyApplied?: boolean;
  analyzedCvId?: number | null;
  analyzedCvName?: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons?: string[];
  recommendationReason: string;
  improvementTip?: string;
}

export interface StageCountMetric {
  stage: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TopCompanyMetric {
  companyId: number;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  verificationStatus: string;
  jobCount: number;
  applicationCount: number;
}

export interface TopSkillMetric {
  skillId: number;
  skillName: string;
  category: string;
  jobCount: number;
  candidateCount: number;
}

export interface AiSystemMetrics {
  activeModelName: string;
  totalScoredApplications: number;
  averageAtsScore: number;
  highMatchCount: number;
  openToWorkCandidates: number;
  averageLatencyMs: number;
  uptimePercentage: number;
}

export interface PlatformOverview {
  totalUsers: number;
  activeUsers: number;
  suspendedOrBannedUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  verifiedCompanies: number;
  pendingCompanies: number;
  totalJobs: number;
  publishedJobs: number;
  pendingOrDraftJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalSkills: number;
  overallHireRate: number;
  averagePlatformMatchScore: number;
  applicationsByStage: StageCountMetric[];
  topCompanies: TopCompanyMetric[];
  topSkills: TopSkillMetric[];
  aiMetrics: AiSystemMetrics;
}

export interface AdminUser {
  id: number;
  uuid: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'PENDING_VERIFY' | 'SUSPENDED' | 'BANNED' | string;
  isEmailVerified: boolean;
  roles: string[];
  companyName?: string;
  candidateHeadline?: string;
  createdAt?: string;
}

export interface AdminCompany {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  taxCode?: string;
  city?: string;
  address?: string;
  description?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | string;
  jobCount: number;
  recruiterCount: number;
  createdAt?: string;
}

export interface AdminJob {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  companyId?: number;
  companyName: string;
  companyLogo?: string;
  jobType: string;
  expLevel: string;
  locationCity: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'EXPIRED' | string;
  viewsCount: number;
  applicationsCount: number;
  publishedAt?: string;
  createdAt?: string;
}

export interface AdminSkill {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  isActive: boolean;
  jobCount: number;
  candidateCount: number;
  createdAt?: string;
}

export interface SaveSkillInput {
  name: string;
  category: string;
  description?: string;
  isActive?: boolean;
}

export interface AuditLogEntry {
  id: number;
  userId?: number;
  actorName: string;
  actorEmail: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface EmailLogEntry {
  id: number;
  toEmail: string;
  subject: string;
  template: string;
  status: string;
  errorMessage?: string;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}


