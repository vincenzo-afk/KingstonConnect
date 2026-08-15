/**
 * Firebase Auth Service
 * Real authentication backed by Firebase Auth (project: kingston-connect-5113)
 * - Email / password sign in + registration
 * - Google sign-in (popup)
 * - User profile synced to Firestore users/{uid}
 * - onAuthStateChanged drives the app session (works across ~2000 members)
 */
import {
    Auth,
    User,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile as fbUpdateProfile,
    onAuthStateChanged,
    Unsubscribe,
} from 'firebase/auth';
import {
    Firestore,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Profile, UserRole } from '@/stores/authStore';

export interface FirebaseProfileDoc {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    department?: string;
    rollNumber?: string;
    employeeId?: string;
    semester?: number;
    section?: string;
    phone?: string;
    avatar?: string;
    provider?: 'password' | 'google';
    createdAt?: number;
}

export const isStaffEmail = (email: string): boolean =>
    /staff|faculty|prof|teacher|hod|principal|admin/i.test(email.split('@')[0]);

export const emailToBaseProfile = (email: string, provider?: string): Profile => {
    const local = email.split('@')[0];
    const isStaff = isStaffEmail(email);
    const [first, ...rest] = local.replace(/[._-]/g, ' ').split(' ');
    return {
        id: email, // stable id across sessions
        email,
        firstName: first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Student',
        lastName: rest.join(' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '',
        role: isStaff ? 'teacher' : 'student',
        department: 'CSE',
        section: 'A',
        ...(provider ? { id: `${email}::${provider}` } : {}),
    };
};

export const profileToDoc = (profile: Profile, provider = 'password'): FirebaseProfileDoc => ({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    department: profile.department,
    rollNumber: profile.rollNumber,
    employeeId: profile.employeeId,
    semester: profile.semester,
    section: profile.section,
    phone: profile.phone,
    avatar: profile.avatar,
    provider: provider as 'password' | 'google',
    createdAt: Date.now(),
});

export const docToProfile = (uid: string, d: FirebaseProfileDoc): Profile => ({
    id: uid,
    email: d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    role: d.role,
    department: (d.department as Profile['department']) || 'CSE',
    rollNumber: d.rollNumber,
    employeeId: d.employeeId,
    semester: d.semester,
    section: d.section,
    phone: d.phone,
    avatar: d.avatar,
});

/**
 * Subscribe to Firebase auth state. Calls `onAuth` when the user signs in/out,
 * and `onProfile` whenever the Firestore profile doc changes (realtime sync).
 * Returns an unsubscribe function.
 */
export function subscribeAuth(
    auth: Auth,
    db: Firestore,
    onAuth: (profile: Profile | null) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    let profileUnsub: Unsubscribe | undefined;

    const loadProfile = async (fbUser: User) => {
        const provider =
            fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password';
        const base = emailToBaseProfile(fbUser.email ?? '', provider);
        // Profile docs are keyed by email (stable across sign-in providers and
        // consistent with profile patch calls that use the session email).
        const emailKey = fbUser.email ?? fbUser.uid;
        const ref = doc(db, 'users', emailKey);
        try {
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const d = snap.data() as FirebaseProfileDoc;
                onAuth(docToProfile(fbUser.uid, d));
            } else {
                const newDoc = profileToDoc(base, provider);
                await setDoc(ref, newDoc);
                onAuth(docToProfile(fbUser.uid, newDoc));
            }
        } catch (e) {
            // Offline or rules error — fall back to the auth-derived profile
            onAuth(base);
            onError?.(e instanceof Error ? e : new Error(String(e)));
        }
        // Keep the profile in live sync so cross-device updates appear instantly
        profileUnsub?.();
        profileUnsub = onSnapshot(
            ref,
            (s) => {
                if (s.exists()) onAuth(docToProfile(fbUser.uid, s.data() as FirebaseProfileDoc));
            },
            () => {
                /* listener errors are non-fatal; auth state still drives the session */
            }
        );
    };

    return onAuthStateChanged(
        auth,
        async (fbUser) => {
            if (fbUser) {
                await loadProfile(fbUser);
            } else {
                profileUnsub?.();
                profileUnsub = undefined;
                onAuth(null);
            }
        },
        (e) => onError?.(e)
    );
}

export async function signInEmail(auth: Auth, email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

export async function signUpEmail(
    auth: Auth,
    email: string,
    password: string,
    profile: Partial<Profile> & { firstName: string; lastName: string }
): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fbUpdateProfile(cred.user, {
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
    });
    const base = emailToBaseProfile(email);
    const merged: Profile = {
        ...base,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role ?? base.role,
        department: profile.department ?? base.department,
        rollNumber: profile.rollNumber,
        employeeId: profile.employeeId,
        semester: profile.semester,
        section: profile.section,
        phone: profile.phone,
    };
    await setDoc(doc(db, 'users', email), profileToDoc(merged));
    return cred.user;
}

export async function signInGoogle(auth: Auth): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    // Create / refresh the profile doc after Google sign-in
    const emailKey = cred.user.email ?? cred.user.uid;
    const ref = doc(db, 'users', emailKey);
    const snap = await getDoc(ref);
    const isStaff = isStaffEmail(cred.user.email ?? '');
    if (!snap.exists()) {
        const base = emailToBaseProfile(cred.user.email ?? '', 'google');
        const fullName = (cred.user.displayName ?? '').split(' ');
        const merged: Profile = {
            ...base,
            firstName: fullName[0] || base.firstName,
            lastName: fullName.slice(1).join(' ') || base.lastName,
            role: isStaff ? 'teacher' : base.role,
        };
        await setDoc(ref, profileToDoc(merged, 'google'));
    }
    return cred.user;
}

export async function signOutUser(auth: Auth): Promise<void> {
    await signOut(auth);
}

export async function patchProfile(db: Firestore, uid: string, patch: Partial<Profile>): Promise<void> {
    const ref = doc(db, 'users', uid);
    const keys = Object.keys(patch) as (keyof Profile)[];
    const data: Record<string, unknown> = {};
    for (const k of keys) data[k] = patch[k];
    await updateDoc(ref, data);
}
