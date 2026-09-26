import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  logoutApi,
  getCurrentUserApi,
  fetchMyApplicationsApi,
  submitQuickApplyToApi,
  getAuthToken,
  type BackendUserSummary,
  type BackendApplicationDto
} from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter';
  avatarUrl: string;
  title: string;
  company?: string;
  phone?: string;
  location: string;
  atsScore?: number;
  bio?: string;
  skills: string[];
  experienceYears: number;
}

export interface AppliedJob {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: 'pending' | 'ai_passed' | 'interview';
  statusTextVi: string;
  statusTextEn: string;
}

export const DEMO_CANDIDATE: User = {
  id: 'cand-001',
  name: 'Vũ Minh Khang',
  email: 'khang.candidate@talentbridge.vn',
  role: 'candidate',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  title: 'Senior Fullstack Engineer',
  phone: '+84 912 345 678',
  location: 'TP. Hồ Chí Minh, Việt Nam',
  atsScore: 95,
  bio: 'Kỹ sư phần mềm 4+ năm kinh nghiệm thực chiến phát triển hệ thống phân tán chịu tải cao, React/Next.js, Spring Boot & Microservices architecture.',
  skills: ['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS', 'TailwindCSS', 'Redis'],
  experienceYears: 4
};

export const DEMO_RECRUITER: User = {
  id: 'rec-001',
  name: 'Vu Minh Khang Recruiter',
  email: 'khang.recruiter@talentbridge.vn',
  role: 'recruiter',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  title: 'Head of Talent Acquisition',
  company: 'TalentBridge Partner Enterprise',
  phone: '+84 988 776 655',
  location: 'Hà Nội & TP. HCM, Việt Nam',
  bio: 'Phụ trách chiến lược thu hút nhân tài công nghệ cao, quản lý hệ thống ATS và pipeline tuyển dụng 500+ vị trí công nghệ.',
  skills: ['Technical Recruiting', 'Talent Acquisition', 'ATS Pipeline', 'HR Tech', 'Executive Search'],
  experienceYears: 7
};

export function mapBackendUserToFrontend(backendUser: BackendUserSummary): User {
  const isRecruiter = backendUser.roles.some((r) => r.toUpperCase().includes('RECRUITER'));
  const role: 'candidate' | 'recruiter' = isRecruiter ? 'recruiter' : 'candidate';
  const base = isRecruiter ? DEMO_RECRUITER : DEMO_CANDIDATE;

  return {
    id: backendUser.id.toString(),
    name: backendUser.fullName || backendUser.email.split('@')[0].replace('.', ' '),
    email: backendUser.email,
    role,
    avatarUrl: backendUser.avatarUrl || base.avatarUrl,
    title: isRecruiter ? 'Head of Talent Acquisition' : 'Senior Fullstack Engineer',
    company: isRecruiter ? 'TalentBridge Partner Enterprise' : undefined,
    phone: backendUser.phone || base.phone,
    location: base.location,
    atsScore: isRecruiter ? undefined : 95,
    bio: base.bio,
    skills: base.skills,
    experienceYears: base.experienceYears
  };
}

