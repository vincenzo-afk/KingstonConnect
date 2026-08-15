import type { AssignmentItem } from '@/pages/Assignments';

// =============================================================================
// ASSIGNMENTS STORE — Firestore-backed with offline mirror.
//
// The Assignments page uses `subscribeAssignmentsStore` + `getAssignmentsStore`
// (realtime Firestore mirror, localStorage fallback). The AI StudyGPT context
// reads the latest known state via the same getters.
// =============================================================================

const KEY = 'kingston-assignments';
const listeners = new Set<() => void>();

const read = (): AssignmentItem[] => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]') as AssignmentItem[];
    } catch {
        return [];
    }
};

let state: AssignmentItem[] = read();

const write = (next: AssignmentItem[]) => {
    state = next;
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* quota errors are non-fatal */
    }
    listeners.forEach((l) => l());
};

/** Firestore -> local mirror updater, called by the Assignments page hook. */
export const syncAssignmentsFromFirestore = (items: AssignmentItem[]): void => {
    write(items);
};

export const getAssignmentsStore = (): AssignmentItem[] => state;

export const subscribeAssignmentsStore = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const _addAssignment = (a: Omit<AssignmentItem, 'id' | 'status'>) =>
    write([...state, { ...a, id: `assign-${Date.now()}`, status: 'pending' }]);

export const _submitAssignment = (id: string, fileName?: string) =>
    write(
        state.map((a) =>
            a.id === id
                ? {
                      ...a,
                      status: 'submitted' as const,
                      submittedAt: new Date().toISOString(),
                      submittedFile: fileName,
                  }
                : a
        )
    );

export const gradeAssignment = (id: string, grade: number) =>
    write(
        state.map((a) =>
            a.id === id ? { ...a, status: 'graded' as const, grade } : a
        )
    );

export const _removeAssignment = (id: string) =>
    write(state.filter((a) => a.id !== id));
