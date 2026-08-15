import { create } from 'zustand';
import {
    subscribeAuth,
    signInEmail,
    signUpEmail,
    signInGoogle,
    signOutUser,
    patchProfile,
    emailToBaseProfile,
} from '@/services/firebaseAuth.service';
import { auth, db } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'student' | 'teacher' | 'hod' | 'principal';
export type Department = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT';

export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    department: Department;
    rollNumber?: string;
    employeeId?: string;
    semester?: number;
    section?: string;
    phone?: string;
    avatar?: string;
    cgpa?: number;
    credits?: number;
    rank?: number;
}

interface AuthStore {
    user: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    /** Real Firebase sign-in (email/password). */
    login: (email: string, password: string) => Promise<void>;
    /** Real Firebase registration with profile details. */
    register: (data: Partial<Profile> & { password: string; firstName: string; lastName: string }) => Promise<void>;
    /** Google popup sign-in. */
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
    setUser: (user: Profile | null) => void;
    clearError: () => void;
}

function wrapError(e: unknown): string {
    const code = (e as { code?: string; message?: string }).code;
    const message = (e as { code?: string; message?: string }).message ?? 'Something went wrong';
    const friendly: Record<string, string> = {
        'auth/invalid-credential': 'Wrong email or password. Please check and try again.',
        'auth/user-not-found': 'No account found with this email. Please register first.',
        'auth/wrong-password': 'Wrong password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/popup-blocked': 'Sign-in popup was blocked. Allow popups and try again.',
        'auth/api-key-not-valid': 'Firebase configuration is invalid. Please contact support.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/unauthorized-continue-uri': 'Firebase domain not allow-listed. Please contact support.',
    };
    return friendly[code ?? ''] ?? message;
}

// =============================================================================
// STORE
// =============================================================================

export const useAuthStore = create<AuthStore>()((set, get) => {
    // Subscribe to Firebase auth state once. onAuthStateChanged drives the
    // session in real time (this keeps 2000 members in sync without polling).
    try {
        const unsub = subscribeAuth(
            auth,
            db,
            (profile) => {
                set({ user: profile, isAuthenticated: !!profile, isLoading: false });
            },
            (error) => {
                // Non-fatal listener errors: session still works from auth state
                set({ error: error.message });
            }
        );
        // The subscription lives for the lifetime of the store instance.
        void unsub;
    } catch (e) {
        // Firebase misconfigured — app stays usable with local session
        console.warn('Firebase auth unavailable, running offline', e);
    }

    return {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,

        login: async (email: string, password: string) => {
            set({ isLoading: true, error: null });
            try {
                await signInEmail(auth, email.trim().toLowerCase(), password);
            } catch (e) {
                set({ isLoading: false, error: wrapError(e) });
                throw e;
            }
        },

        register: async (data) => {
            set({ isLoading: true, error: null });
            try {
                const email = (data.email ?? '').trim().toLowerCase();
                const isStaff = /staff|faculty|prof|teacher|hod|principal|admin/i.test(email.split('@')[0]);
                const base = emailToBaseProfile(email);
                const profile = {
                    ...base,
                    firstName: data.firstName ?? base.firstName,
                    lastName: data.lastName ?? base.lastName,
                    email,
                    role: data.role ?? (isStaff ? 'teacher' : base.role),
                    department: data.department ?? (base.department as Department),
                    rollNumber: data.rollNumber,
                    employeeId: data.employeeId,
                    semester: data.semester,
                    section: data.section,
                    phone: data.phone,
                } as unknown as Parameters<typeof signUpEmail>[3];
                await signUpEmail(auth, email, data.password, profile);
            } catch (e) {
                set({ isLoading: false, error: wrapError(e) });
                throw e;
            }
        },

        loginWithGoogle: async () => {
            set({ isLoading: true, error: null });
            try {
                await signInGoogle(auth);
            } catch (e) {
                set({ isLoading: false, error: wrapError(e) });
                throw e;
            }
        },

        logout: async () => {
            try {
                await signOutUser(auth);
            } catch (e) {
                set({ error: wrapError(e) });
            }
            set({ user: null, isAuthenticated: false });
        },

        updateProfile: async (data) => {
            const { user, isAuthenticated } = get();
            set((state) => ({
                user: state.user ? { ...state.user, ...data } : null,
            }));
            if (isAuthenticated && user && user.email) {
                try {
                    await patchProfile(db, user.email, data);
                } catch (e) {
                    console.warn('Profile sync to Firestore failed', e);
                }
            }
        },

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        clearError: () => set({ error: null }),
    };
});

export default useAuthStore;
