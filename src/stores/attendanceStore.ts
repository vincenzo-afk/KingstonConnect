import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// ATTENDANCE STORE — real subject-wise attendance + daily records
// No mock data: starts empty and grows only from what the student/teacher
// actually records.
// =============================================================================

export type ClassStatus = 'present' | 'absent' | 'late';

export interface AttendanceSubject {
    id: string;
    name: string;
    code: string;
    present: number;
    total: number;
}

interface AttendanceRecord {
    studentId: string;
    name: string;
    rollNumber: string;
    date: string;
    status: ClassStatus;
}

interface AttendanceStore {
    subjects: AttendanceSubject[];
    records: AttendanceRecord[];
    addSubject: (name: string, code: string) => void;
    removeSubject: (id: string) => void;
    markClass: (subjectId: string, status: ClassStatus) => void;
    addRecord: (
        studentId: string,
        name: string,
        rollNumber: string,
        date: string,
        status: ClassStatus,
    ) => void;
    clearRecords: () => void;
    /** Overall present/total counts across all subjects. */
    overallPresent: number;
    overallTotal: number;
    overallPercentage: number;
    /** Percentage from the last 30 days only (trend vs overall). */
    lastMonthPercentage: number;
    /** Subject-wise percentages for dashboards and AI context. */
    subjectWise: { name: string; code: string; percentage: number }[];
}

export const useAttendanceStore = create<AttendanceStore>()(
    persist(
        (set, get) => ({
            subjects: [],
            records: [],

            addSubject: (name, code) => {
                const exists = get().subjects.some(
                    (s) => s.name.toLowerCase() === name.toLowerCase()
                );
                if (exists) return;
                set((state) => ({
                    subjects: [
                        ...state.subjects,
                        {
                            id: `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            name,
                            code,
                            present: 0,
                            total: 0,
                        },
                    ],
                }));
            },

            removeSubject: (id) =>
                set((state) => ({
                    subjects: state.subjects.filter((s) => s.id !== id),
                })),

            markClass: (subjectId, status) =>
                set((state) => ({
                    subjects: state.subjects.map((s) =>
                        s.id === subjectId
                            ? {
                                  ...s,
                                  present: s.present + (status === 'present' || status === 'late' ? 1 : 0),
                                  total: s.total + 1,
                              }
                            : s
                    ),
                })),

            addRecord: (studentId, name, rollNumber, date, status) =>
                set((state) => ({
                    records: [
                        ...state.records,
                        { studentId, name, rollNumber, date, status },
                    ],
                })),

            clearRecords: () => set({ records: [] }),

            get overallPresent() {
                return get().subjects.reduce((a, s) => a + s.present, 0);
            },
            get overallTotal() {
                return get().subjects.reduce((a, s) => a + s.total, 0);
            },
            get overallPercentage() {
                const s = get();
                return s.overallTotal > 0
                    ? Math.round((s.overallPresent / s.overallTotal) * 100)
                    : 0;
            },

            get lastMonthPercentage() {
                const s = get();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const recent = s.records.filter(
                    (r) => new Date(r.date) >= thirtyDaysAgo
                );
                const total = recent.length;
                const present = recent.filter(
                    (r) => r.status === 'present' || r.status === 'late'
                ).length;
                return total > 0 ? Math.round((present / total) * 100) : 0;
            },

            get subjectWise() {
                return get().subjects.map((s) => ({
                    name: s.name,
                    code: s.code,
                    percentage:
                        s.total > 0
                            ? Math.round((s.present / s.total) * 100)
                            : 0,
                }));
            },
        }),
        { name: 'kingston-attendance' }
    )
);
