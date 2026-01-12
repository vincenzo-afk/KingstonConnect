import { AUStudentData, AUAttendanceMetrics, AUResultItem, AUCGPACalculation } from '@/services/auportal.service';

// Grade Points Mapping
const GRADE_POINTS: Record<string, number> = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'D': 4, // Minimum passing
    'RA': 0, // Reappear
    'SA': 0, // Shortage of Attendance
    'W': 0,  // Withheld
    'AB': 0, // Absent
};

/**
 * Calculate attendance metrics from assessment data
 */
export function calculateAttendanceMetrics(data: AUStudentData | null): AUAttendanceMetrics {
    if (!data || !data.assessment) {
        return {
            overallPercentage: 0,
            subjectWise: [],
            currentPeriod: 1
        };
    }

    const assessment = data.assessment;
    let totalAttended = 0;
    let totalPeriods = 0;

    // Determine current period based on which has the most recent data
    let currentPeriod: 1 | 2 | 3 | 4 = 4;
    for (const subject of assessment) {
        if (subject.report_period4.total_period && subject.report_period4.total_period !== '') {
            currentPeriod = 4;
            break;
        } else if (subject.report_period3.total_period && subject.report_period3.total_period !== '') {
            currentPeriod = 3;
        } else if (subject.report_period2.total_period && subject.report_period2.total_period !== '') {
            currentPeriod = 2;
        } else {
            currentPeriod = 1;
        }
    }

    const subjectWise = assessment.map((subject) => {
        let attended = 0;
        let total = 0;

        // Sum up all periods
        [subject.report_period1, subject.report_period2, subject.report_period3, subject.report_period4].forEach(period => {
            if (period.attended_period && period.attended_period !== '') {
                attended += parseInt(period.attended_period) || 0;
            }
            if (period.total_period && period.total_period !== '') {
                total += parseInt(period.total_period) || 0;
            }
        });

        totalAttended += attended;
        totalPeriods += total;

        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
        let status: 'safe' | 'warning' | 'danger' = 'safe';
        if (percentage < 75) status = 'danger';
        else if (percentage < 85) status = 'warning';

        return {
            subjectCode: subject.subject_code,
            percentage,
            attended,
            total,
            status,
        };
    });

    return {
        overallPercentage: totalPeriods > 0 ? Math.round((totalAttended / totalPeriods) * 100) : 0,
        subjectWise,
        currentPeriod,
    };
}

/**
 * Calculate CGPA from exam results
 */
export function calculateCGPA(results: AUResultItem[]): AUCGPACalculation {
    const gradeDistribution: Record<string, number> = {};
    let totalPoints = 0;
    let totalCredits = 0;
    const sgpaBySemester: Record<string, { points: number; credits: number }> = {};

    results.forEach((result) => {
        const grade = result.grade.toUpperCase();
        const gradePoint = GRADE_POINTS[grade] || 0;
        const credits = result.subject_code.includes('LAB') ? 2 : 3;

        // Count grades
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

        // Calculate total
        totalPoints += gradePoint * credits;
        totalCredits += credits;

        // Track by semester for SGPA
        const sem = result.semester;
        if (!sgpaBySemester[sem]) {
            sgpaBySemester[sem] = { points: 0, credits: 0 };
        }
        sgpaBySemester[sem].points += gradePoint * credits;
        sgpaBySemester[sem].credits += credits;
    });

    // Calculate SGPA for each semester
    const sgpa = Object.entries(sgpaBySemester)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([_, data]) => data.credits > 0 ? Math.round((data.points / data.credits) * 100) / 100 : 0);

    return {
        cgpa: totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0,
        sgpa,
        totalCredits,
        gradeDistribution,
    };
}
