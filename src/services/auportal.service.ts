/**
 * Anna University Portal Service
 * Integrates with the auwebportal Flask API to fetch real-time student data
 * from the Anna University official portal
 */

import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// API Base URL - Configure this to point to your running auwebportal Flask server
const AU_PORTAL_API_URL = import.meta.env.VITE_AU_PORTAL_URL || 'http://localhost:8080';

// =============================================================================
// TYPES - Based on the actual AU Portal API response structure
// =============================================================================

export interface AUProfile {
    name: string;
    register_number: string;
    branch: string;
    institution: string;
}

export interface AUReportPeriod {
    total_period: string;
    attended_period: string;
    assesment_mark: string | null;
}

export interface AUAssessment {
    subject_code: string;
    report_period1: AUReportPeriod;
    report_period2: AUReportPeriod;
    report_period3: AUReportPeriod;
    report_period4: AUReportPeriod;
}

export interface AUExamScheduleItem {
    exam_date: string;
    semester: string;
    session: 'FN' | 'AN'; // Forenoon or Afternoon
    subject: string;
}

export interface AUResultItem {
    grade: string;
    result: 'PASS' | 'FAIL' | 'RA' | 'AB';
    semester: string;
    subject_code: string;
}

export interface AUExamResult {
    meta: string; // e.g., "Result for April / May 2026"
    results: AUResultItem[];
}

export interface AUElective {
    code: string;
    name: string;
}

export interface AUInternalMark {
    exam_absentees: string;
    internal_mark: string;
    semester: string;
    subject: string;
}

export interface AUStudentData {
    profile: AUProfile;
    exam_schedule: AUExamScheduleItem[];
    assessment: AUAssessment[];
    exam_result: AUExamResult | null;
    exam_reval_result: AUExamResult | null;
    electives: AUElective[] | null;
    internals: AUInternalMark[];
    error?: string;
}

// Cached data stored in Firebase
export interface CachedAUData {
    userId: string;
    registerNo: string;
    data: AUStudentData;
    fetchedAt: Date;
    expiresAt: Date;
}

// Calculated metrics
export interface AUAttendanceMetrics {
    overallPercentage: number;
    subjectWise: Array<{
        subjectCode: string;
        percentage: number;
        attended: number;
        total: number;
        status: 'safe' | 'warning' | 'danger';
    }>;
    currentPeriod: 1 | 2 | 3 | 4;
}

export interface AUCGPACalculation {
    cgpa: number;
    sgpa: number[];
    totalCredits: number;
    gradeDistribution: Record<string, number>;
}

// Session response from init-session API
export interface AUSessionResponse {
    session_id: string;
    captcha_audio_url: string | null;
    has_audio_captcha: boolean;
    error?: string;
}

// =============================================================================
// GRADE POINT MAPPING (Anna University)
// =============================================================================

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

// =============================================================================
// 2-STEP CAPTCHA AUTHENTICATION APIs
// =============================================================================

/**
 * Step 1: Initialize session with AU Portal and get captcha
 * Returns session_id and captcha audio URL
 */
export async function initAUSession(): Promise<AUSessionResponse> {
    try {
        const response = await fetch(`${AU_PORTAL_API_URL}/api/init-session`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to initialize session');
        }

        return data as AUSessionResponse;
    } catch (error) {
        console.error('Error initializing AU session:', error);
        throw error;
    }
}

/**
 * Get captcha audio URL (proxied through our API to avoid CORS)
 */
export function getCaptchaAudioUrl(sessionId: string): string {
    return `${AU_PORTAL_API_URL}/api/captcha-audio/${sessionId}`;
}

/**
 * Step 2: Submit captcha and fetch student data
 */
