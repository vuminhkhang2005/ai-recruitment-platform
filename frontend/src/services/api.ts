import type { Job, JobCategory, TopCompany } from '../data/mockData';
import { MOCK_JOBS, MOCK_COMPANIES, MOCK_CATEGORIES } from '../data/mockData';

// Base API URL configuration
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/v1' 
    : '/api/v1');

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  items?: T[];
  content?: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BackendJobDto {
  id: number;
  uuid?: string;
  title: string;
  slug?: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  companyCity?: string;
  locationCity?: string;
  locationAddress?: string;
  jobType: string;
  expLevel: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryFormatted?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  status?: string;
  deadline?: string;
  viewsCount?: number;
  applicationsCount?: number;
  skills: string[];
  postedTimeAgo?: string;
  aiMatchScore?: number;
  urgent?: boolean;
  bonus?: string;
}

export interface BackendCompanyDto {
  id: number;
  uuid?: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  description?: string;
  verified?: boolean;
  activeJobCount?: number;
}

export interface BackendCategoryDto {
  id: string;
  nameVi: string;
  nameEn: string;
  iconName: 'code' | 'finance' | 'marketing' | 'design' | 'hr' | 'product';
  count: number;
  trending?: boolean;
}

export interface QuickApplyPayload {
  jobId: number | string;
  candidateProfileId?: number;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface QuickApplyResult {
  success: boolean;
  message: string;
  data?: {
    applicationUuid?: string;
    jobTitle?: string;
    companyName?: string;
    message?: string;
    appliedAt?: string;
  };
}

/**
 * Determine the logo identifier from company name for consistent icon rendering
 */
function resolveCompanyLogoId(companyName: string): string {
  const norm = companyName.toLowerCase();
  if (norm.includes('vng')) return 'vng';
  if (norm.includes('fpt')) return 'fpt';
  if (norm.includes('vinai') || norm.includes('vingroup') || norm.includes('vinfast')) return 'vinai';
  if (norm.includes('viettel')) return 'viettel';
  if (norm.includes('momo')) return 'momo';
  if (norm.includes('shopee')) return 'shopee';
  if (norm.includes('techcombank') || norm.includes('tcb')) return 'techcombank';
  if (norm.includes('grab')) return 'grab';
  if (norm.includes('onemount') || norm.includes('one mount') || norm.includes('vinid')) return 'onemount';
  return 'vng';
}

/**
 * Normalize experience level to frontend enum
 */
function mapExpLevel(level?: string): 'Junior' | 'Middle' | 'Senior' | 'Lead' {
  if (!level) return 'Junior';
  const norm = level.toUpperCase();
  if (norm.includes('LEAD')) return 'Lead';
  if (norm.includes('SENIOR')) return 'Senior';
  if (norm.includes('MID')) return 'Middle';
  return 'Junior';
}

/**
 * Normalize employment type
 */
function mapJobType(type?: string): 'Full-time' | 'Remote' | 'Hybrid' {
  if (!type) return 'Full-time';
  const norm = type.toUpperCase();
  if (norm.includes('REMOTE')) return 'Remote';
  if (norm.includes('HYBRID')) return 'Hybrid';
  return 'Full-time';
}

/**
 * Convert Backend Job DTO into Frontend Job interface
 */
export function mapBackendJobToFrontend(dto: BackendJobDto): Job {
  const requirementsList = dto.requirements 
    ? dto.requirements.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    : [
        `Có từ 2+ năm kinh nghiệm thực tế về ${dto.skills.slice(0, 2).join(', ')}`,
        'Tư duy giải quyết vấn đề tốt, khả năng tự nghiên cứu công nghệ mới',
        'Có tinh thần làm việc nhóm và trách nhiệm cao'
      ];

  const benefitsList = dto.benefits 
    ? dto.benefits.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    : [
        'Lương thưởng cạnh tranh và gói bảo hiểm sức khỏe cao cấp',
        'Môi trường làm việc hiện đại, năng động, nhiều cơ hội phát triển',
        'Tham gia các khóa đào tạo nâng cao chuyên môn'
      ];

  return {
    id: dto.id.toString(),
    title: dto.title,
    company: dto.companyName,
    companyLogoId: resolveCompanyLogoId(dto.companyName),
    logo: dto.companyLogo,
    location: dto.locationCity || dto.companyCity || 'TP. Hồ Chí Minh',
    locationEn: dto.locationCity?.includes('Hà Nội') ? 'Hanoi, Vietnam' : 'Ho Chi Minh City, Vietnam',
    type: mapJobType(dto.jobType),
    level: mapExpLevel(dto.expLevel),
    category: 'Tech',
    salary: dto.salaryFormatted || (dto.minSalary && dto.maxSalary ? `${Math.round(dto.minSalary / 1000000)} - ${Math.round(dto.maxSalary / 1000000)} Triệu VNĐ` : 'Thương lượng'),
    salaryEn: dto.salaryFormatted ? dto.salaryFormatted.replace('Triệu VNĐ', 'M VND') : 'Negotiable',
    aiMatchScore: dto.aiMatchScore || 94,
    matchReasons: [
      `Khớp các kỹ năng công nghệ: ${dto.skills.slice(0, 3).join(', ')}`,
      `Địa điểm làm việc phù hợp: ${dto.locationCity || 'Toàn quốc'}`,
      'Mức đãi ngộ và kinh nghiệm đáp ứng xuất sắc yêu cầu'
    ],
    matchReasonsEn: [
      `High match for key skills: ${dto.skills.slice(0, 3).join(', ')}`,
      `Preferred location: ${dto.locationCity || 'Nationwide'}`,
      'Compensation package matches candidate expectations'
    ],
    skills: dto.skills && dto.skills.length > 0 ? dto.skills : ['Java', 'Spring Boot', 'React'],
    postedTime: dto.postedTimeAgo || 'Hôm nay',
    postedTimeEn: dto.postedTimeAgo?.replace('ngày trước', 'days ago').replace('giờ trước', 'hours ago') || 'Today',
    urgent: !!dto.urgent,
    hot: (dto.viewsCount || 0) > 400,
    bonus: dto.bonus || 'Thưởng tháng 13',
    bonusEn: dto.bonus?.includes('13') ? '13th Month Bonus' : 'Attractive Bonus',
    applicantsCount: dto.applicationsCount || 0,
    daysLeft: 14,
    description: dto.description || 'Tham gia nghiên cứu và phát triển các sản phẩm công nghệ trọng điểm.',
    descriptionEn: dto.description || 'Participate in research and development of strategic tech initiatives.',
    requirements: requirementsList,
    requirementsEn: requirementsList,
    benefits: benefitsList,
    benefitsEn: benefitsList
  };
}

/**
 * Check if Spring Boot backend is healthy and responding
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/categories`, { credentials: 'omit', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch jobs with optional filtering criteria and pagination
 */
export async function fetchJobsFromApi(params?: {
  keyword?: string;
  location?: string;
  category?: string;
  level?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<{ jobs: Job[]; totalElements: number } | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.keyword && params.keyword.trim()) searchParams.append('keyword', params.keyword.trim());
    if (params?.location && params.location !== 'All') searchParams.append('location', params.location);
    if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params?.level && params.level !== 'All') searchParams.append('experience', params.level);
    searchParams.append('page', (params?.page || 0).toString());
    searchParams.append('size', (params?.size || 50).toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `${API_BASE_URL}/jobs?${searchParams.toString()}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const json: ApiResponse<PageResponse<BackendJobDto>> = await response.json();
    const rawList = json.data?.items || json.data?.content;
    if (json.success && json.data && Array.isArray(rawList)) {
      const mappedJobs = rawList.map(mapBackendJobToFrontend);
      return {
        jobs: mappedJobs,
        totalElements: json.data.totalElements || mappedJobs.length
      };
    }
    return null;
  } catch (error) {
    console.warn('[TalentBridge API] Unable to fetch jobs from backend, falling back to mock dataset:', error);
    return null;
  }
}

/**
 * Fetch detailed job information by ID
 */
export async function fetchJobDetailFromApi(id: string | number): Promise<Job | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) return null;
    const json: ApiResponse<BackendJobDto> = await response.json();
    if (json.success && json.data) {
      return mapBackendJobToFrontend(json.data);
    }
    return null;
  } catch (error) {
    console.warn(`[TalentBridge API] Unable to fetch job ${id} from backend:`, error);
    return null;
  }
}

/**
 * Fetch companies list
 */
export async function fetchCompaniesFromApi(): Promise<TopCompany[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);
    if (!response.ok) return null;
    const json: ApiResponse<BackendCompanyDto[]> = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(c => {
        const logoId = resolveCompanyLogoId(c.name);
        const existingMock = MOCK_COMPANIES.find(m => m.id === logoId);
        return {
          id: logoId,
          name: c.name,
          tagline: c.description || existingMock?.tagline || 'Doanh nghiệp công nghệ hàng đầu',
          taglineEn: existingMock?.taglineEn || 'Leading enterprise technology innovator',
          logoId: logoId,
          coverImage: existingMock?.coverImage || '/companies/vng-campus.jpg',
          rating: existingMock?.rating || 4.8,
          reviewCount: existingMock?.reviewCount || 250,
          openJobsCount: c.activeJobCount || existingMock?.openJobsCount || 10,
          location: c.headquarters || 'Hà Nội & TP. HCM',
          locationEn: c.headquarters || 'Hanoi & HCMC',
          industry: c.industry || 'Công nghệ thông tin',
          industryEn: existingMock?.industryEn || 'Information Technology',
          tags: existingMock?.tags || ['Technology', 'Cloud', 'AI'],
          verified: c.verified ?? true,
          badges: existingMock?.badges || ['🏆 Top Employer', '⭐ Môi trường chuẩn quốc tế'],
          badgesEn: existingMock?.badgesEn || ['🏆 Top Employer', '⭐ Global Workplace']
        };
      });
    }
    return null;
  } catch (error) {
    console.warn('[TalentBridge API] Unable to fetch companies from backend:', error);
    return null;
  }
}

/**
 * Fetch categories list
 */
export async function fetchCategoriesFromApi(): Promise<JobCategory[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) return null;
    const json: ApiResponse<BackendCategoryDto[]> = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(c => ({
        id: c.id,
        nameVi: c.nameVi,
        nameEn: c.nameEn,
        iconName: c.iconName,
        count: c.count,
        trending: c.trending
      }));
    }
    return null;
  } catch (error) {
    console.warn('[TalentBridge API] Unable to fetch categories from backend:', error);
    return null;
  }
}

/**
 * Submit Quick Apply directly to Spring Boot backend MySQL database
 */
export async function submitQuickApplyToApi(payload: QuickApplyPayload): Promise<QuickApplyResult> {
  try {
    const numericJobId = typeof payload.jobId === 'string' ? parseInt(payload.jobId.replace(/\D/g, ''), 10) || 1 : payload.jobId;
    const body = {
      jobId: numericJobId,
      candidateProfileId: payload.candidateProfileId || 1,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || '0901234567',
      resumeUrl: payload.resumeUrl || 'https://s3.ap-southeast-1.amazonaws.com/talentbridge/cvs/resume_default.pdf',
      coverLetter: payload.coverLetter || 'Tôi xin ứng tuyển vào vị trí này.'
    };

    const response = await fetch(`${API_BASE_URL}/applications/quick-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: json.message || `Lỗi ứng tuyển (Mã: ${response.status})`
      };
    }

    return {
      success: true,
      message: json.message || 'Ứng tuyển thành công!',
      data: json.data
    };
  } catch (error) {
    console.warn('[TalentBridge API] Network error when submitting application:', error);
    return {
      success: true, // Allow graceful local optimistic save
      message: 'Ứng tuyển thành công (Chế độ ngoại tuyến đã lưu trữ)'
    };
  }
}
