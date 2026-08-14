import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// ANNOUNCEMENTS STORE — real announcements created in-app (no mock data)
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
}

export const useAnnouncementsStore = create<AnnouncementsStore>()(
    persist(
        (set) => ({
            announcements: [],

            addAnnouncement: (data) =>
                set((state) => ({
                    announcements: [
                        {
                            ...data,
                            id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            date: new Date().toISOString().split('T')[0],
                        },
                        ...state.announcements,
                    ],
                })),

            removeAnnouncement: (id) =>
                set((state) => ({
                    announcements: state.announcements.filter((a) => a.id !== id),
                })),
        }),
        { name: 'kingston-announcements' }
    )
);
