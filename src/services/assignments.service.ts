/**
 * Assignments Service
 * Handles all assignment-related database operations including creation, submission, and grading
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';
import { db, storage, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded' | 'resubmit';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    instructions?: string;
    subjectId: string;
    subjectName: string;
    sectionId: string;
    sectionName: string;
    createdBy: string;
    createdByName: string;
    dueDate: Date;
    totalMarks: number;
    attachments: AssignmentAttachment[];
    allowLateSubmission: boolean;
    latePenalty?: number; // Percentage penalty per day
    maxSubmissions: number;
    submissionCount: number;
    status: AssignmentStatus;
    createdAt: Date;
    updatedAt?: Date;
}

export interface AssignmentAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    registerNo: string;
    files: AssignmentAttachment[];
    comment?: string;
    submittedAt: Date;
    isLate: boolean;
    attemptNumber: number;
    status: SubmissionStatus;
    grade?: number;
    feedback?: string;
    gradedBy?: string;
    gradedAt?: Date;
}

export interface AssignmentInput {
    title: string;
    description: string;
    instructions?: string;
    subjectId: string;
    subjectName: string;
    sectionId: string;
    sectionName: string;
    dueDate: Date;
    totalMarks: number;
    allowLateSubmission?: boolean;
    latePenalty?: number;
    maxSubmissions?: number;
    attachments?: AssignmentAttachment[];
}

// =============================================================================
// ASSIGNMENT CRUD OPERATIONS
// =============================================================================

/**
 * Create a new assignment
 */
export async function createAssignment(
    data: AssignmentInput,
    createdBy: string,
    createdByName: string,
    publish: boolean = true
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
        title: data.title,
        description: data.description,
        instructions: data.instructions || null,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        sectionId: data.sectionId,
        sectionName: data.sectionName,
        createdBy,
        createdByName,
        dueDate: Timestamp.fromDate(data.dueDate),
        totalMarks: data.totalMarks,
        attachments: data.attachments || [],
        allowLateSubmission: data.allowLateSubmission ?? true,
        latePenalty: data.latePenalty || 10,
        maxSubmissions: data.maxSubmissions || 1,
        submissionCount: 0,
        status: publish ? 'published' : 'draft',
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Get assignments for a section
 */
export async function getAssignments(
    sectionId: string,
    status?: AssignmentStatus
): Promise<Assignment[]> {
    let q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where('sectionId', '==', sectionId),
        orderBy('dueDate', 'desc')
    );

    if (status) {
        q = query(
            collection(db, COLLECTIONS.ASSIGNMENTS),
            where('sectionId', '==', sectionId),
            where('status', '==', status),
            orderBy('dueDate', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as Assignment[];
}

/**
 * Get assignments for a student (all their section's assignments)
 */
export async function getStudentAssignments(
    sectionId: string
): Promise<Assignment[]> {
    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where('sectionId', '==', sectionId),
        where('status', '==', 'published'),
        orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Assignment[];
}

/**
 * Get assignments created by a teacher
 */
export async function getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where('createdBy', '==', teacherId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Assignment[];
}

/**
 * Get a single assignment by ID
 */
export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as Assignment;
}

/**
 * Update an assignment
 */
export async function updateAssignment(
    assignmentId: string,
    data: Partial<AssignmentInput>
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
    }

    await updateDoc(docRef, updateData);
}

/**
 * Publish a draft assignment
 */
export async function publishAssignment(assignmentId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(docRef, {
        status: 'published',
        updatedAt: serverTimestamp(),
    });
}

/**
 * Close an assignment (no more submissions)
 */
export async function closeAssignment(assignmentId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(docRef, {
        status: 'closed',
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
    // TODO: Also delete all submissions and their files
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await deleteDoc(docRef);
}

// =============================================================================
// SUBMISSION OPERATIONS
// =============================================================================

/**
 * Submit an assignment
 */
export async function submitAssignment(
    assignmentId: string,
    studentId: string,
    studentName: string,
    registerNo: string,
    files: File[],
    comment?: string
): Promise<string> {
    // Get assignment details
    const assignment = await getAssignment(assignmentId);
    if (!assignment) {
        throw new Error('Assignment not found');
    }

    // Check if assignment is still open
    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (!assignment.allowLateSubmission && isLate) {
        throw new Error('Assignment is past due date and does not accept late submissions');
    }

    // Get existing submissions count
    const existingSubmissions = await getStudentSubmissions(assignmentId, studentId);
    const attemptNumber = existingSubmissions.length + 1;

    if (attemptNumber > assignment.maxSubmissions) {
        throw new Error(`Maximum submissions (${assignment.maxSubmissions}) reached`);
    }

    // Upload files
    const uploadedFiles: AssignmentAttachment[] = [];
    for (const file of files) {
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `assignments/${assignmentId}/${studentId}/${timestamp}_${sanitizedFileName}`;
        const storageRef = ref(storage, filePath);

        await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        uploadedFiles.push({
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
        });
    }

    // Create submission
    const submissionRef = await addDoc(
        collection(db, COLLECTIONS.ASSIGNMENTS, assignmentId, 'submissions'),
        {
            assignmentId,
            studentId,
            studentName,
            registerNo,
            files: uploadedFiles,
            comment: comment || null,
            submittedAt: serverTimestamp(),
            isLate,
            attemptNumber,
            status: 'submitted',
        }
    );

    // Update submission count on assignment
    const assignmentRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(assignmentRef, {
        submissionCount: assignment.submissionCount + 1,
    });

    return submissionRef.id;
}

/**
 * Get all submissions for an assignment (teachers)
 */
export async function getAssignmentSubmissions(
    assignmentId: string
): Promise<AssignmentSubmission[]> {
    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS, assignmentId, 'submissions'),
        orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        gradedAt: doc.data().gradedAt?.toDate(),
    })) as AssignmentSubmission[];
}

