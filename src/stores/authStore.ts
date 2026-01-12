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

            login: async (_email: string, _password: string) => {
                set({ isLoading: true });

                try {
                    // Simulate API call - in production, this would hit your auth endpoint
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Mock user for demo - replace with actual auth logic
                    const mockUser: Profile = {
                        id: '1',
                        email: 'john.doe@kec.edu',
                        firstName: 'John',
                        lastName: 'Doe',
                        role: 'student',
                        department: 'CSE',
                        rollNumber: '21BCE1234',
                        semester: 6,
                        section: 'A',
                        phone: '+91 9876543210',
                        cgpa: 8.5,
                        credits: 120,
                        rank: 15,
                    };

                    set({ user: mockUser, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true });

                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const mockUser: Profile = {
                        id: '1',
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

                    set({ user: mockUser, isAuthenticated: true, isLoading: false });
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
