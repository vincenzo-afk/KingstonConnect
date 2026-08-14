import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    login: (email: string, password: string) => Promise<void>;
    register: (data: Partial<Profile> & { password: string }) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<Profile>) => void;
    setUser: (user: Profile | null) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, _password: string) => {
                set({ isLoading: true });

                try {
                    // Local demo auth: derive the profile from what the user
                    // actually typed (no hardcoded demo identity). A staff
                    // email (e.g. staff/faculty/principal/hod dept address)
                    // logs in as teacher; everything else is a student whose
                    // register number / semester / section they set later on
                    // the AU Portal or in their profile.
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const local = email.split('@')[0];
                    const isStaff =
                        /staff|faculty|prof|teacher|hod|principal|admin/i.test(local);
                    const [first, ...rest] = local.replace(/[._-]/g, ' ').split(' ');

                    const profile: Profile = {
                        id: btoa(email).slice(0, 12),
                        email,
                        firstName: first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Student',
                        lastName: rest.join(' ').replace(/\b\w/g, c => c.toUpperCase()) || '',
                        role: isStaff ? 'teacher' : 'student',
                        department: 'CSE',
                        section: 'A',
                    };

                    set({ user: profile, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true });

                try {
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const profile: Profile = {
                        id: btoa(data.email ?? '').slice(0, 12),
                        email: data.email!,
                        firstName: data.firstName!,
                        lastName: data.lastName!,
                        role: data.role!,
                        department: data.department!,
                        rollNumber: data.rollNumber,
                        employeeId: data.employeeId,
                        semester: data.semester,
                        section: data.section,
                        phone: data.phone,
                    };

                    set({ user: profile, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            updateProfile: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                }));
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },
        }),
        {
            name: 'kingston-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
