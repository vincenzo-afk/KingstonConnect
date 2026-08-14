import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TYPES — Anna University grading system (R2017/R2021)
// =============================================================================

export type AUPerformance = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'U' | 'W' | 'SA' | 'RA';

export const AU_GRADE_POINTS: Record<AUPerformance, number> = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'U': 0,
    'W': 0,
    'SA': 0,
    'RA': 0,
};

export const ALL_AU_GRADES: AUPerformance[] = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'U', 'W', 'SA', 'RA'];

export interface AUSubject {
    code: string;      // e.g. CS8391
    name: string;      // e.g. Data Structures
    credits: number;
    grade: AUPerformance;
    internalMarks?: number;  // out of 50
}

export interface AUSemester {
    semester: number;
    examSession: string;    // e.g. "Nov/Dec 2024"
    subjects: AUSubject[];
    gpa?: number;           // computed
    creditsEarned?: number;
}

export interface AUResultsState {
    registerNo: string;
    dateOfBirth: string;
    semesters: AUSemester[];
    lastCrawlAttempt: number | null;
    crawlStatus: 'idle' | 'trying' | 'blocked-by-captcha' | 'failed' | 'manual-only';
    // Actions
    setStudentIdentity: (registerNo: string, dateOfBirth: string) => void;
    addSemester: (semester: AUSemester) => void;
    updateSemester: (semester: number, patch: Partial<AUSemester>) => void;
    removeSemester: (semester: number) => void;
    addSubject: (semester: number, subject: AUSubject) => void;
    updateSubject: (semester: number, code: string, patch: Partial<AUSubject>) => void;
    removeSubject: (semester: number, code: string) => void;
    setCrawlStatus: (status: AUResultsState['crawlStatus']) => void;
    recordCrawlAttempt: () => void;
    clearAll: () => void;
    // Computed selectors (pure helpers)
    computeSemesterGPA: (semester: AUSemester) => { gpa: number; creditsEarned: number } | null;
    getCGPA: () => number | null;
    getTotalCredits: () => number;
    getWeakSubjects: () => { semester: number; subject: AUSubject; gradePoint: number }[];
    getAttendanceEligible: () => { totalClasses: number; attended: number; percentage: number };
}

// =============================================================================
// PURE HELPERS
// =============================================================================

const computeGPA = (subjects: AUSubject[]): { gpa: number; creditsEarned: number } | null => {
    const graded = subjects.filter(s => AU_GRADE_POINTS[s.grade] > 0);
    if (graded.length === 0) return null;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const earned = graded.reduce((sum, s) => sum + s.credits, 0);
    const weighted = graded.reduce((sum, s) => sum + AU_GRADE_POINTS[s.grade] * s.credits, 0);
    return { gpa: parseFloat((weighted / earned).toFixed(2)), creditsEarned: earned - (totalCredits - earned) * 0 };
};

const roundGPA = (value: number): number => parseFloat(value.toFixed(2));

// =============================================================================
// STORE
// =============================================================================

export const useAUResultsStore = create<AUResultsState>()(
    persist(
        (set, get) => ({
            registerNo: '',
            dateOfBirth: '',
            semesters: [],
            lastCrawlAttempt: null,
            crawlStatus: 'idle',

            setStudentIdentity: (registerNo, dateOfBirth) =>
                set({ registerNo, dateOfBirth }),

            addSemester: (semester) =>
                set((state) => {
                    const without = state.semesters.filter((s) => s.semester !== semester.semester);
                    return { semesters: [...without, semester].sort((a, b) => a.semester - b.semester) };
                }),

            updateSemester: (semester, patch) =>
                set((state) => ({
                    semesters: state.semesters.map((s) =>
                        s.semester === semester ? { ...s, ...patch } : s
                    ),
                })),

            removeSemester: (semester) =>
                set((state) => ({
                    semesters: state.semesters.filter((s) => s.semester !== semester),
                })),

            addSubject: (semester, subject) =>
                set((state) => ({
                    semesters: state.semesters.map((s) =>
                        s.semester === semester
                            ? { ...s, subjects: [...s.subjects.filter((sub) => sub.code !== subject.code), subject] }
                            : s
                    ),
                })),

            updateSubject: (semester, code, patch) =>
                set((state) => ({
                    semesters: state.semesters.map((s) =>
                        s.semester === semester
                            ? {
                                ...s,
                                subjects: s.subjects.map((sub) =>
                                    sub.code === code ? { ...sub, ...patch } : sub
                                ),
                            }
                            : s
                    ),
                })),

            removeSubject: (semester, code) =>
                set((state) => ({
                    semesters: state.semesters.map((s) =>
                        s.semester === semester
                            ? { ...s, subjects: s.subjects.filter((sub) => sub.code !== code) }
                            : s
                    ),
                })),

            setCrawlStatus: (status) => set({ crawlStatus: status }),

            recordCrawlAttempt: () =>
                set((state) => ({
                    lastCrawlAttempt: Date.now(),
                    crawlStatus: state.crawlStatus === 'idle' ? 'blocked-by-captcha' : state.crawlStatus,
                })),

            clearAll: () =>
                set({
                    registerNo: '',
                    dateOfBirth: '',
                    semesters: [],
                    lastCrawlAttempt: null,
                    crawlStatus: 'idle',
                }),

            // Pure selectors (safe to call from anywhere)
            computeSemesterGPA: (semester) => computeGPA(semester.subjects),

            getCGPA: () => {
                const { semesters } = get();
                const allGraded = semesters.flatMap((s) => s.subjects).filter((sub) => AU_GRADE_POINTS[sub.grade] > 0);
                if (allGraded.length === 0) return null;
                const weighted = allGraded.reduce((sum, s) => sum + AU_GRADE_POINTS[s.grade] * s.credits, 0);
                const credits = allGraded.reduce((sum, s) => sum + s.credits, 0);
                return roundGPA(weighted / credits);
            },

            getTotalCredits: () => {
                const { semesters } = get();
                return semesters
                    .flatMap((s) => s.subjects)
                    .filter((sub) => AU_GRADE_POINTS[sub.grade] > 0)
                    .reduce((sum, s) => sum + s.credits, 0);
            },

            getWeakSubjects: () => {
                const { semesters } = get();
                return semesters
                    .flatMap((s) =>
                        s.subjects
                            .filter((sub) => AU_GRADE_POINTS[sub.grade] <= 6) // B grade and below
                            .map((sub) => ({ semester: s.semester, subject: sub, gradePoint: AU_GRADE_POINTS[sub.grade] }))
                    )
                    .sort((a, b) => a.gradePoint - b.gradePoint);
            },

            getAttendanceEligible: () => {
                const { semesters } = get();
                const withAttendance = semesters.flatMap((s) =>
                    s.subjects.filter((sub) => typeof sub.internalMarks === 'number')
                );
                if (withAttendance.length === 0) {
                    return { totalClasses: 0, attended: 0, percentage: 0 };
                }
                // Internal marks approximation: score / 50 ≈ knowledge coverage proxy
                const total = withAttendance.reduce((sum, sub) => sum + (sub.internalMarks ?? 0), 0);
                const max = withAttendance.length * 50;
                return { totalClasses: max, attended: total, percentage: roundGPA((total / max) * 100) };
            },
        }),
        {
            name: 'kingston-au-results',
        }
    )
);

export default useAUResultsStore;
