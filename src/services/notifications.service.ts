/**
 * Notifications Service
 * Handles all notification-related database operations and push notifications
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
    onSnapshot,
    serverTimestamp,
    Timestamp,
    limit,
    writeBatch,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType =
    | 'announcement'
    | 'assignment'
    | 'attendance'
    | 'result'
    | 'message'
    | 'reminder'
    | 'alert'
    | 'system';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    icon?: string;
    link?: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

export interface NotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    icon?: string;
    link?: string;
    data?: Record<string, any>;
    expiresAt?: Date;
}

// =============================================================================
// NOTIFICATION CRUD OPERATIONS
// =============================================================================

/**
 * Create a notification for a single user
 */
export async function createNotification(data: NotificationInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        icon: data.icon || null,
        link: data.link || null,
        data: data.data || null,
        read: false,
        createdAt: serverTimestamp(),
        expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
    });

    return docRef.id;
}

/**
 * Create notifications for multiple users (batch)
 */
export async function createBulkNotifications(
    userIds: string[],
    notification: Omit<NotificationInput, 'userId'>
): Promise<void> {
    const batch = writeBatch(db);

    for (const userId of userIds) {
        const docRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        batch.set(docRef, {
            userId,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            icon: notification.icon || null,
            link: notification.link || null,
            data: notification.data || null,
            read: false,
            createdAt: serverTimestamp(),
            expiresAt: notification.expiresAt ? Timestamp.fromDate(notification.expiresAt) : null,
        });
    }

    await batch.commit();
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
    userId: string,
    unreadOnly: boolean = false,
    maxResults: number = 50
): Promise<Notification[]> {
    let q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
    );

    if (unreadOnly) {
        q = query(
            collection(db, COLLECTIONS.NOTIFICATIONS),
            where('userId', '==', userId),
            where('read', '==', false),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
    })) as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(docRef, { read: true });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true });
    });

    await batch.commit();
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await deleteDoc(docRef);
}

/**
 * Delete all notifications for a user
 */
export async function clearAllNotifications(userId: string): Promise<void> {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
    });

    await batch.commit();
}

/**
 * Subscribe to notifications in real-time
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    maxResults: number = 20
) {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate(),
        })) as Notification[];
        callback(notifications);
    });
}

// =============================================================================
// PUSH NOTIFICATION HELPERS
// =============================================================================

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support push notifications');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
    title: string,
    options?: NotificationOptions
): globalThis.Notification | null {
    if (!('Notification' in window)) {
        return null;
    }

    if (Notification.permission === 'granted') {
        return new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
        });
    }

    return null;
}

// =============================================================================
// NOTIFICATION TYPE HELPERS
// =============================================================================

/**
 * Get icon for notification type
 */
export function getNotificationIcon(type: NotificationType): string {
    switch (type) {
        case 'announcement':
            return 'megaphone';
        case 'assignment':
            return 'clipboard-list';
        case 'attendance':
            return 'user-check';
        case 'result':
            return 'trophy';
        case 'message':
            return 'message-circle';
        case 'reminder':
            return 'bell';
        case 'alert':
            return 'alert-triangle';
        case 'system':
            return 'settings';
        default:
            return 'bell';
    }
}

/**
 * Get color for notification type
 */
export function getNotificationColor(type: NotificationType): string {
    switch (type) {
        case 'announcement':
            return 'text-purple-400';
        case 'assignment':
            return 'text-blue-400';
        case 'attendance':
            return 'text-green-400';
        case 'result':
            return 'text-yellow-400';
        case 'message':
            return 'text-cyan-400';
        case 'reminder':
            return 'text-orange-400';
        case 'alert':
            return 'text-red-400';
        case 'system':
            return 'text-slate-400';
        default:
            return 'text-slate-400';
    }
}

/**
 * Format notification time
 */
export function formatNotificationTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60000) return 'Just now';

    // Less than an hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins}m ago`;
    }

    // Less than a day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Less than a week
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// =============================================================================
// NOTIFICATION TRIGGERS (for other services to use)
// =============================================================================

/**
 * Send assignment notification
 */
export async function notifyAssignment(
    userIds: string[],
    assignmentTitle: string,
    dueDate: Date
): Promise<void> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    await createBulkNotifications(userIds, {
        type: 'assignment',
        title: 'New Assignment',
        body: `"${assignmentTitle}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
        link: '/assignments',
        data: { dueDate: dueDate.toISOString() },
    });
}

/**
 * Send attendance alert
 */
export async function notifyLowAttendance(
    userId: string,
    percentage: number,
    subject?: string
): Promise<void> {
    await createNotification({
        userId,
        type: 'attendance',
        title: 'Low Attendance Alert',
        body: subject
            ? `Your attendance in ${subject} is ${percentage}%. You need minimum 75% to appear for exams.`
            : `Your overall attendance is ${percentage}%. Please attend classes regularly.`,
        link: '/attendance',
    });
}

/**
 * Send result notification
 */
export async function notifyResult(
    userId: string,
    examName: string
): Promise<void> {
    await createNotification({
        userId,
        type: 'result',
        title: 'Results Published',
        body: `Results for "${examName}" have been published. Check your grades now.`,
        link: '/results',
    });
}

/**
 * Send announcement notification
 */
export async function notifyAnnouncement(
    userIds: string[],
    announcementTitle: string,
    announcementId: string
): Promise<void> {
    await createBulkNotifications(userIds, {
        type: 'announcement',
        title: 'New Announcement',
        body: announcementTitle,
        link: '/announcements',
        data: { announcementId },
    });
}
