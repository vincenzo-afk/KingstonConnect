import React, { Suspense, lazy, ComponentType } from 'react';
import { SkeletonDashboard } from '@/components/ui/Skeleton';

// =============================================================================
// LAZY PAGE LOADERS
// =============================================================================

// Error fallback component for failed lazy loads
const LazyLoadError: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f14]">
        <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load page</h2>
            <p className="text-slate-400 mb-4">Please try refreshing the page</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
            >
                Refresh
            </button>
        </div>
    </div>
);

// Helper function to create lazy-loaded components with error handling
function lazyLoad<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
    return lazy(() =>
        importFn().catch((error) => {
            console.error('Failed to load component:', error);
            return { default: LazyLoadError as unknown as T };
        })
    );
}

// =============================================================================
// LAZY LOADED PAGES
// =============================================================================

export const LazyDashboard = lazyLoad(() => import('@/pages/Dashboard'));
export const LazyStudyGPT = lazyLoad(() => import('@/pages/StudyGPT'));
export const LazyAttendance = lazyLoad(() => import('@/pages/Attendance'));
export const LazyResults = lazyLoad(() => import('@/pages/Results'));
export const LazyCalendar = lazyLoad(() => import('@/pages/Calendar'));
export const LazyTimetable = lazyLoad(() => import('@/pages/Timetable'));
export const LazyAssignments = lazyLoad(() => import('@/pages/Assignments'));
export const LazyNotes = lazyLoad(() => import('@/pages/Notes'));
export const LazyChat = lazyLoad(() => import('@/pages/Chat'));
export const LazyAnnouncements = lazyLoad(() => import('@/pages/Announcements'));
export const LazyAUPortal = lazyLoad(() => import('@/pages/AUPortal'));
export const LazyProfile = lazyLoad(() => import('@/pages/Profile'));
export const LazySettings = lazyLoad(() => import('@/pages/Settings'));
export const LazyStudents = lazyLoad(() => import('@/pages/Students'));
export const LazyTeachers = lazyLoad(() => import('@/pages/Teachers'));
export const LazyDepartments = lazyLoad(() => import('@/pages/Departments'));

// =============================================================================
// SUSPENSE WRAPPERS
// =============================================================================

interface PageSuspenseProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Suspense wrapper for page-level loading
 */
export const PageSuspense: React.FC<PageSuspenseProps> = ({
    children,
    fallback = <SkeletonDashboard />,
}) => {
    return <Suspense fallback={fallback}>{children}</Suspense>;
};

/**
 * Full screen loading fallback
 */
export const FullPageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f14]">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Loading...</p>
        </div>
    </div>
);

/**
 * Inline loading fallback (for smaller components)
 */
export const InlineLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center justify-center p-8 ${className || ''}`}>
        <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
);

// =============================================================================
// PRELOAD UTILITIES
// =============================================================================

/**
 * Preload a page component (useful for hover-based prefetching)
 */
export const preloadPage = {
    dashboard: () => import('@/pages/Dashboard'),
    studyGPT: () => import('@/pages/StudyGPT'),
    attendance: () => import('@/pages/Attendance'),
    results: () => import('@/pages/Results'),
    calendar: () => import('@/pages/Calendar'),
    timetable: () => import('@/pages/Timetable'),
    assignments: () => import('@/pages/Assignments'),
    notes: () => import('@/pages/Notes'),
    chat: () => import('@/pages/Chat'),
    announcements: () => import('@/pages/Announcements'),
    auPortal: () => import('@/pages/AUPortal'),
    profile: () => import('@/pages/Profile'),
    settings: () => import('@/pages/Settings'),
    students: () => import('@/pages/Students'),
    teachers: () => import('@/pages/Teachers'),
    departments: () => import('@/pages/Departments'),
};

/**
 * Preload multiple pages at once (useful on app mount)
 */
export function preloadCriticalPages() {
    // Preload most commonly accessed pages
    preloadPage.dashboard();
    preloadPage.attendance();
    preloadPage.chat();
}

// =============================================================================
// ROUTE CONFIGURATION FOR LAZY LOADING (Optional App.tsx replacement)
// =============================================================================

export interface RouteConfig {
    path: string;
    element: React.LazyExoticComponent<ComponentType<any>>;
    preload?: () => Promise<any>;
}

export const lazyRoutes: RouteConfig[] = [
    { path: '/dashboard', element: LazyDashboard, preload: preloadPage.dashboard },
    { path: '/studygpt', element: LazyStudyGPT, preload: preloadPage.studyGPT },
    { path: '/attendance', element: LazyAttendance, preload: preloadPage.attendance },
    { path: '/results', element: LazyResults, preload: preloadPage.results },
    { path: '/calendar', element: LazyCalendar, preload: preloadPage.calendar },
    { path: '/timetable', element: LazyTimetable, preload: preloadPage.timetable },
    { path: '/assignments', element: LazyAssignments, preload: preloadPage.assignments },
    { path: '/notes', element: LazyNotes, preload: preloadPage.notes },
    { path: '/chat', element: LazyChat, preload: preloadPage.chat },
    { path: '/announcements', element: LazyAnnouncements, preload: preloadPage.announcements },
    { path: '/au-portal', element: LazyAUPortal, preload: preloadPage.auPortal },
    { path: '/profile', element: LazyProfile, preload: preloadPage.profile },
    { path: '/settings', element: LazySettings, preload: preloadPage.settings },
    { path: '/students', element: LazyStudents, preload: preloadPage.students },
    { path: '/teachers', element: LazyTeachers, preload: preloadPage.teachers },
    { path: '/departments', element: LazyDepartments, preload: preloadPage.departments },
];
