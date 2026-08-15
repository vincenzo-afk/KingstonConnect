/**
 * useFirestoreCollection — generic realtime Firestore sync hook
 *
 * Bridges a collection in Firestore to React state so every one of the
 * ~2000 members sees live updates. Mutations (add/update/remove) write to
 * Firestore first (optimistic UI is handled by the caller's state) and the
 * onSnapshot listener authoritative-refreshes the local state.
 *
 * Usage:
 *   const [items, setItems, mutate] = useFirestoreCollection<NoteItem>('notes');
 *
 * Fails closed to offline: if Firebase is unreachable, the page works with
 * localStorage like before.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type FirestoreId = string; // Firestore doc id

export interface FirestoreItem {
    id: string; // app-side id (kept in the doc as `docId` too)
    [key: string]: unknown;
}

const LS_PREFIX = 'kingston-offline-';

function loadOffline<T>(collectionName: string, fallback: T[]): T[] {
    try {
        const raw = localStorage.getItem(LS_PREFIX + collectionName);
        if (!raw) return fallback;
        return JSON.parse(raw) as T[];
    } catch {
        return fallback;
    }
}

function saveOffline<T>(collectionName: string, items: T[]): void {
    try {
        localStorage.setItem(LS_PREFIX + collectionName, JSON.stringify(items));
    } catch {
        /* quota errors are non-fatal */
    }
}

export function useFirestoreCollection<T extends { id: string }>(
    collectionName: string,
    fallback: T[] = [],
    opts: { idField?: string } = {}
) {
    const idField = opts.idField ?? 'id';
    const [items, setItems] = useState<T[]>(() => loadOffline<T>(collectionName, fallback));
    const latestRef = useRef<T[]>(items);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        let unsub: Unsubscribe | undefined;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        // Try Firestore. If the query throws (offline / misconfig), stay on
        // the localStorage fallback.
        try {
            unsub = onSnapshot(
                query(collection(db, collectionName), orderBy('createdAt', 'desc')),
                (snap) => {
                    const next = snap.docs.map((d) => {
                        const data = d.data() as Record<string, unknown>;
                        return { ...(data as Omit<T, 'id'>), id: String(d.id) } as T;
                    });
                    if (!mountedRef.current) return;
                    setItems(next);
                    latestRef.current = next;
                    saveOffline(collectionName, next);
                },
                () => {
                    /* listener errors → keep the offline cache */
                }
            );
        } catch {
            /* db unavailable → offline mode */
        }

        return () => {
            mountedRef.current = false;
            unsub?.();
            if (timeout) clearTimeout(timeout);
        };
    }, [collectionName]);

    const add = useCallback(
        async (item: Omit<T, 'id'>): Promise<T | undefined> => {
            const providedId = (item as unknown as Record<string, unknown>)[idField] as string | undefined;
            const withId = { ...item, [idField]: providedId ?? crypto.randomUUID() } as unknown as T & Record<string, unknown>;
            // Optimistic local update
            const next = [withId as unknown as T, ...latestRef.current];
            setItems(next);
            latestRef.current = next;
            saveOffline(collectionName, next);
            try {
                const docRef = await addDoc(collection(db, collectionName), {
                    ...withId,
                    createdAt: Date.now(),
                });
                // Re-key with the real Firestore id so updates/deletes match
                const rekeyed = { ...(withId as Record<string, unknown>), id: docRef.id } as unknown as T;
                const refreshed = latestRef.current.map((i) => (i.id === withId.id ? rekeyed : i));
                setItems(refreshed);
                latestRef.current = refreshed;
                saveOffline(collectionName, refreshed);
                return rekeyed;
            } catch (e) {
                console.warn(`Firestore add failed for ${collectionName}, staying offline`, e);
                return undefined;
            }
        },
        [collectionName, idField]
    );

    const update = useCallback(
        async (id: string, patch: Partial<T>): Promise<void> => {
            const idx = latestRef.current.findIndex((i) => i.id === id);
            if (idx === -1) return;
            const next = latestRef.current.map((i, j) => (j === idx ? ({ ...i, ...patch } as T) : i));
            setItems(next);
            latestRef.current = next;
            saveOffline(collectionName, next);
            try {
                await updateDoc(doc(db, collectionName, id), {
                    ...patch,
                    updatedAt: Date.now(),
                } as Record<string, unknown>);
            } catch (e) {
                console.warn(`Firestore update failed for ${collectionName}/${id}, staying offline`, e);
            }
        },
        [collectionName]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            const next = latestRef.current.filter((i) => i.id !== id);
            setItems(next);
            latestRef.current = next;
            saveOffline(collectionName, next);
            try {
                await deleteDoc(doc(db, collectionName, id));
            } catch (e) {
                console.warn(`Firestore delete failed for ${collectionName}/${id}, staying offline`, e);
            }
        },
        [collectionName]
    );

    return [items, setItems, { add, update, remove }] as const;
}