/**
 * Get a student's submissions for an assignment
 */
export async function getStudentSubmissions(
    assignmentId: string,
    studentId: string
): Promise<AssignmentSubmission[]> {
    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS, assignmentId, 'submissions'),
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        gradedAt: doc.data().gradedAt?.toDate(),
    })) as AssignmentSubmission[];
}

/**
 * Grade a submission
 */
export async function gradeSubmission(
    assignmentId: string,
    submissionId: string,
    grade: number,
    feedback: string,
    gradedBy: string
): Promise<void> {
    const submissionRef = doc(
        db,
        COLLECTIONS.ASSIGNMENTS,
        assignmentId,
        'submissions',
        submissionId
    );

    await updateDoc(submissionRef, {
        grade,
        feedback,
        gradedBy,
        gradedAt: serverTimestamp(),
        status: 'graded',
    });
}

/**
 * Request resubmission
 */
export async function requestResubmission(
    assignmentId: string,
    submissionId: string,
    feedback: string,
    gradedBy: string
): Promise<void> {
    const submissionRef = doc(
        db,
        COLLECTIONS.ASSIGNMENTS,
        assignmentId,
        'submissions',
        submissionId
    );

    await updateDoc(submissionRef, {
        feedback,
        gradedBy,
        gradedAt: serverTimestamp(),
        status: 'resubmit',
    });
}

/**
 * Subscribe to assignment submissions in real-time
 */
export function subscribeToSubmissions(
    assignmentId: string,
    callback: (submissions: AssignmentSubmission[]) => void
) {
    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS, assignmentId, 'submissions'),
        orderBy('submittedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const submissions: AssignmentSubmission[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate(),
            gradedAt: doc.data().gradedAt?.toDate(),
        })) as AssignmentSubmission[];
        callback(submissions);
    });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate time remaining until due date
 */
export function getTimeRemaining(dueDate: Date): string {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();

    if (diff <= 0) {
        return 'Past due';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    } else {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m remaining`;
    }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: SubmissionStatus): string {
    switch (status) {
        case 'pending':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        case 'submitted':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'late':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'graded':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'resubmit':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
}

/**
 * Get upcoming assignments (due within specified days)
 */
export async function getUpcomingAssignments(
    sectionId: string,
    daysAhead: number = 7
): Promise<Assignment[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const q = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where('sectionId', '==', sectionId),
        where('status', '==', 'published'),
        where('dueDate', '>=', Timestamp.fromDate(now)),
        where('dueDate', '<=', Timestamp.fromDate(futureDate)),
        orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Assignment[];
}
