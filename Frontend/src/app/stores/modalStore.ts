import { create } from 'zustand';
import { Product } from '../lib/types';

interface ModalState {
    quickViewProduct: Product | null;
    openQuickView: (product: Product) => void;
    closeQuickView: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    quickViewProduct: null,
    openQuickView: (product) => set({ quickViewProduct: product }),
    closeQuickView: () => set({ quickViewProduct: null }),
}));
