import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/types';

interface RecentlyViewedStore {
    items: Product[];
    addProduct: (product: Product) => void;
    clearHistory: () => void;
}

const MAX_RECENT_ITEMS = 10;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
    persist(
        (set) => ({
            items: [],

            addProduct: (product: Product) => {
                set((state) => {
                    // Remove the product if it already exists
                    const filteredItems = state.items.filter((item) => item.id.toString() !== product.id.toString());

                    // Add to the beginning of the array
                    const newItems = [product, ...filteredItems];

                    // Keep only the last MAX_RECENT_ITEMS
                    return {
                        items: newItems.slice(0, MAX_RECENT_ITEMS),
                    };
                });
            },

            clearHistory: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'recently-viewed-storage',
        }
    )
);
