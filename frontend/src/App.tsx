import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { SubmissionStudioPage } from './pages/SubmissionStudioPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { VisualStudioPage } from './pages/VisualStudioPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogPage } from './pages/AuditLogPage';

const queryClient = new QueryClient();

// Protected Layout with Navigation
const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-xs text-[#A3A3A3]">
        Loading PLUMB workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-[#2A2A2A] text-center text-xs text-[#A3A3A3] font-mono">
        PLUMB — Every Detail. On Brand. · ABES Engineering College
      </footer>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Login */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Workspace */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="submissions/:id" element={<SubmissionStudioPage />} />
              <Route path="reviews" element={<ReviewQueuePage />} />
              <Route path="guidelines" element={<GuidelinesPage />} />
              <Route path="visual" element={<VisualStudioPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="audit" element={<AuditLogPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
