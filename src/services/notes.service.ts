/**
 * Notes Service
 * Handles all notes-related database operations including upload, download, and approval
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
    increment,
    limit,
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { db, storage, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export interface Note {
    id: string;
    title: string;
    description: string;
    subject: string;
    subjectCode?: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedByName: string;
    uploadedByRole: 'student' | 'teacher';
    department?: string;
    year?: number;
    semester?: number;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    downloadCount: number;
    tags: string[];
    uploadedAt: Date;
    updatedAt?: Date;
}

export interface NoteUploadInput {
    title: string;
    description: string;
    subject: string;
    subjectCode?: string;
    department?: string;
    year?: number;
    semester?: number;
    tags?: string[];
}

export interface NoteFilter {
    subject?: string;
    department?: string;
    year?: number;
    semester?: number;
    status?: 'pending' | 'approved' | 'rejected';
    uploadedBy?: string;
    searchQuery?: string;
}

// =============================================================================
// NOTES CRUD OPERATIONS
// =============================================================================

/**
 * Upload a new note with file
 */
export async function uploadNote(
    file: File,
    noteData: NoteUploadInput,
    uploaderId: string,
    uploaderName: string,
    uploaderRole: 'student' | 'teacher'
): Promise<{ noteId: string; progress: number }> {
    // Create unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `notes/${uploaderId}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, filePath);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (_snapshot) => {
                // Progress tracking available via snapshot.bytesTransferred / snapshot.totalBytes
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Create note document
                    const noteDoc = await addDoc(collection(db, COLLECTIONS.NOTES), {
                        title: noteData.title,
                        description: noteData.description,
                        subject: noteData.subject,
                        subjectCode: noteData.subjectCode || null,
                        fileUrl: downloadURL,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        filePath,
                        uploadedBy: uploaderId,
                        uploadedByName: uploaderName,
                        uploadedByRole: uploaderRole,
                        department: noteData.department || null,
                        year: noteData.year || null,
                        semester: noteData.semester || null,
                        status: uploaderRole === 'teacher' ? 'approved' : 'pending',
                        downloadCount: 0,
                        tags: noteData.tags || [],
                        uploadedAt: serverTimestamp(),
                    });

                    resolve({ noteId: noteDoc.id, progress: 100 });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Get notes with filters
 */
export async function getNotes(
    filters: NoteFilter = {},
    maxResults: number = 50
): Promise<Note[]> {
    let q = query(
        collection(db, COLLECTIONS.NOTES),
        where('status', '==', 'approved'),
        orderBy('uploadedAt', 'desc'),
        limit(maxResults)
    );

    // Apply filters
    if (filters.subject) {
        q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.department) {
        q = query(q, where('department', '==', filters.department));
    }
    if (filters.year) {
        q = query(q, where('year', '==', filters.year));
    }
    if (filters.status) {
        q = query(
            collection(db, COLLECTIONS.NOTES),
            where('status', '==', filters.status),
            orderBy('uploadedAt', 'desc'),
            limit(maxResults)
        );
    }
    if (filters.uploadedBy) {
        q = query(
            collection(db, COLLECTIONS.NOTES),
            where('uploadedBy', '==', filters.uploadedBy),
            orderBy('uploadedAt', 'desc'),
            limit(maxResults)
        );
    }

    const snapshot = await getDocs(q);
    let notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as Note[];

    // Client-side search filter
    if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        notes = notes.filter(note =>
            note.title.toLowerCase().includes(search) ||
            note.description.toLowerCase().includes(search) ||
            note.subject.toLowerCase().includes(search) ||
            note.tags.some(tag => tag.toLowerCase().includes(search))
        );
    }

    return notes;
}

/**
 * Get pending notes for approval (teachers/HODs)
 */
export async function getPendingNotes(department?: string): Promise<Note[]> {
    let q = query(
        collection(db, COLLECTIONS.NOTES),
        where('status', '==', 'pending'),
        orderBy('uploadedAt', 'desc')
    );

    if (department) {
        q = query(
            collection(db, COLLECTIONS.NOTES),
            where('status', '==', 'pending'),
            where('department', '==', department),
            orderBy('uploadedAt', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
    })) as Note[];
}

/**
 * Approve a note
 */
export async function approveNote(noteId: string, approverId: string): Promise<void> {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(noteRef, {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Reject a note
 */
export async function rejectNote(
    noteId: string,
    approverId: string,
    reason: string
): Promise<void> {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(noteRef, {
        status: 'rejected',
        approvedBy: approverId,
        rejectionReason: reason,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(noteId: string): Promise<void> {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(noteRef, {
        downloadCount: increment(1),
    });
}

/**
 * Delete a note (and its file)
 */
export async function deleteNote(noteId: string): Promise<void> {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    const noteDoc = await getDoc(noteRef);

    if (!noteDoc.exists()) {
        throw new Error('Note not found');
    }

    const noteData = noteDoc.data();

    // Delete file from storage
    if (noteData.filePath) {
        try {
            const fileRef = ref(storage, noteData.filePath);
            await deleteObject(fileRef);
        } catch (error) {
            console.warn('Failed to delete file from storage:', error);
        }
    }

    // Delete document
    await deleteDoc(noteRef);
}

/**
 * Subscribe to notes updates in real-time
 */
export function subscribeToNotes(
    callback: (notes: Note[]) => void,
    filters: NoteFilter = {}
) {
    let q = query(
        collection(db, COLLECTIONS.NOTES),
        where('status', '==', filters.status || 'approved'),
        orderBy('uploadedAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const notes: Note[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate(),
            approvedAt: doc.data().approvedAt?.toDate(),
        })) as Note[];
        callback(notes);
    });
}

/**
 * Get popular notes (most downloaded)
 */
export async function getPopularNotes(limitCount: number = 10): Promise<Note[]> {
    const q = query(
        collection(db, COLLECTIONS.NOTES),
        where('status', '==', 'approved'),
        orderBy('downloadCount', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
    })) as Note[];
}

/**
 * Get distinct subjects from notes
 */
export async function getAvailableSubjects(): Promise<string[]> {
    const q = query(
        collection(db, COLLECTIONS.NOTES),
        where('status', '==', 'approved')
    );

    const snapshot = await getDocs(q);
    const subjects = new Set<string>();
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.subject) {
            subjects.add(data.subject);
        }
    });

    return Array.from(subjects).sort();
}

/**
 * Get file type icon name based on file type
 */
export function getFileTypeIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-doc';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-presentation';
    if (fileType.includes('image')) return 'file-image';
    if (fileType.includes('video')) return 'file-video';
    if (fileType.includes('audio')) return 'file-audio';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'file-archive';
    return 'file';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
