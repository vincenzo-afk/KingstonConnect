import type { Profile } from '@/stores/authStore';
import {
    getTeacherContentIndex,
} from '@/data/teacherContent';
import { useAUResultsStore } from '@/stores/auResultsStore';
import {
    getDeadlinesSorted,
} from '@/data/studentData';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { getAssignmentsStore } from '@/stores/assignmentsStore';

export interface AttendanceSnapshot {
    percentage: number;
    subjectWise?: { name: string; percentage: number }[];
}

/**
 * Builds a rich markdown context block about the current student so that
 * StudyGPT can personalize every answer. Mirrors everything shown on the
 * student dashboard: identity, CGPA + trajectory, credits, rank, attendance
 * (overall/trend/subject-wise), deadlines, recent activity, AU results, and
 * a synthesized coaching profile.
 */
export function buildStudentContext(user: Profile | null): string {
    const store = useAUResultsStore.getState();
    const att = useAttendanceStore.getState();
    const assignments = getAssignmentsStore();
    const au = {
        percentage: att.overallPercentage,
        subjectWise: att.subjectWise,
        trend:
            att.overallPercentage -
            att.lastMonthPercentage,
    };

    // ------------------------------------------------------------------
    // Identity
    // ------------------------------------------------------------------
    const identity = user
        ? `
- Name: ${user.firstName} ${user.lastName}
- Roll/Register: ${user.rollNumber ?? 'not set'}
- Department: ${user.department}
- Current Semester: ${user.semester ?? 'not set'}
- Section: ${user.section ?? 'not set'}
`.trim()
        : '- Name: (student not logged in)';

    // ------------------------------------------------------------------
    // Academic snapshot (dashboard stats)
    // ------------------------------------------------------------------
    const semesters = store.semesters;
    const trendDirection =
        semesters.length >= 2
            ? (semesters[semesters.length - 1].gpa ?? 0) >=
              (semesters[0].gpa ?? 0)
                ? 'rising'
                : 'declining'
            : 'flat';
    const cgpa = store.getCGPA();
    const creditsEarned = store.getTotalCredits();
    const academicSnapshot = `
## Academic Snapshot (from dashboard)
- CGPA: ${cgpa ?? user?.cgpa ?? 'not recorded yet'} (${trendDirection} trajectory${semesters.length > 0 ? ` over ${semesters.length} recorded semesters` : ''})
- SGPA by semester: ${semesters.length > 0 ? semesters.map((s) => `Sem ${s.semester}: ${s.gpa}`).join('; ') : 'no semesters recorded yet'}
- Credits earned: ${creditsEarned}${creditsEarned > 0 ? ' total (recorded)' : ' — add exam results on the AU Portal page'}
- Class rank: #${user?.rank ?? 'not set'}
`.trim();

    // ------------------------------------------------------------------
    // Attendance (with trend + flag list)
    // ------------------------------------------------------------------
    const belowThreshold =
        au.subjectWise?.filter((s) => s.percentage < 75) ?? [];
const attendanceBlock = `
## Attendance (this semester)
- Overall attendance: ${au.percentage}% (trend: ${au.trend >= 0 ? '+' : ''}${au.trend}% vs last month${att.overallTotal === 0 ? ' — the student has not recorded any attendance yet' : ''})
${au.subjectWise?.map((s) => `- ${s.name}: ${s.percentage}%`).join('\n') ?? ''}
${
    belowThreshold.length > 0
        ? `
**ATTENTION — subjects below the 75% exam-eligibility threshold:**
${belowThreshold
    .map(
        (s) =>
            `- ${s.name}: ${s.percentage}% — the student must attend most or all upcoming classes of this subject to remain eligible to sit the exam. Prioritize any question about this subject with an attendance warning.`
    )
    .join('\n')}
`
        : ''
}
`.trim();

    // ------------------------------------------------------------------
    // Upcoming deadlines
    // ------------------------------------------------------------------
    const deadlines = getDeadlinesSorted();
    const deadlinesBlock =
        deadlines.length === 0
            ? '## Upcoming Deadlines\nNo upcoming deadlines.'
            : `
## Upcoming Deadlines (ordered by urgency)
${deadlines
    .map(
        (d) =>
            `- **${d.title}** (${d.subject}, ${d.type}) — due in ${d.daysUntil} days (${d.dueDate})${
                d.daysUntil <= 3 ? ' ← URGENT' : ''
            }`
    )
    .join('\n')}
When the student asks what to study or how to plan, reference these deadlines.
Urgent items (due within 3 days) should be mentioned proactively.
`.trim();

    // ------------------------------------------------------------------
    // Recent activity (strengths + recency)
    // ------------------------------------------------------------------
    const submitted = assignments.filter((a) => a.status !== 'pending');
    const gradedEntries = assignments.filter((a) => a.status === 'graded');
    const activityBlock =
        submitted.length === 0
            ? '## Recent Activity\nNo activity recorded yet.'
            : `
## Recent Activity
${submitted
    .map(
        (a) =>
            `- **${a.title}** (${a.subject}): ${a.status === 'graded' ? `graded ${a.grade}/${a.marks}` : `submitted${a.submittedAt ? ` on ${a.submittedAt}` : ''}`}`
    )
    .join('\n')}
${
    gradedEntries.length > 0
        ? `
**Strength signal:** the student recently scored ${gradedEntries[0].grade}/${gradedEntries[0].marks} (${Math.round(((gradedEntries[0].grade ?? 0) / (gradedEntries[0].marks ?? 1)) * 100)}%) in ${gradedEntries[0].title} (${gradedEntries[0].subject}) — treat related questions as revision/advanced rather than remedial.
`
        : ''
}
`.trim();

    // ------------------------------------------------------------------
    // Anna University results (recorded by student)
    // ------------------------------------------------------------------
    const resultsBlock =
        store.semesters.length === 0
            ? `
## Anna University Results
No exam results have been recorded yet. Ask the student to add their results on
the AU Portal page (${window.location.origin}/au-portal) or open the official
portal at https://coe.annauniv.edu/home/ to view their records.
`.trim()
            : `
## Anna University Results (recorded)
- Register No: ${store.registerNo || 'not set'}
- Total credits earned: ${store.getTotalCredits()}
- Cumulative CGPA: ${store.getCGPA() ?? 'not computable'}
`.trim();

    const weakBlock =
        store.getWeakSubjects().length === 0
            ? ''
            : `
### Weak subjects (grade B or below — priority for revision)
${store
    .getWeakSubjects()
    .map(
        (w) =>
            `- Semester ${w.semester}: ${w.subject.name} (${w.subject.code}) — grade ${w.subject.grade}`
    )
    .join('\n')}
`;

    const semesterContext =
        store.semesters.length > 0
            ? store.semesters[store.semesters.length - 1]
            : null;
    const semesterBlock = semesterContext
        ? `
### Latest recorded semester: Semester ${semesterContext.semester} (${semesterContext.examSession})
Subjects: ${semesterContext.subjects
    .map((s) => `${s.name} (${s.credits}cr, ${s.grade})`)
    .join('; ')}
`.trim()
        : '';

    // ------------------------------------------------------------------
    // AU exam format
    // ------------------------------------------------------------------
    const examFormat = `
## Anna University Exam Format (important for study tips)
- Internal assessment: 50 marks (tests, assignments, seminar)
- External semester exam: 100 marks
- Question pattern: Part A = 10 × 2-mark questions (20 marks); Part B = 5 × 16-mark questions (80 marks)
- Pass requirement: minimum 50% aggregate (40% minimum in each subject internal+external)
- Grading: O=90-100, A+=80-89, A=70-79, B+=60-69, B=55-59, C=50-54, P=40-49, U/W/SA/RA=fail/arrear
- Attendance: minimum 75% required to sit the exam
`.trim();

    // ------------------------------------------------------------------
    // Derived coaching profile
    // ------------------------------------------------------------------
    const weakNames = store
        .getWeakSubjects()
        .map((w) => w.subject.name);
const coachingProfile = `
## Coaching Profile (synthesized — use this to prioritize)
- Focus subjects (weak grades): ${weakNames.length > 0 ? weakNames.join(', ') : 'none recorded yet'}
- Eligibility risks (attendance <75%): ${
    belowThreshold.length > 0
        ? belowThreshold.map((s) => s.name).join(', ')
        : 'none — all subjects eligible'
}
- Urgent deadlines: ${deadlines
    .filter((d) => d.daysUntil <= 3)
    .map((d) => d.title)
    .join(', ') || 'none in the next 3 days'}
- Momentum: CGPA is ${trendDirection}; attendance trend ${au.trend >= 0 ? 'improving' : 'declining'}
- Keep a supportive tutor tone; personalize every answer with the above facts
  (mention deadlines when planning, flag attendance risks, target weak
  subjects when suggesting what to study).
`.trim();

    return `
# Current Student Context
## Student Profile
${identity}

${academicSnapshot}

${resultsBlock}
${semesterBlock}
${weakBlock}
${attendanceBlock}

${deadlinesBlock}

${activityBlock}

${examFormat}

## Teacher Uploads (everything teachers have posted — you MUST know all of this)
${getTeacherContentIndex()
    .map(
        (x) =>
            `- [${x.source}] **${x.title}** (${x.subject}, ${x.date}): ${x.detail}`
    )
    .join('\n')}
Whenever the student asks about assignments, announcements, notes, uploaded
material, or anything a teacher posted, answer directly from the list above
instead of giving generic advice. Cite the exact title.

${coachingProfile}
`.trim();
}

/**
 * Helper used by UI chips: quick derived facts about the student for the
 * chat's suggested-prompt row.
 */
export function getStudentQuickFacts(user: Profile | null) {
    const store = useAUResultsStore.getState();
    const weak = store.getWeakSubjects();
    const latest =
        store.semesters.length > 0
            ? store.semesters[store.semesters.length - 1]
            : null;
    const att = useAttendanceStore.getState();
    const deadlines = getDeadlinesSorted();
    const below =
        att.subjectWise.filter((s) => s.percentage < 75) ?? [];
    return {
        weakSubjectName: weak.length > 0 ? weak[0].subject.name : null,
        weakSubjectCode: weak.length > 0 ? weak[0].subject.code : null,
        semester: latest?.semester ?? user?.semester ?? null,
        attendance: att.overallPercentage,
        attendanceLowSubject: below.length > 0 ? below[0].name : null,
        urgentDeadlineTitle:
            deadlines.length > 0 ? deadlines[0].title : null,
        urgentDeadlineDays: deadlines.length > 0 ? deadlines[0].daysUntil : null,
        cgpa: store.getCGPA() ?? user?.cgpa ?? null,
    };
}
