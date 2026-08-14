/**
 * Centralized student data for the student dashboard and AI context.
 * Single source of truth so the dashboard and StudyGPT always agree on what
 * is displayed to / known about the student.
 *
 * In this demo app everything is mock data (no backend). When real data
 * sources (Firebase / API) are wired in, update the exported datasets here.
 */

// ---------------------------------------------------------------------------
// Upcoming deadlines (assignments, quizzes, projects)
// ---------------------------------------------------------------------------

export interface StudentDeadline {
    id: string;
    title: string;
    subject: string;
    dueDate: string; // ISO date
    type: 'assignment' | 'quiz' | 'project' | 'exam';
}

export const UPCOMING_DEADLINES: StudentDeadline[] = [
    {
        id: '1',
        title: 'DS Assignment 1',
        subject: 'Data Structures',
        dueDate: '2024-01-20',
        type: 'assignment',
    },
    {
        id: '2',
        title: 'Algorithms Quiz',
        subject: 'Algorithms',
        dueDate: '2024-01-22',
        type: 'quiz',
    },
    {
        id: '3',
        title: 'DBMS Project',
        subject: 'Database Systems',
        dueDate: '2024-01-25',
        type: 'project',
    },
];

/**
 * Returns deadlines ordered by due date (nearest first) with days-remaining
 * info relative to `now`.
 */
export function getDeadlinesSorted(now = new Date('2024-01-15T09:00:00')) {
    return [...UPCOMING_DEADLINES]
        .map((d) => ({
            ...d,
            daysUntil: Math.ceil(
                (new Date(d.dueDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
            ),
        }))
        .sort((a, b) => a.daysUntil - b.daysUntil);
}

// ---------------------------------------------------------------------------
// Recent activity feed
// ---------------------------------------------------------------------------

export type ActivityType = 'notes' | 'graded' | 'attendance' | 'result';

export interface StudentActivity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    time: string;
}

export const RECENT_ACTIVITY: StudentActivity[] = [
    {
        id: '1',
        type: 'notes',
        title: 'New notes uploaded',
        description: 'Data Structures - Chapter 5',
        time: '2 hours ago',
    },
    {
        id: '2',
        type: 'graded',
        title: 'Assignment graded',
        description: 'Algorithms Assignment 2 - 18/20',
        time: '5 hours ago',
    },
    {
        id: '3',
        type: 'attendance',
        title: 'Attendance marked',
        description: 'Present in DBMS class',
        time: '1 day ago',
    },
];

// ---------------------------------------------------------------------------
// Attendance stats (semester)
// ---------------------------------------------------------------------------

export interface SubjectAttendance {
    name: string;
    percentage: number;
}

export interface AttendanceStats {
    overall: number; // this semester
    lastMonth: number; // rolling month
    subjectWise: SubjectAttendance[];
}

export const ATTENDANCE_STATS: AttendanceStats = {
    overall: 85,
    lastMonth: 83, // +2% trend shown on dashboard
    subjectWise: [
        { name: 'Data Structures', percentage: 85 },
        { name: 'Algorithms', percentage: 90 },
        { name: 'Database Systems', percentage: 74 },
        { name: 'Operating Systems', percentage: 88 },
        { name: 'Discrete Mathematics', percentage: 89 },
    ],
};

// ---------------------------------------------------------------------------
// Results / academic snapshot
// ---------------------------------------------------------------------------

export interface SemesterResult {
    semester: number;
    sgpa: number;
    credits: number;
}

export const RESULTS_STATS = {
    /** Current CGPA shown on the dashboard. */
    cgpa: 8.5,
    /** Semester-over-semester SGPA trajectory (used for trend chart + AI). */
    trajectory: [
        { semester: 1, sgpa: 7.6 },
        { semester: 2, sgpa: 7.9 },
        { semester: 3, sgpa: 8.1 },
        { semester: 4, sgpa: 8.3 },
        { semester: 5, sgpa: 8.4 },
    ] as SemesterResult[],
    /** Credits earned so far (180 total for the degree). */
    creditsEarned: 120,
    degreeCreditsTotal: 180,
    /** Class rank, e.g. "#15". */
    rank: 15,
};
