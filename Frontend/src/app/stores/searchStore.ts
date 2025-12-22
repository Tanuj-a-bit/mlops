import { create } from 'zustand';
import { Product } from '../lib/types';

interface SearchStore {
    query: string;
    suggestions: Product[];
    isListening: boolean;
    setQuery: (query: string) => void;
    setSuggestions: (suggestions: Product[]) => void;
    setIsListening: (isListening: boolean) => void;
    clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>()((set) => ({
    query: '',
    suggestions: [],
    isListening: false,

    setQuery: (query: string) => {
        set({ query });
    },

    setSuggestions: (suggestions: Product[]) => {
        set({ suggestions });
    },

    setIsListening: (isListening: boolean) => {
        set({ isListening });
    },

    clearSearch: () => {
        set({ query: '', suggestions: [] });
    },
}));
