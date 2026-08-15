import { create } from 'zustand';

// =============================================================================
// ANNOUNCEMENTS STORE — Firestore-backed with offline mirror.
//
// The Announcements page drives Firestore mutations through addAnnouncement /
// removeAnnouncement; the Firestore onSnapshot listener authoritative-refreshes
// the local state. When Firebase is unreachable the page falls back to the
// localStorage mirror.
// =============================================================================

export type AnnouncementPriority = 'high' | 'medium' | 'low';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    authorRole: string;
    priority: AnnouncementPriority;
    date: string; // ISO YYYY-MM-DD
    department: string | null;
}

interface AnnouncementsStore {
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
    removeAnnouncement: (id: string) => void;
    /** Firestore -> local mirror updater (called from the Announcements page hook). */
    syncAnnouncementsFromFirestore: (items: Announcement[]) => void;
}

export const useAnnouncementsStore = create<AnnouncementsStore>()((set) => {
    let fallback: Announcement[] = [];
    try {
        fallback = JSON.parse(localStorage.getItem('kingston-announcements') || '[]') as Announcement[];
    } catch {
        /* ignore */
    }
    return {
        announcements: fallback,
        addAnnouncement: () => undefined, // replaced by the Firestore-backed call
        removeAnnouncement: () => undefined,
        syncAnnouncementsFromFirestore: (items) => {
            set({ announcements: items });
            try {
                localStorage.setItem('kingston-announcements', JSON.stringify(items));
            } catch {
                /* non-fatal */
            }
        },
    };
});
