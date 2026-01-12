import { AUStudentData, AUAttendanceMetrics } from '@/services/auportal.service';

export function calculateAttendanceMetrics(data: AUStudentData | null): AUAttendanceMetrics | null {
    if (!data || !data.assessment) return null;

    let totalAttended = 0;
    let totalClasses = 0;
    const subjectWise: AUAttendanceMetrics['subjectWise'] = [];

    data.assessment.forEach(subject => {
        let subAttended = 0;
        let subTotal = 0;

        // Sum up all periods
        [subject.report_period1, subject.report_period2, subject.report_period3, subject.report_period4].forEach(period => {
            if (period) {
                const attended = parseInt(period.attended_period || '0', 10);
                const total = parseInt(period.total_period || '0', 10);
                if (!isNaN(attended) && !isNaN(total)) {
                    subAttended += attended;
                    subTotal += total;
                }
            }
        });

        const percentage = subTotal > 0 ? Math.round((subAttended / subTotal) * 100) : 0;

        totalAttended += subAttended;
        totalClasses += subTotal;

        subjectWise.push({
            subjectCode: subject.subject_code,
            percentage,
            attended: subAttended,
            total: subTotal,
            status: percentage < 75 ? 'danger' : percentage < 80 ? 'warning' : 'safe'
        });
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    return {
        overallPercentage,
        subjectWise,
        currentPeriod: 4 // Default or calculate based on date
    };
}
