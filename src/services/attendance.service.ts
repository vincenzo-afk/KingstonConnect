/**
 * Attendance Service
 * Handles all attendance-related database operations
 */

import {
    collection,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    registerNo: string;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    subjectId?: string;
    subjectName?: string;
    period?: number;
    markedBy: string;
    markedAt: Date;
    remarks?: string;
}

export interface AttendanceSession {
    id: string;
    date: Date;
    subjectId: string;
    subjectName: string;
    sectionId: string;
    period: number;
    markedBy: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    createdAt: Date;
}

export interface AttendanceStats {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
    subjectWise: Array<{
        subjectId: string;
        subjectName: string;
        total: number;
        present: number;
        percentage: number;
    }>;
}

export interface DailyAttendanceInput {
    studentId: string;
    studentName: string;
    registerNo: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
}

// =============================================================================
// ATTENDANCE CRUD OPERATIONS
// =============================================================================

/**
 * Create attendance session and mark attendance for multiple students
 */
export async function markAttendance(
    subjectId: string,
    subjectName: string,
    sectionId: string,
    period: number,
    markedBy: string,
    attendanceRecords: DailyAttendanceInput[]
): Promise<string> {
    const batch = writeBatch(db);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create session document
    const sessionRef = doc(collection(db, COLLECTIONS.ATTENDANCE_SESSIONS));
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;

    batch.set(sessionRef, {
        date: Timestamp.fromDate(today),
        subjectId,
        subjectName,
        sectionId,
        period,
        markedBy,
        totalStudents: attendanceRecords.length,
        presentCount,
        absentCount,
        lateCount,
        createdAt: serverTimestamp(),
    });

    // Create individual attendance records
    for (const record of attendanceRecords) {
        const recordRef = doc(collection(db, COLLECTIONS.ATTENDANCE));
        batch.set(recordRef, {
            sessionId: sessionRef.id,
            studentId: record.studentId,
            studentName: record.studentName,
            registerNo: record.registerNo,
            date: Timestamp.fromDate(today),
            status: record.status,
            subjectId,
            subjectName,
            period,
            markedBy,
            markedAt: serverTimestamp(),
            remarks: record.remarks || null,
        });
    }

    await batch.commit();
    return sessionRef.id;
}

/**
 * Get attendance for a specific date and section
 */
export async function getAttendanceByDate(
    date: Date,
    _sectionId?: string,
    _subjectId?: string
): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let q = query(
        collection(db, COLLECTIONS.ATTENDANCE),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        markedAt: doc.data().markedAt?.toDate(),
    })) as AttendanceRecord[];
}

/**
 * Get attendance statistics for a student
 */
export async function getStudentAttendanceStats(
    studentId: string,
    startDate?: Date,
    endDate?: Date
): Promise<AttendanceStats> {
    let q = query(
        collection(db, COLLECTIONS.ATTENDANCE),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
    );

    if (startDate && endDate) {
        q = query(
            collection(db, COLLECTIONS.ATTENDANCE),
            where('studentId', '==', studentId),
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate)),
            orderBy('date', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => doc.data());

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const totalClasses = records.length;

    // Calculate subject-wise
    const subjectMap = new Map<string, { total: number; present: number; name: string }>();
    records.forEach(record => {
        const subjectId = record.subjectId || 'general';
        const existing = subjectMap.get(subjectId) || { total: 0, present: 0, name: record.subjectName || 'General' };
        existing.total++;
        if (record.status === 'present' || record.status === 'late') {
            existing.present++;
        }
        subjectMap.set(subjectId, existing);
    });

    const subjectWise = Array.from(subjectMap.entries()).map(([subjectId, data]) => ({
        subjectId,
        subjectName: data.name,
        total: data.total,
        present: data.present,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    return {
        totalClasses,
        present,
        absent,
        late,
        percentage: totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 0,
        subjectWise,
    };
}

/**
 * Get attendance sessions (for teachers/HODs)
 */
export async function getAttendanceSessions(
    sectionId?: string,
    limit: number = 30
): Promise<AttendanceSession[]> {
    let q = query(
        collection(db, COLLECTIONS.ATTENDANCE_SESSIONS),
        orderBy('date', 'desc')
    );

    if (sectionId) {
        q = query(
            collection(db, COLLECTIONS.ATTENDANCE_SESSIONS),
            where('sectionId', '==', sectionId),
            orderBy('date', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as AttendanceSession[];
}

/**
 * Update a single attendance record
 */
export async function updateAttendanceRecord(
    recordId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    remarks?: string
): Promise<void> {
    const recordRef = doc(db, COLLECTIONS.ATTENDANCE, recordId);
    await updateDoc(recordRef, {
        status,
        remarks: remarks || null,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Subscribe to real-time attendance updates for a section
 */
export function subscribeToAttendance(
    sectionId: string,
    callback: (records: AttendanceRecord[]) => void
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, COLLECTIONS.ATTENDANCE),
        where('sectionId', '==', sectionId),
        where('date', '>=', Timestamp.fromDate(today)),
        orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const records: AttendanceRecord[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            markedAt: doc.data().markedAt?.toDate(),
        })) as AttendanceRecord[];
        callback(records);
    });
}

/**
 * Get students with low attendance (below threshold)
 */
export async function getLowAttendanceStudents(
    sectionId: string,
    threshold: number = 75
): Promise<Array<{ studentId: string; studentName: string; registerNo: string; percentage: number }>> {
    const sessions = await getAttendanceSessions(sectionId, 100);
    if (sessions.length === 0) return [];

    const q = query(
        collection(db, COLLECTIONS.ATTENDANCE),
        where('sectionId', '==', sectionId),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const studentMap = new Map<string, { name: string; registerNo: string; total: number; present: number }>();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const existing = studentMap.get(data.studentId) || {
            name: data.studentName,
            registerNo: data.registerNo,
            total: 0,
            present: 0
        };
        existing.total++;
        if (data.status === 'present' || data.status === 'late') {
            existing.present++;
        }
        studentMap.set(data.studentId, existing);
    });

    return Array.from(studentMap.entries())
        .map(([studentId, data]) => ({
            studentId,
            studentName: data.name,
            registerNo: data.registerNo,
            percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        }))
        .filter(student => student.percentage < threshold)
        .sort((a, b) => a.percentage - b.percentage);
}
