/**
 * Announcements Service
 * Handles all announcement-related database operations
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
    limit,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export type AnnouncementScope = 'college' | 'department' | 'section' | 'class';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    scope: AnnouncementScope;
    scopeTarget?: string; // department_id, section_id, etc.
    priority: AnnouncementPriority;
    isPinned: boolean;
    authorId: string;
    authorName: string;
    authorRole: string;
    attachments: AnnouncementAttachment[];
    expiresAt?: Date;
    readBy: string[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface AnnouncementAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface AnnouncementInput {
    title: string;
    content: string;
    scope: AnnouncementScope;
    scopeTarget?: string;
    priority?: AnnouncementPriority;
    isPinned?: boolean;
    attachments?: AnnouncementAttachment[];
    expiresAt?: Date;
}

// =============================================================================
// ANNOUNCEMENTS CRUD OPERATIONS
// =============================================================================

/**
 * Create a new announcement
 */
export async function createAnnouncement(
    data: AnnouncementInput,
    authorId: string,
    authorName: string,
    authorRole: string
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
        title: data.title,
        content: data.content,
        scope: data.scope,
        scopeTarget: data.scopeTarget || null,
        priority: data.priority || 'normal',
        isPinned: data.isPinned || false,
        authorId,
        authorName,
        authorRole,
        attachments: data.attachments || [],
        expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
        readBy: [],
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Get announcements visible to a user based on their role and department
 */
export async function getAnnouncements(
    _userId: string,
    userDepartment?: string,
    userSection?: string,
    maxResults: number = 50
): Promise<Announcement[]> {
    // Get all college-wide announcements
    const collegeQuery = query(
        collection(db, COLLECTIONS.ANNOUNCEMENTS),
        where('scope', '==', 'college'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
    );

    const collegeSnapshot = await getDocs(collegeQuery);
    let announcements = collegeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as Announcement[];

    // Get department-specific announcements
    if (userDepartment) {
        const deptQuery = query(
            collection(db, COLLECTIONS.ANNOUNCEMENTS),
            where('scope', '==', 'department'),
            where('scopeTarget', '==', userDepartment),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );

        const deptSnapshot = await getDocs(deptQuery);
        const deptAnnouncements = deptSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate(),
        })) as Announcement[];

        announcements = [...announcements, ...deptAnnouncements];
    }

    // Get section-specific announcements
    if (userSection) {
        const sectionQuery = query(
            collection(db, COLLECTIONS.ANNOUNCEMENTS),
            where('scope', '==', 'section'),
            where('scopeTarget', '==', userSection),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );

        const sectionSnapshot = await getDocs(sectionQuery);
        const sectionAnnouncements = sectionSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate(),
        })) as Announcement[];

        announcements = [...announcements, ...sectionAnnouncements];
    }

    // Filter out expired announcements and sort
    const now = new Date();
    announcements = announcements
        .filter(a => !a.expiresAt || a.expiresAt > now)
        .sort((a, b) => {
            // Pinned first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by priority
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            // Then by date
            return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, maxResults);

    return announcements;
}

/**
 * Get announcements created by a specific user
 */
export async function getMyAnnouncements(authorId: string): Promise<Announcement[]> {
    const q = query(
        collection(db, COLLECTIONS.ANNOUNCEMENTS),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
    })) as Announcement[];
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(
    announcementId: string,
    data: Partial<AnnouncementInput>
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
    await updateDoc(docRef, {
        ...data,
        expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(announcementId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
    await deleteDoc(docRef);
}

/**
 * Pin/Unpin an announcement
 */
export async function togglePinAnnouncement(
    announcementId: string,
    isPinned: boolean
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
    await updateDoc(docRef, {
        isPinned,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Mark announcement as read by user
 */
export async function markAnnouncementRead(
    announcementId: string,
    userId: string
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const readBy = docSnap.data().readBy || [];
        if (!readBy.includes(userId)) {
            await updateDoc(docRef, {
                readBy: [...readBy, userId],
            });
        }
    }
}

/**
 * Get unread announcement count for a user
 */
export async function getUnreadAnnouncementCount(
    userId: string,
    userDepartment?: string,
    userSection?: string
): Promise<number> {
    const announcements = await getAnnouncements(userId, userDepartment, userSection);
    return announcements.filter(a => !a.readBy.includes(userId)).length;
}

/**
 * Subscribe to announcements in real-time
 */
export function subscribeToAnnouncements(
    callback: (announcements: Announcement[]) => void,
    scope: AnnouncementScope = 'college',
    scopeTarget?: string
) {
    let q = query(
        collection(db, COLLECTIONS.ANNOUNCEMENTS),
        where('scope', '==', scope),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    if (scopeTarget && scope !== 'college') {
        q = query(
            collection(db, COLLECTIONS.ANNOUNCEMENTS),
            where('scope', '==', scope),
            where('scopeTarget', '==', scopeTarget),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
    }

    return onSnapshot(q, (snapshot) => {
        const announcements: Announcement[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate(),
        })) as Announcement[];
        callback(announcements);
    });
}

/**
 * Get recent important announcements (urgent/high priority or pinned)
 */
export async function getImportantAnnouncements(limitCount: number = 5): Promise<Announcement[]> {
    const q = query(
        collection(db, COLLECTIONS.ANNOUNCEMENTS),
        where('scope', '==', 'college'),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const snapshot = await getDocs(q);
    const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
    })) as Announcement[];

    return announcements
        .filter(a => a.isPinned || a.priority === 'urgent' || a.priority === 'high')
        .slice(0, limitCount);
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: AnnouncementPriority): string {
    switch (priority) {
        case 'urgent':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'high':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'normal':
            return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        case 'low':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
}

/**
 * Get scope badge color
 */
export function getScopeColor(scope: AnnouncementScope): string {
    switch (scope) {
        case 'college':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'department':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'section':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'class':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
}
