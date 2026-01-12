import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';

interface UIState {
    // Sidebar
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Modals
    pinModalOpen: boolean;
    pinVerified: boolean;

    // Theme
    theme: 'dark' | 'light';

    // Toasts
    toasts: Toast[];

    // Loading states
    globalLoading: boolean;
    loadingMessage: string;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapse: () => void;

    openPinModal: () => void;
    closePinModal: () => void;
    setPinVerified: (verified: boolean) => void;

    setTheme: (theme: 'dark' | 'light') => void;
    toggleTheme: () => void;

    addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    removeToast: (id: string) => void;

    setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    // Initial state
    sidebarOpen: true,
    sidebarCollapsed: false,
    pinModalOpen: false,
    pinVerified: false,
    theme: 'dark',
    toasts: [],
    globalLoading: false,
    loadingMessage: '',

    // Sidebar actions
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // PIN Modal actions
    openPinModal: () => set({ pinModalOpen: true }),
    closePinModal: () => set({ pinModalOpen: false }),
    setPinVerified: (verified) => set({ pinVerified: verified, pinModalOpen: false }),

    // Theme actions
    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
    },
    toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        set({ theme: newTheme });
    },

    // Toast actions
    addToast: (type, title, message, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, type, title, message, duration };

        set((state) => ({ toasts: [...state.toasts, toast] }));

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    // Global loading
    setGlobalLoading: (loading, message = 'Loading...') => {
        set({ globalLoading: loading, loadingMessage: message });
    },
}));

// Helper hooks for common toast types
export const useToast = () => {
    const addToast = useUIStore((state) => state.addToast);

    return {
        success: (title: string, message?: string) => addToast('success', title, message),
        error: (title: string, message?: string) => addToast('error', title, message),
        warning: (title: string, message?: string) => addToast('warning', title, message),
        info: (title: string, message?: string) => addToast('info', title, message),
    };
};
