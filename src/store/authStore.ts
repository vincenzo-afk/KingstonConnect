import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseAuthUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@/lib/firebase';
import type { Profile, UserRole } from '@/types';

interface AuthState {
    user: Profile | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (registerNo: string, password: string) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
    verifyPin: (pin: string) => Promise<boolean>;
    setPin: (pin: string) => Promise<void>;
    clearError: () => void;
}

interface SignUpData {
    registerNo: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    departmentId?: string;
    year?: number;
    section?: string;
}

// Helper to convert register number to email format if needed
const getEmailFromRegisterNo = (registerNo: string): string => {
    // If it's already an email, return as is
    if (registerNo.includes('@')) return registerNo;
    // Convert register number to email format
    return `${registerNo.toLowerCase()}@kec.edu`;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            error: null,
            initialized: false,

            initialize: async () => {
                try {
                    set({ loading: true, error: null });

                    // Listen for auth state changes
                    onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
                        if (firebaseUser) {
                            // Fetch user profile from Firestore
                            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

                            if (userDoc.exists()) {
                                const userData = userDoc.data() as Profile;
                                set({
                                    user: { ...userData, id: firebaseUser.uid },
                                    initialized: true,
                                    loading: false
                                });
                            } else {
                                set({ user: null, initialized: true, loading: false });
                            }
                        } else {
                            set({ user: null, initialized: true, loading: false });
                        }
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to initialize auth',
                        loading: false,
                        initialized: true,
                    });
                }
            },

            signIn: async (registerNo: string, password: string) => {
                try {
                    set({ loading: true, error: null });

                    const email = getEmailFromRegisterNo(registerNo);

                    // Sign in with Firebase Auth
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);

                    // Fetch user profile
                    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));

                    if (!userDoc.exists()) {
                        throw new Error('User profile not found');
                    }

                    const userData = userDoc.data() as Profile;
                    set({ user: { ...userData, id: userCredential.user.uid }, loading: false });
                } catch (error: unknown) {
                    let message = 'Sign in failed';
                    if (error && typeof error === 'object' && 'code' in error) {
                        const firebaseError = error as { code: string };
                        switch (firebaseError.code) {
                            case 'auth/user-not-found':
                            case 'auth/wrong-password':
                            case 'auth/invalid-credential':
                                message = 'Invalid register number or password';
                                break;
                            case 'auth/too-many-requests':
                                message = 'Too many attempts. Please try again later';
                                break;
                            default:
                                message = 'Sign in failed. Please try again';
                        }
                    }
                    set({ error: message, loading: false });
                    throw new Error(message);
                }
            },

            signUp: async (data: SignUpData) => {
                try {
                    set({ loading: true, error: null });

                    // Create auth user
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        data.email,
                        data.password
                    );

                    // Create user profile in Firestore
                    const profile: Omit<Profile, 'id'> = {
                        register_no: data.registerNo.toUpperCase(),
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        department_id: data.departmentId,
                        year: data.year,
                        section: data.section,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };

                    await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), profile);

                    set({
                        user: { ...profile, id: userCredential.user.uid } as Profile,
                        loading: false
                    });
                } catch (error: unknown) {
                    let message = 'Sign up failed';
                    if (error && typeof error === 'object' && 'code' in error) {
                        const firebaseError = error as { code: string };
                        switch (firebaseError.code) {
                            case 'auth/email-already-in-use':
                                message = 'This email is already registered';
                                break;
                            case 'auth/weak-password':
                                message = 'Password should be at least 6 characters';
                                break;
                            default:
                                message = 'Sign up failed. Please try again';
                        }
                    }
                    set({ error: message, loading: false });
                    throw new Error(message);
                }
            },

            signOut: async () => {
                try {
                    set({ loading: true, error: null });
                    await firebaseSignOut(auth);
                    set({ user: null, loading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Sign out failed',
                        loading: false,
                    });
                }
            },

            updateProfile: async (data: Partial<Profile>) => {
                try {
                    const { user } = get();
                    if (!user) throw new Error('No user logged in');

                    set({ loading: true, error: null });

                    const updateData = {
                        ...data,
                        updated_at: new Date().toISOString(),
                    };

                    await updateDoc(doc(db, COLLECTIONS.USERS, user.id), updateData);

                    set({
                        user: { ...user, ...updateData },
                        loading: false
                    });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update profile',
                        loading: false,
                    });
                }
            },

            verifyPin: async (pin: string) => {
                const { user } = get();
                if (!user || !user.pin_hash) return false;

                // Simple comparison for demo - in production use proper hashing
                const hashedPin = btoa(pin);
                return hashedPin === user.pin_hash;
            },

            setPin: async (pin: string) => {
                try {
                    const { user } = get();
                    if (!user) throw new Error('No user logged in');

                    const hashedPin = btoa(pin);

                    await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
                        pin_hash: hashedPin,
                        updated_at: new Date().toISOString(),
                    });

                    set({ user: { ...user, pin_hash: hashedPin } });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to set PIN',
                    });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'kec-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
