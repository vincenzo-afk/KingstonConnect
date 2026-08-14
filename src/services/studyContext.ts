import type { Profile } from '@/stores/authStore';
import { useAUResultsStore } from '@/stores/auResultsStore';
import {
    ATTENDANCE_STATS,
    getDeadlinesSorted,
    RECENT_ACTIVITY,
    RESULTS_STATS,
} from '@/data/studentData';

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
    const au = {
        percentage: ATTENDANCE_STATS.overall,
        subjectWise: ATTENDANCE_STATS.subjectWise,
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
    const trajectory = RESULTS_STATS.trajectory;
    const trendDirection =
        trajectory.length >= 2
            ? trajectory[trajectory.length - 1].sgpa >=
              trajectory[0].sgpa
                ? 'rising'
                : 'declining'
            : 'flat';
    const academicSnapshot = `
## Academic Snapshot (from dashboard)
- CGPA: ${user?.cgpa ?? RESULTS_STATS.cgpa} (${trendDirection} trajectory over semesters 1–${trajectory.length})
- SGPA by semester: ${trajectory
    .map((s) => `Sem ${s.semester}: ${s.sgpa}`)
    .join('; ')}
- Credits earned: ${user?.credits ?? RESULTS_STATS.creditsEarned} of ${RESULTS_STATS.degreeCreditsTotal} total
- Class rank: #${user?.rank ?? RESULTS_STATS.rank}
`.trim();

    // ------------------------------------------------------------------
    // Attendance (with trend + flag list)
    // ------------------------------------------------------------------
    const belowThreshold =
        au.subjectWise?.filter((s) => s.percentage < 75) ?? [];
    const attendanceBlock = `
## Attendance (this semester)
- Overall attendance: ${au.percentage}% (trend: ${
        ATTENDANCE_STATS.overall - ATTENDANCE_STATS.lastMonth >= 0 ? '+' : ''
    }${ATTENDANCE_STATS.overall - ATTENDANCE_STATS.lastMonth}% vs last month)
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
    const recentActivities = RECENT_ACTIVITY;
    const gradedEntries = recentActivities.filter((a) => a.type === 'graded');
    const activityBlock = `
## Recent Activity
${recentActivities
    .map((a) => `- ${a.title}: ${a.description} (${a.time})`)
    .join('\n')}
${
    gradedEntries.length > 0
        ? `
**Strength signal:** the student recently scored well in ${gradedEntries[0].description.split(' - ')[0]} — treat related questions as revision/advanced rather than remedial.
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
- Momentum: CGPA is ${trendDirection}; attendance trend ${
        ATTENDANCE_STATS.overall - ATTENDANCE_STATS.lastMonth >= 0
            ? 'improving'
            : 'declining'
    }
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
    const deadlines = getDeadlinesSorted();
    const below =
        ATTENDANCE_STATS.subjectWise.filter((s) => s.percentage < 75) ?? [];
    return {
        weakSubjectName: weak.length > 0 ? weak[0].subject.name : null,
        weakSubjectCode: weak.length > 0 ? weak[0].subject.code : null,
        semester: latest?.semester ?? user?.semester ?? null,
        attendance: ATTENDANCE_STATS.overall,
        attendanceLowSubject: below.length > 0 ? below[0].name : null,
        urgentDeadlineTitle:
            deadlines.length > 0 ? deadlines[0].title : null,
        urgentDeadlineDays: deadlines.length > 0 ? deadlines[0].daysUntil : null,
        cgpa: user?.cgpa ?? RESULTS_STATS.cgpa,
    };
}
