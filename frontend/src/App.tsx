import React, { Suspense, lazy, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequireRole } from './routes/RequireRole';
import { PageLoader } from './components/ui/primitives';

// Public browsing pages stay in the main bundle for a fast first paint; dashboards, admin and
// account pages are code-split and only downloaded when the user opens them.
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitationPage').then((m) => ({ default: m.AcceptInvitationPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminModerationPage = lazy(() => import('./pages/admin/AdminModerationPage').then((m) => ({ default: m.AdminModerationPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })));
const AdminSkillsPage = lazy(() => import('./pages/admin/AdminSkillsPage').then((m) => ({ default: m.AdminSkillsPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const ApplicantsPage = lazy(() => import('./pages/employer/ApplicantsPage').then((m) => ({ default: m.ApplicantsPage })));
const EmployerAnalyticsPage = lazy(() => import('./pages/employer/EmployerAnalyticsPage').then((m) => ({ default: m.EmployerAnalyticsPage })));
const EmployerCompanyPage = lazy(() => import('./pages/employer/EmployerCompanyPage').then((m) => ({ default: m.EmployerCompanyPage })));
const EmployerDashboard = lazy(() => import('./pages/employer/EmployerDashboard').then((m) => ({ default: m.EmployerDashboard })));
const EmployersPage = lazy(() => import('./pages/EmployersPage').then((m) => ({ default: m.EmployersPage })));
const InterviewsAgendaPage = lazy(() => import('./pages/employer/InterviewsAgendaPage').then((m) => ({ default: m.InterviewsAgendaPage })));
const JobFormPage = lazy(() => import('./pages/employer/JobFormPage').then((m) => ({ default: m.JobFormPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const MyApplicationsPage = lazy(() => import('./pages/MyApplicationsPage').then((m) => ({ default: m.MyApplicationsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SavedJobsPage = lazy(() => import('./pages/SavedJobsPage').then((m) => ({ default: m.SavedJobsPage })));
const TalentPoolPage = lazy(() => import('./pages/employer/TalentPoolPage').then((m) => ({ default: m.TalentPoolPage })));
const TeamPage = lazy(() => import('./pages/employer/TeamPage').then((m) => ({ default: m.TeamPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isFullHeightApp = pathname.startsWith('/messages');
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!isFullHeightApp && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="employers" element={<EmployersPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/:tool" element={<ToolsPage />} />
        <Route
          path="profile"
          element={
            <RequireRole>
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="applications"
          element={
            <RequireRole role="candidate">
              <MyApplicationsPage />
            </RequireRole>
          }
        />
        <Route
          path="saved-jobs"
          element={
            <RequireRole role="candidate">
              <SavedJobsPage />
            </RequireRole>
          }
        />
        <Route
          path="employer"
          element={
            <RequireRole role="recruiter">
              <EmployerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="employer/jobs/new"
          element={
            <RequireRole role="recruiter">
              <JobFormPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/jobs/:id/edit"
          element={
            <RequireRole role="recruiter">
              <JobFormPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/applicants"
          element={
            <RequireRole role="recruiter">
              <ApplicantsPage />
            </RequireRole>
          }
        />
        <Route path="invite/:token" element={<AcceptInvitationPage />} />
        <Route
          path="messages"
          element={
            <RequireRole>
              <MessagesPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/team"
          element={
            <RequireRole role="recruiter">
              <TeamPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/interviews"
          element={
            <RequireRole role="recruiter">
              <InterviewsAgendaPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/company"
          element={
            <RequireRole role="recruiter">
              <EmployerCompanyPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/analytics"
          element={
            <RequireRole role="recruiter">
              <EmployerAnalyticsPage />
            </RequireRole>
          }
        />
        <Route
          path="employer/talent-pool"
          element={
            <RequireRole role="recruiter">
              <TalentPoolPage />
            </RequireRole>
          }
        />
        <Route
          path="admin"
          element={
            <RequireRole role="admin">
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/users"
          element={
            <RequireRole role="admin">
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/moderation"
          element={
            <RequireRole role="admin">
              <AdminModerationPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/skills"
          element={
            <RequireRole role="admin">
              <AdminSkillsPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <RequireRole role="admin">
              <AdminAuditLogsPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/reviews"
          element={
            <RequireRole role="admin">
              <AdminReviewsPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
