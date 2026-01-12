import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useUIStore } from '@/stores';
import { DashboardLayout } from '@/components/layout';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { PageErrorBoundary } from '@/components/ui/ErrorBoundary';

// =============================================================================
// QUERY CLIENT
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// =============================================================================
// LAZY LOADED PAGES
// =============================================================================

const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const StudyGPTPage = lazy(() => import('@/pages/StudyGPT'));
const AttendancePage = lazy(() => import('@/pages/Attendance'));
const ResultsPage = lazy(() => import('@/pages/Results'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const TimetablePage = lazy(() => import('@/pages/Timetable'));
const AssignmentsPage = lazy(() => import('@/pages/Assignments'));
const NotesPage = lazy(() => import('@/pages/Notes'));
const ChatPage = lazy(() => import('@/pages/Chat'));
const AnnouncementsPage = lazy(() => import('@/pages/Announcements'));
const AUPortalPage = lazy(() => import('@/pages/AUPortal'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const StudentsPage = lazy(() => import('@/pages/Students'));
const TeachersPage = lazy(() => import('@/pages/Teachers'));
const DepartmentsPage = lazy(() => import('@/pages/Departments'));

// =============================================================================
// LOADING FALLBACK
// =============================================================================

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0f14]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white font-medium">Loading...</p>
    </div>
  </div>
);

// =============================================================================
// PROTECTED ROUTE
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// =============================================================================
// PUBLIC ROUTE (redirects to dashboard if authenticated)
// =============================================================================

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// =============================================================================
// APP ROUTES
// =============================================================================

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Suspense fallback={<SkeletonDashboard />}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/studygpt" element={<StudyGPTPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/timetable" element={<TimetablePage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/au-portal" element={<AUPortalPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

// =============================================================================
// THEME HANDLER
// =============================================================================

const ThemeHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Update meta theme-color for mobile
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0a0f14' : '#ffffff');
    }
  }, [theme]);

  return <>{children}</>;
};

// =============================================================================
// MAIN APP
// =============================================================================

const App: React.FC = () => {
  return (
    <PageErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeHandler>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeHandler>
      </QueryClientProvider>
    </PageErrorBoundary>
  );
};

export default App;
