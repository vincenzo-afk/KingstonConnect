import { create } from 'zustand';

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

export interface AttendanceRecord {
    studentId: string;
    name: string;
    rollNumber: string;
    date: string;
    status: ClassStatus;
}

interface AttendanceStore {
    subjects: AttendanceSubject[];
    records: AttendanceRecord[];
    /** Overall present/total counts across all subjects. */
    overallPresent: number;
    overallTotal: number;
    overallPercentage: number;
    /** Percentage from the last 30 days only (trend vs overall). */
    lastMonthPercentage: number;
    /** Subject-wise percentages for dashboards and AI context. */
    subjectWise: { name: string; code: string; percentage: number }[];
}

// Firestore-backed variant: the Attendance / AttendancePredictor pages drive
// Firestore mutations (add/update/delete) and call these sync callbacks with
// the realtime collection snapshot; the store keeps all derived stats.
interface SyncActions {
    syncSubjectsFromFirestore: (items: AttendanceSubject[]) => void;
    syncRecordsFromFirestore: (items: AttendanceRecord[]) => void;
    addSubjectFire: (name: string, code: string) => void;
    removeSubjectFire: (id: string) => void;
    markClassFire: (subjectId: string, status: ClassStatus) => void;
    addRecordFire: (studentId: string, name: string, rollNumber: string, date: string, status: ClassStatus) => void;
    clearRecordsFire: () => void;
}

export const useAttendanceStore = create<AttendanceStore & SyncActions>()(
    (set, get) => {
        let fallbackSubjects: AttendanceSubject[] = [];
        let fallbackRecords: AttendanceRecord[] = [];
        try {
            fallbackSubjects = JSON.parse(
                localStorage.getItem('kingston-attendance-subjects') || '[]'
            ) as AttendanceSubject[];
            fallbackRecords = JSON.parse(
                localStorage.getItem('kingston-attendance-records') || '[]'
            ) as AttendanceRecord[];
        } catch {
            /* ignore */
        }
        return {
            subjects: fallbackSubjects,
            records: fallbackRecords,

            syncSubjectsFromFirestore: (items) => {
                set({ subjects: items });
                try {
                    localStorage.setItem('kingston-attendance-subjects', JSON.stringify(items));
                } catch {
                    /* non-fatal */
                }
            },

            syncRecordsFromFirestore: (items) => {
                set({ records: items });
                try {
                    localStorage.setItem('kingston-attendance-records', JSON.stringify(items));
                } catch {
                    /* non-fatal */
                }
            },

            addSubjectFire: (name, code) => {
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

            removeSubjectFire: (id) =>
                set((state) => ({
                    subjects: state.subjects.filter((s) => s.id !== id),
                })),

            markClassFire: (subjectId, status) =>
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

            addRecordFire: (studentId, name, rollNumber, date, status) =>
                set((state) => ({
                    records: [
                        ...state.records,
                        { studentId, name, rollNumber, date, status },
                    ],
                })),

            clearRecordsFire: () => set({ records: [] }),

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
        };
    }
);
