import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// TYPES
// =============================================================================

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: string;
    actionUrl?: string;
}

interface UIStore {
    // Theme
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;

    // Sidebar
    sidebarCollapsed: boolean;
    sidebarMobileOpen: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarMobileOpen: (open: boolean) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    clearNotifications: () => void;
    removeNotification: (id: string) => void;

    // Loading states
    globalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Modal states
    activeModal: string | null;
    setActiveModal: (modal: string | null) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            // Theme
            theme: 'dark',
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
            setTheme: (theme) => set({ theme }),

            // Sidebar
            sidebarCollapsed: false,
            sidebarMobileOpen: false,
            toggleSidebar: () => set((state) => ({
                sidebarCollapsed: !state.sidebarCollapsed
            })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

            // Notifications
            notifications: [],
            addNotification: (notification) => set((state) => ({
                notifications: [
                    {
                        ...notification,
                        id: Date.now().toString(),
                        timestamp: new Date().toISOString(),
                        read: false,
                    },
                    ...state.notifications,
                ].slice(0, 50), // Keep max 50 notifications
            })),
            markNotificationRead: (id) => set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                ),
            })),
            markAllNotificationsRead: () => set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
            })),
            clearNotifications: () => set({ notifications: [] }),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            })),

            // Loading states
            globalLoading: false,
            setGlobalLoading: (loading) => set({ globalLoading: loading }),

            // Modal states
            activeModal: null,
            setActiveModal: (modal) => set({ activeModal: modal }),
        }),
        {
            name: 'kingston-ui',
            partialize: (state) => ({
                theme: state.theme,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

export default useUIStore;
