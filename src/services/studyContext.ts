import type { Profile } from '@/stores/authStore';
import { useAUResultsStore, type AUSemester } from '@/stores/auResultsStore';

/**
 * Mock attendance stats for the AI context (student view uses local mock data
 * in this demo app; the attendance page shows the same values).
 */
export interface AttendanceSnapshot {
    percentage: number;
    subjectWise?: { name: string; percentage: number }[];
}

const MOCK_ATTENDANCE: AttendanceSnapshot = {
    percentage: 81,
    subjectWise: [
        { name: 'Data Structures', percentage: 85 },
        { name: 'Algorithms', percentage: 90 },
        { name: 'Database Systems', percentage: 74 },
        { name: 'Operating Systems', percentage: 88 },
        { name: 'Discrete Mathematics', percentage: 89 },
    ],
};

/**
 * Builds a rich markdown context block about the current student so that
 * StudyGPT can personalize every answer (weak subjects, CGPA trajectory,
 * attendance eligibility, AU exam format).
 */
export function buildStudentContext(
    user: Profile | null,
    attendance?: AttendanceSnapshot
): string {
    const store = useAUResultsStore.getState();
    const au = attendance ?? MOCK_ATTENDANCE;

    const identity = user
        ? `
- Name: ${user.firstName} ${user.lastName}
- Roll/Register: ${user.rollNumber ?? 'not set'}
- Department: ${user.department}
- Current Semester: ${user.semester ?? 'not set'}
- Section: ${user.section ?? 'not set'}
- Current CGPA (profile): ${user.cgpa ?? 'not set'}
`.trim()
        : '- Name: (student not logged in)';

    const attendanceBlock = `
## Attendance (this semester)
- Overall attendance: ${au.percentage}%
${au.subjectWise
    ?.map((s) => `- ${s.name}: ${s.percentage}%`)
    .join('\n') ?? ''}
`.trim();

    const resultsBlock =
        store.semesters.length === 0
            ? `
## Anna University Results
No exam results have been recorded yet. Ask the student to add their results on
the AU Portal page (${window.location.origin}/au-portal) or open the official
portal at https://coe.annauniv.edu/home/ to view their records.
`.trim()
            : `
## Anna University Results
- Register No: ${store.registerNo || 'not set'}
- Total credits earned: ${store.getTotalCredits()}
- Cumulative CGPA: ${store.getCGPA() ?? 'not computable'}
`.trim();

    const weakBlock =
        store.getWeakSubjects().length === 0
            ? ''
            : `
### Weak subjects (grade B or below — priority for revision)
${store.getWeakSubjects()
    .map(
        (w) =>
            `- Semester ${w.semester}: ${w.subject.name} (${w.subject.code}) — grade ${w.subject.grade}`
    )
    .join('\n')}
`;

    const semesterContext = store.semesters.length > 0 ? store.semesters[store.semesters.length - 1] : null;
    const semesterBlock = semesterContext
        ? `
### Latest recorded semester: Semester ${semesterContext.semester} (${semesterContext.examSession})
Subjects: ${semesterContext.subjects.map((s) => `${s.name} (${s.credits}cr, ${s.grade})`).join('; ')}
`.trim()
        : '';

    const examFormat = `
## Anna University Exam Format (important for study tips)
- Internal assessment: 50 marks (tests, assignments, seminar)
- External semester exam: 100 marks
- Question pattern: Part A = 10 × 2-mark questions (20 marks); Part B = 5 × 16-mark questions (80 marks)
- Pass requirement: minimum 50% aggregate (40% minimum in each subject internal+external)
- Grading: O=90-100, A+=80-89, A=70-79, B+=60-69, B=55-59, C=50-54, P=40-49, U/W/SA/RA=fail/arrear
- Attendance: minimum 75% required to sit the exam
`.trim();

    return `
# Current Student Context
## Student Profile
${identity}

${resultsBlock}
${semesterBlock}
${weakBlock}
${attendanceBlock}

${examFormat}

## How to respond
Use this context to personalize your answer: prioritize the student's weak
subjects, warn them if a subject is near the 75% attendance threshold or below
50% in internal marks, align advice with the Anna University 2/16-mark exam
pattern, and keep a supportive tutor tone. If results are missing, encourage
the student to record them on the AU Portal page.
`.trim();
}

/**
 * Helper used by UI chips: quick derived facts about the student.
 */
export function getStudentQuickFacts(user: Profile | null) {
    const store = useAUResultsStore.getState();
    const weak = store.getWeakSubjects();
    const latest = store.semesters.length > 0 ? store.semesters[store.semesters.length - 1] : null;
    return {
        weakSubjectName: weak.length > 0 ? weak[0].subject.name : null,
        weakSubjectCode: weak.length > 0 ? weak[0].subject.code : null,
        semester: latest?.semester ?? user?.semester ?? null,
        attendance: MOCK_ATTENDANCE.percentage,
        attendanceLowSubject: MOCK_ATTENDANCE.subjectWise?.find((s) => s.percentage < 75)?.name ?? null,
    };
}

export type { AUSemester };
