/**
 * Centralized student data for the student dashboard and AI context.
 * Single source of truth so the dashboard and StudyGPT always agree on what
 * is displayed to / known about the student.
 *
 * Real-data mode: all demo/mock datasets are intentionally empty. The
 * dashboard and StudyGPT now read the student's actual data from the
 * persisted stores (auResultsStore for AU portal results, attendanceStore
 * for subject attendance). Fill these only when a real backend is wired in.
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

export const UPCOMING_DEADLINES: StudentDeadline[] = [];

/**
 * Returns deadlines ordered by due date (nearest first) with days-remaining
 * info relative to `now`. Derives open assignments from the persisted
 * assignments store so upcoming-deadline data always reflects real data.
 */
export function getDeadlinesSorted(now = new Date()) {
    const raw: StudentDeadline[] = [...UPCOMING_DEADLINES];
    try {
        const stored = JSON.parse(
            localStorage.getItem('kingston-assignments') || 'null'
        );
        if (Array.isArray(stored)) {
            stored.forEach((a: Record<string, unknown>) => {
                if (typeof a.title === 'string' && typeof a.dueDate === 'string' && a.status !== 'graded') {
                    raw.push({
                        id: String(a.id ?? a.title),
                        title: a.title,
                        subject: typeof a.subject === 'string' ? a.subject : '',
                        dueDate: a.dueDate as string,
                        type: 'assignment' as const,
                    });
                }
            });
        }
    } catch {
        // localStorage unavailable or corrupt — fall back to static list
    }
    return raw
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

export const RECENT_ACTIVITY: StudentActivity[] = [];

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
    overall: 0,
    lastMonth: 0,
    subjectWise: [],
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
    /** Current CGPA shown on the dashboard (0 until real results are fetched/entered). */
    cgpa: 0,
    /** Semester-over-semester SGPA trajectory (used for trend chart + AI). */
    trajectory: [] as SemesterResult[],
    /** Credits earned so far (180 total for the degree). */
    creditsEarned: 0,
    degreeCreditsTotal: 180,
    /** Class rank, e.g. "#15" (0 = not recorded). */
    rank: 0,
};
