import type { AssignmentItem } from '@/pages/Assignments';

// =============================================================================
// ASSIGNMENTS STORE — shared state for the Assignments page and the AI
// StudyGPT context (buildStudentContext). All entries come from real staff
// assignments created in-app; no mock data.
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
    localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
};

export const getAssignmentsStore = (): AssignmentItem[] => state;

export const subscribeAssignmentsStore = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const addAssignment = (a: Omit<AssignmentItem, 'id' | 'status'>) =>
    write([...state, { ...a, id: `assign-${Date.now()}`, status: 'pending' }]);

export const submitAssignment = (id: string, fileName?: string) =>
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

export const removeAssignment = (id: string) =>
    write(state.filter((a) => a.id !== id));
