/**
 * Pages Barrel Export
 * Note: Pages are lazy-loaded in App.tsx, so this file is mainly for reference.
 * Direct imports from individual page files are used for code splitting.
 */

// Auth Pages
export { default as LoginPage } from './Login';
export { default as RegisterPage } from './Register';

// Main Pages
export { default as DashboardPage } from './Dashboard';
export { default as StudyGPTPage } from './StudyGPT';
export { default as AttendancePage } from './Attendance';
export { default as ResultsPage } from './Results';
export { default as CalendarPage } from './Calendar';
export { default as TimetablePage } from './Timetable';
export { default as AssignmentsPage } from './Assignments';
export { default as NotesPage } from './Notes';
export { default as ChatPage } from './Chat';
export { default as AnnouncementsPage } from './Announcements';
export { default as AUPortalPage } from './AUPortal';
export { default as ProfilePage } from './Profile';
export { default as SettingsPage } from './Settings';

// Admin Pages
export { default as StudentsPage } from './Students';
export { default as TeachersPage } from './Teachers';
export { default as DepartmentsPage } from './Departments';
