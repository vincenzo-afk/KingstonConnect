import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// HOUSING STORE — wishlist + compare (max 3)
// =============================================================================

export interface HousingStore {
    wishlist: string[];        // listing ids
    compare: string[];         // listing ids, max 3
    toggleWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    toggleCompare: (id: string) => void;
    isInCompare: (id: string) => boolean;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    clearWishlist: () => void;
}

export const useHousingStore = create<HousingStore>()(
    persist(
        (set, get) => ({
            wishlist: [],
            compare: [],

            toggleWishlist: (id) =>
                set((state) => ({
                    wishlist: state.wishlist.includes(id)
                        ? state.wishlist.filter((w) => w !== id)
                        : [...state.wishlist, id],
                })),

            isInWishlist: (id) => get().wishlist.includes(id),

            toggleCompare: (id) =>
                set((state) => {
                    if (state.compare.includes(id)) {
                        return { compare: state.compare.filter((c) => c !== id) };
                    }
                    if (state.compare.length >= 3) {
                        // Replace the oldest entry
                        return { compare: [...state.compare.slice(1), id] };
                    }
                    return { compare: [...state.compare, id] };
                }),

            isInCompare: (id) => get().compare.includes(id),

            removeFromCompare: (id) =>
                set((state) => ({
                    compare: state.compare.filter((c) => c !== id),
                })),

            clearCompare: () => set({ compare: [] }),
            clearWishlist: () => set({ wishlist: [] }),
        }),
        {
            name: 'kingston-housing',
        }
    )
);

export default useHousingStore;
