"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchStore } from '../stores/searchStore';
import { products } from '../lib/mockData';
import { Product } from '../lib/types';
import Link from 'next/link';
import { formatPrice } from '../lib/utils';
import { VoiceSearch } from './VoiceSearch';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SearchBar() {
    const { query, setQuery, suggestions, setSuggestions } = useSearchStore();
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search function
    const searchProducts = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const filtered = products
                .filter((product) =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 5);

            setSuggestions(filtered);
            setIsLoading(false);
        }, 300);
    }, [setSuggestions]);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchProducts]);

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
    };

    const handleVoiceResult = (transcript: string) => {
        setQuery(transcript);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-24 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    )}

                    {query && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            onClick={handleClear}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    )}

                    <VoiceSearch onResult={handleVoiceResult} />
                </div>
            </div>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
                {isFocused && (query || suggestions.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                        {suggestions.length > 0 ? (
                            <div className="py-2">
                                {suggestions.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="block"
                                    >
                                        <motion.div
                                            whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                                            className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                <ImageWithFallback
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                            </div>
                                            <div className="text-primary font-semibold">
                                                {formatPrice(product.price)}
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        ) : query && !isLoading ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                No products found for "{query}"
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