export async function fetchDataWithCaptcha(
    sessionId: string,
    registerNo: string,
    dob: string,
    captchaSolution: string
): Promise<AUStudentData> {
    try {
        const response = await fetch(`${AU_PORTAL_API_URL}/api/fetch-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                register_no: registerNo,
                dob: dob,
                captcha_solution: captchaSolution,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch data');
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return data as AUStudentData;
    } catch (error) {
        console.error('Error fetching AU student data:', error);
        throw error;
    }
}


/**
 * Fetch student details from Anna University portal
 * @param registerNo - Student's register number (e.g., "312419104XXX")
 * @param dob - Date of birth in DD-MM-YYYY format
 */
export async function fetchStudentDetails(
    registerNo: string,
    dob: string
): Promise<AUStudentData> {
    try {
        const response = await fetch(
            `${AU_PORTAL_API_URL}/get/?register_no=${encodeURIComponent(registerNo)}&dob=${encodeURIComponent(dob)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`AU Portal API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data as AUStudentData;
    } catch (error) {
        console.error('Error fetching AU student details:', error);
        throw error;
    }
}

/**
 * Fetch and cache student data in Firebase
 */
export async function fetchAndCacheStudentData(
    userId: string,
    registerNo: string,
    dob: string
): Promise<AUStudentData> {
    const data = await fetchStudentDetails(registerNo, dob);

    // Cache in Firebase with 1-hour expiry
    const cacheDoc = doc(db, COLLECTIONS.AU_CACHE, userId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    await setDoc(cacheDoc, {
        userId,
        registerNo,
        data,
        fetchedAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
    });

    return data;
}

/**
 * Get cached student data from Firebase
 */
export async function getCachedStudentData(userId: string): Promise<CachedAUData | null> {
    try {
        const cacheDoc = await getDoc(doc(db, COLLECTIONS.AU_CACHE, userId));

        if (!cacheDoc.exists()) {
            return null;
        }

        const cached = cacheDoc.data() as CachedAUData & {
            fetchedAt: Timestamp;
            expiresAt: Timestamp;
        };

        // Check if cache is expired
        const now = new Date();
        const expiresAt = cached.expiresAt.toDate();

        if (now > expiresAt) {
            return null; // Cache expired
        }

        return {
            ...cached,
            fetchedAt: cached.fetchedAt.toDate(),
            expiresAt: cached.expiresAt.toDate(),
        };
    } catch (error) {
        console.error('Error getting cached AU data:', error);
        return null;
    }
}

/**
 * Store AU credentials securely in user's profile
 * Note: DOB should be stored encrypted in production
 */
export async function storeAUCredentials(
    userId: string,
    registerNo: string,
    dob: string
): Promise<void> {
    const userDoc = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userDoc, {
        au_register_no: registerNo,
        au_dob_encrypted: btoa(dob), // Basic encoding - use proper encryption in production
        au_linked: true,
        au_linked_at: Timestamp.now(),
    });
}

/**
 * Get AU credentials from user's profile
 */
export async function getAUCredentials(userId: string): Promise<{ registerNo: string; dob: string } | null> {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

        if (!userDoc.exists()) {
            return null;
        }

        const data = userDoc.data();
        if (!data.au_linked || !data.au_register_no || !data.au_dob_encrypted) {
            return null;
        }

        return {
            registerNo: data.au_register_no,
            dob: atob(data.au_dob_encrypted),
        };
    } catch (error) {
        console.error('Error getting AU credentials:', error);
        return null;
    }
}

// =============================================================================
// CALCULATED METRICS
// =============================================================================

/**
 * Calculate attendance metrics from assessment data
 */
export function calculateAttendanceMetrics(assessment: AUAssessment[]): AUAttendanceMetrics {
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

/**
 * Get upcoming exams sorted by date
 */
export function getUpcomingExams(schedule: AUExamScheduleItem[]): AUExamScheduleItem[] {
    const today = new Date();

    return schedule
        .filter((exam) => {
            const [day, month, year] = exam.exam_date.split('-').map(Number);
            const examDate = new Date(year, month - 1, day);
            return examDate >= today;
        })
        .sort((a, b) => {
            const [dayA, monthA, yearA] = a.exam_date.split('-').map(Number);
            const [dayB, monthB, yearB] = b.exam_date.split('-').map(Number);
            return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
        });
}

/**
 * Generate study recommendations based on results
 */
export interface StudyRecommendation {
    subject: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}

export function generateStudyRecommendations(results: AUResultItem[], attendance: AUAttendanceMetrics): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];

    // Check attendance warnings
    const lowAttendance = attendance.subjectWise.filter(s => s.status === 'danger');
    lowAttendance.forEach(s => {
        recommendations.push({
            subject: s.subjectCode,
            recommendation: `Your attendance is critically low (${s.percentage}%). You need to attend upcoming classes to avoid detention.`,
            priority: 'high',
            reason: 'Low Attendance'
        });
    });

    // Check for subjects needing improvement (Grades)
    const poorGrades = results.filter(r => r.grade === 'D' || r.grade === 'RA' || r.grade === 'U');
    poorGrades.forEach(r => {
        recommendations.push({
            subject: r.subject_code,
            recommendation: `You secured a '${r.grade}' grade. Consider dedicating more time to this subject or seeking help from faculty.`,
            priority: 'high',
            reason: 'Low Grade'
        });
    });

    const averageGrades = results.filter(r => r.grade === 'C' || r.grade === 'B');
    averageGrades.forEach(r => {
        recommendations.push({
            subject: r.subject_code,
            recommendation: `You have a '${r.grade}' grade. With a little more effort, you can improve this to an A or B+.`,
            priority: 'medium',
            reason: 'Potential for Improvement'
        });
    });

    // Positive feedback / Maintenance
    const excellentGrades = results.filter(r => r.grade === 'O' || r.grade === 'A+' || r.grade === 'A');
    excellentGrades.forEach(r => {
        recommendations.push({
            subject: r.subject_code,
            recommendation: `Great job! Keep up the good work to maintain your '${r.grade}' grade.`,
            priority: 'low',
            reason: 'High Performance'
        });
    });

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Check if AU Portal API is available (health check)
 */
export async function checkAUPortalHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${AU_PORTAL_API_URL}/`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

// =============================================================================
// MOCK DATA FOR DEVELOPMENT (when API is not available)
// =============================================================================

export function getMockStudentData(): AUStudentData {
    return {
        profile: {
            name: 'Demo Student',
            register_number: '312426104XXX',
            branch: '104-B.E. Computer Science and Engineering',
            institution: 'Kingston Engineering College',
        },
        exam_schedule: [
            { exam_date: '15-01-2026', semester: '05', session: 'FN', subject: 'CS3501 - ARTIFICIAL INTELLIGENCE' },
            { exam_date: '18-01-2026', semester: '05', session: 'AN', subject: 'CS3502 - DATABASE MANAGEMENT SYSTEMS' },
            { exam_date: '22-01-2026', semester: '05', session: 'FN', subject: 'CS3503 - OPERATING SYSTEMS' },
        ],
        assessment: [
            {
                subject_code: 'CS3501',
                report_period1: { total_period: '25', attended_period: '23', assesment_mark: null },
                report_period2: { total_period: '22', attended_period: '20', assesment_mark: '85' },
                report_period3: { total_period: '18', attended_period: '16', assesment_mark: '78' },
                report_period4: { total_period: '15', attended_period: '14', assesment_mark: '90' },
            },
            {
                subject_code: 'CS3502',
                report_period1: { total_period: '24', attended_period: '22', assesment_mark: null },
                report_period2: { total_period: '23', attended_period: '21', assesment_mark: '92' },
                report_period3: { total_period: '17', attended_period: '15', assesment_mark: '88' },
                report_period4: { total_period: '14', attended_period: '13', assesment_mark: '95' },
            },
            {
                subject_code: 'CS3503',
                report_period1: { total_period: '26', attended_period: '20', assesment_mark: null },
                report_period2: { total_period: '24', attended_period: '18', assesment_mark: '65' },
                report_period3: { total_period: '18', attended_period: '14', assesment_mark: '70' },
                report_period4: { total_period: '16', attended_period: '12', assesment_mark: '72' },
            },
        ],
        exam_result: {
            meta: 'Result for November / December 2025',
            results: [
                { grade: 'A', result: 'PASS', semester: '04', subject_code: 'CS2401' },
                { grade: 'B+', result: 'PASS', semester: '04', subject_code: 'CS2402' },
                { grade: 'A+', result: 'PASS', semester: '04', subject_code: 'CS2403' },
                { grade: 'B', result: 'PASS', semester: '04', subject_code: 'CS2404' },
                { grade: 'O', result: 'PASS', semester: '04', subject_code: 'CS2405' },
            ],
        },
        exam_reval_result: null,
        electives: [
            { code: 'CS3091', name: 'MACHINE LEARNING' },
            { code: 'CS3092', name: 'CLOUD COMPUTING' },
        ],
        internals: [
            { exam_absentees: '-', internal_mark: '45', semester: '05', subject: 'CS3501 - ARTIFICIAL INTELLIGENCE' },
            { exam_absentees: '-', internal_mark: '48', semester: '05', subject: 'CS3502 - DATABASE MANAGEMENT SYSTEMS' },
            { exam_absentees: '-', internal_mark: '42', semester: '05', subject: 'CS3503 - OPERATING SYSTEMS' },
        ],
    };
}
