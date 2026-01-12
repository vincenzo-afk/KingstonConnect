import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const isConfigured = Object.values(firebaseConfig).every(
    (value) => value !== undefined && value !== ''
);

if (!isConfigured) {
    console.warn(
        'Firebase credentials not found. Please set the VITE_FIREBASE_* environment variables in your .env file.'
    );
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional, only in browser)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

// ============================================
// Collection Names
// ============================================

export const COLLECTIONS = {
    // Core collections
    USERS: 'users',
    DEPARTMENTS: 'departments',
    SECTIONS: 'sections',

    // Attendance
    ATTENDANCE: 'attendance',
    ATTENDANCE_SESSIONS: 'attendance_sessions',

    // Assignments
    ASSIGNMENTS: 'assignments',

    // Academic
    TESTS: 'tests',
    RESULTS: 'results',
    TIMETABLE: 'timetable',

    // Events
    CALENDAR_EVENTS: 'calendar_events',

    // Notes
    NOTES: 'notes',
    NOTE_CHUNKS: 'note_chunks',

    // Communication
    CHATS: 'chats',
    MESSAGES: 'messages',
    ANNOUNCEMENTS: 'announcements',
    NOTIFICATIONS: 'notifications',

    // Analytics & Logs
    AUDIT_LOGS: 'audit_logs',
    STUDY_SESSIONS: 'study_sessions',

    // Anna University Integration
    AU_RESULTS: 'au_results',
    AU_CACHE: 'au_cache', // Cached data from Anna University portal
} as const;

// ============================================
// Type Definitions for Firebase
// ============================================

export interface FirebaseUser {
    uid: string;
    registerNo: string;
    name: string;
    email: string;
    phone?: string;
    role: 'student' | 'teacher' | 'hod' | 'principal';
    departmentId?: string;
    year?: number;
    section?: string;
    pinHash?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FirebaseDepartment {
    id: string;
    name: string;
    code: string;
    hodId?: string;
    createdAt: Date;
}

export interface FirebaseAnnouncement {
    id: string;
    title: string;
    content: string;
    attachments?: string[];
    scope: 'college' | 'department' | 'section';
    scopeId?: string;
    pinned: boolean;
    createdBy: string;
    createdAt: Date;
}

export interface FirebaseNotification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: Date;
}

// ============================================
// Helper Functions
// ============================================

export const serverTimestamp = () => new Date();

export const formatFirestoreDate = (date: Date | { toDate: () => Date } | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'object' && 'toDate' in date) return date.toDate();
    return null;
};
