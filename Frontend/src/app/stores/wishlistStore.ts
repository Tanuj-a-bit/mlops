import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/types';

interface WishlistStore {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string | number) => void;
    isInWishlist: (productId: string | number) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product) => {
                set((state) => {
                    const exists = state.items.find((item) => item.id === product.id);
                    if (exists) {
                        return state;
                    }
                    return {
                        items: [...state.items, product],
                    };
                });
            },

            removeItem: (productId: string | number) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id.toString() !== productId.toString()),
                }));
            },

            isInWishlist: (productId: string | number) => {
                return get().items.some((item) => item.id.toString() === productId.toString());
            },

            clearWishlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