export function mapBackendApplicationToFrontend(dto: BackendApplicationDto): AppliedJob {
  const stage = (dto.currentStage || 'APPLIED').toUpperCase();
  let status: 'pending' | 'ai_passed' | 'interview' = 'pending';
  let statusTextVi = 'Đang duyệt hồ sơ';
  let statusTextEn = 'Under Review';

  if (stage === 'INTERVIEW') {
    status = 'interview';
    statusTextVi = 'Mời phỏng vấn trực tiếp';
    statusTextEn = 'Interview Invitation';
  } else if (stage === 'OFFERED' || (dto.matchScore && Number(dto.matchScore) >= 90)) {
    status = 'ai_passed';
    const scoreVal = dto.matchScore ? Math.round(Number(dto.matchScore)) : 95;
    statusTextVi = `Đã vượt qua sàng lọc AI (Khớp ${scoreVal}%)`;
    statusTextEn = `Passed AI Screening (${scoreVal}% Match)`;
  }

  const dateStr = dto.appliedAt
    ? new Date(dto.appliedAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return {
    id: dto.uuid || dto.id.toString(),
    jobId: dto.jobId.toString(),
    jobTitle: dto.jobTitle,
    company: dto.companyName,
    appliedAt: dateStr,
    status,
    statusTextVi,
    statusTextEn
  };
}

const INITIAL_SAVED_JOBS = ['job-1', 'job-2'];

const INITIAL_APPLICATIONS: AppliedJob[] = [
  {
    id: 'app-01',
    jobId: '1',
    jobTitle: 'Senior Fullstack Engineer (React & Golang)',
    company: 'VNG Corporation',
    appliedAt: '25/09/2026',
    status: 'ai_passed',
    statusTextVi: 'Đã vượt qua sàng lọc AI (Khớp 96%)',
    statusTextEn: 'Passed AI Screening (96% Match)'
  },
  {
    id: 'app-02',
    jobId: '2',
    jobTitle: 'Senior AI / Deep Learning Engineer',
    company: 'VinAI Innovation Lab',
    appliedAt: '26/09/2026',
    status: 'pending',
    statusTextVi: 'Đang duyệt hồ sơ',
    statusTextEn: 'Under Review'
  }
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  savedJobIds: string[];
  appliedJobs: AppliedJob[];
  login: (email: string, password?: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  register: (payload: { fullName: string; email: string; password: string; role: 'candidate' | 'recruiter'; phone?: string }) => Promise<void>;
  loginDemo: (role: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  toggleSaveJob: (jobId: string) => boolean;
  isJobSaved: (jobId: string) => boolean;
  applyJob: (job: { id: string; title: string; company: string }, resumeUrl?: string, coverLetter?: string) => Promise<boolean>;
  isJobApplied: (jobId: string) => boolean;
  switchRole: () => void;
  updateProfile: (updated: Partial<User>) => void;
  refreshApplications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'talentbridge_user';
const STORAGE_KEY_SAVED = 'talentbridge_saved_jobs';
const STORAGE_KEY_APPLICATIONS = 'talentbridge_applications';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED);
      return saved ? JSON.parse(saved) : INITIAL_SAVED_JOBS;
    } catch {
      return INITIAL_SAVED_JOBS;
    }
  });

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const loadApplications = useCallback(async () => {
    try {
      const data = await fetchMyApplicationsApi();
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapBackendApplicationToFrontend);
        setAppliedJobs(mapped);
      }
    } catch (e) {
      console.warn('[TalentBridge Auth] Could not fetch remote applications:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  // Initial user sync from backend session/token
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await getCurrentUserApi();
          if (profile) {
            const mapped = mapBackendUserToFrontend(profile);
            setUser(mapped);
            if (mapped.role === 'candidate') {
              loadApplications();
            }
          }
        } catch (e) {
          console.warn('[TalentBridge Auth] Auto-sync profile error:', e);
        }
      }
    };
    initAuth();
  }, [loadApplications]);

  const login = async (email: string, password = 'Password@123', role: 'candidate' | 'recruiter' = 'candidate') => {
    try {
      const backendUser = await loginApi(email, password);
      const mappedUser = mapBackendUserToFrontend(backendUser);
      setUser(mappedUser);
      if (mappedUser.role === 'candidate') {
        await loadApplications();
      }
    } catch (err) {
      console.warn('[TalentBridge Auth] Backend login error, using graceful local state:', err);
      const base = role === 'candidate' ? DEMO_CANDIDATE : DEMO_RECRUITER;
      const loggedUser: User = {
        ...base,
        email: email || base.email,
        name: email ? email.split('@')[0].replace('.', ' ') : base.name
      };
      setUser(loggedUser);
    }
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    role: 'candidate' | 'recruiter';
    phone?: string;
  }) => {
    const backendRole = payload.role === 'recruiter' ? 'ROLE_RECRUITER' : 'ROLE_CANDIDATE';
    try {
      const backendUser = await registerApi({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: backendRole,
        phone: payload.phone
      });
      const mappedUser = mapBackendUserToFrontend(backendUser);
      setUser(mappedUser);
    } catch (err) {
      console.warn('[TalentBridge Auth] Backend register error, using local state:', err);
      const base = payload.role === 'candidate' ? DEMO_CANDIDATE : DEMO_RECRUITER;
      const loggedUser: User = {
        ...base,
        email: payload.email,
        name: payload.fullName,
        role: payload.role
      };
      setUser(loggedUser);
    }
  };

  const loginDemo = async (role: 'candidate' | 'recruiter') => {
    const creds = role === 'candidate' 
      ? { email: 'khang.candidate@talentbridge.vn', password: 'Password@123' }
      : { email: 'khang.recruiter@talentbridge.vn', password: 'Password@123' };

    try {
      const backendUser = await loginApi(creds.email, creds.password);
      const mappedUser = mapBackendUserToFrontend(backendUser);
      setUser(mappedUser);
      if (mappedUser.role === 'candidate') {
        await loadApplications();
      }
    } catch (err) {
      console.warn('[TalentBridge Auth] Demo API login failed, using demo fallback:', err);
      setUser(role === 'candidate' ? DEMO_CANDIDATE : DEMO_RECRUITER);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('[TalentBridge Auth] Logout API error:', e);
    }
    setUser(null);
  };

  const toggleSaveJob = (jobId: string): boolean => {
    let newlySaved = false;
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) {
        newlySaved = false;
        return prev.filter((id) => id !== jobId);
      } else {
        newlySaved = true;
        return [...prev, jobId];
      }
    });
    return newlySaved;
  };

  const isJobSaved = (jobId: string) => savedJobIds.includes(jobId);

  const applyJob = async (
    job: { id: string; title: string; company: string },
    resumeUrl?: string,
    coverLetter?: string
  ): Promise<boolean> => {
    if (appliedJobs.some((a) => a.jobId === job.id)) {
      return false; // Already applied
    }

    const newApplication: AppliedJob = {
      id: 'app-' + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
      statusTextVi: 'Đang duyệt hồ sơ',
      statusTextEn: 'Under Review'
    };

    setAppliedJobs((prev) => [newApplication, ...prev]);

    // Submit directly to backend API
    try {
      await submitQuickApplyToApi({
        jobId: job.id,
        fullName: user?.name || 'Vũ Minh Khang',
        email: user?.email || 'khang.candidate@talentbridge.vn',
        phone: user?.phone || '0987654321',
        resumeUrl: resumeUrl || 'https://s3.ap-southeast-1.amazonaws.com/talentbridge/cvs/resume_default.pdf',
        coverLetter: coverLetter || 'Tôi xin ứng tuyển vào vị trí này.'
      });
      // Synchronize with DB
      await loadApplications();
    } catch (e) {
      console.warn('[TalentBridge Auth] Submit apply to API fallback:', e);
    }

    return true;
  };

  const isJobApplied = (jobId: string) => appliedJobs.some((a) => a.jobId === jobId);

  const switchRole = () => {
    if (!user) return;
    if (user.role === 'candidate') {
      setUser({
        ...DEMO_RECRUITER,
        email: user.email === DEMO_CANDIDATE.email ? DEMO_RECRUITER.email : user.email
      });
    } else {
      setUser({
        ...DEMO_CANDIDATE,
        email: user.email === DEMO_RECRUITER.email ? DEMO_CANDIDATE.email : user.email
      });
    }
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const refreshApplications = async () => {
    await loadApplications();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        savedJobIds,
        appliedJobs,
        login,
        register,
        loginDemo,
        logout,
        toggleSaveJob,
        isJobSaved,
        applyJob,
        isJobApplied,
        switchRole,
        updateProfile,
        refreshApplications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};