import React, { createContext, useContext, useState, useEffect } from 'react';

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
  name: 'Nguyễn Văn An',
  email: 'an.nguyen.dev@example.com',
  role: 'candidate',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  title: 'Senior Fullstack Engineer',
  phone: '+84 912 345 678',
  location: 'TP. Hồ Chí Minh, Việt Nam',
  atsScore: 94,
  bio: 'Kỹ sư phần mềm 4+ năm kinh nghiệm thực chiến phát triển hệ thống phân tán chịu tải cao, React/Next.js, Node.js & Microservices architecture.',
  skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'TailwindCSS', 'Redis'],
  experienceYears: 4
};

export const DEMO_RECRUITER: User = {
  id: 'rec-001',
  name: 'Lê Thu Trang',
  email: 'trang.le@fpt.com',
  role: 'recruiter',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  title: 'Head of Talent Acquisition',
  company: 'FPT Software',
  phone: '+84 988 765 432',
  location: 'Hà Nội, Việt Nam',
  bio: 'Phụ trách chiến lược thu hút nhân tài công nghệ cao, quản lý hệ thống ATS và pipeline tuyển dụng 500+ vị trí công nghệ.',
  skills: ['Technical Recruiting', 'Talent Acquisition', 'ATS Pipeline', 'HR Tech', 'Executive Search'],
  experienceYears: 7
};

const INITIAL_SAVED_JOBS = ['job-1', 'job-2']; // VinAI & VNG

const INITIAL_APPLICATIONS: AppliedJob[] = [
  {
    id: 'app-01',
    jobId: 'job-1',
    jobTitle: 'Senior AI / Deep Learning Engineer',
    company: 'VinAI Innovation Lab',
    appliedAt: '08/09/2026',
    status: 'ai_passed',
    statusTextVi: 'Đã vượt qua sàng lọc AI (Khớp 98%)',
    statusTextEn: 'Passed AI Screening (98% Match)'
  },
  {
    id: 'app-02',
    jobId: 'job-2',
    jobTitle: 'Senior Fullstack Engineer (React & Golang)',
    company: 'VNG Corporation',
    appliedAt: '09/09/2026',
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
  login: (email: string, role?: 'candidate' | 'recruiter') => void;
  loginDemo: (role: 'candidate' | 'recruiter') => void;
  logout: () => void;
  toggleSaveJob: (jobId: string) => boolean;
  isJobSaved: (jobId: string) => boolean;
  applyJob: (job: { id: string; title: string; company: string }) => boolean;
  isJobApplied: (jobId: string) => boolean;
  switchRole: () => void;
  updateProfile: (updated: Partial<User>) => void;
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

  const login = (email: string, role: 'candidate' | 'recruiter' = 'candidate') => {
    const base = role === 'candidate' ? DEMO_CANDIDATE : DEMO_RECRUITER;
    const loggedUser: User = {
      ...base,
      email: email || base.email,
      name: email ? email.split('@')[0].replace('.', ' ') : base.name
    };
    setUser(loggedUser);
  };

  const loginDemo = (role: 'candidate' | 'recruiter') => {
    setUser(role === 'candidate' ? DEMO_CANDIDATE : DEMO_RECRUITER);
  };

  const logout = () => {
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

  const applyJob = (job: { id: string; title: string; company: string }): boolean => {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        savedJobIds,
        appliedJobs,
        login,
        loginDemo,
        logout,
        toggleSaveJob,
        isJobSaved,
        applyJob,
        isJobApplied,
        switchRole,
        updateProfile
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