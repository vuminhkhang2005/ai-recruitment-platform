import React, { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { EmployersPage } from './pages/EmployersPage';
import { ToolsPage } from './pages/ToolsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { JobFormPage } from './pages/employer/JobFormPage';
import { ApplicantsPage } from './pages/employer/ApplicantsPage';
import { RequireRole } from './routes/RequireRole';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Layout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <ScrollToTop />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
