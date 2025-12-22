"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Clock } from 'lucide-react';
import { useRecentlyViewedStore } from '../stores/recentlyViewedStore';
import Link from 'next/link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatPrice } from '../lib/utils';

export function RecentlyViewedSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, clearHistory } = useRecentlyViewedStore();

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-4 rounded-l-lg shadow-lg z-40 flex items-center gap-2"
            >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:inline">Recently Viewed</span>
                <ChevronRight className="w-4 h-4 lg:hidden" />
            </motion.button>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-semibold">Recently Viewed</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearHistory}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Clear All
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="p-4 space-y-3">
                                <AnimatePresence>
                                    {items.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={`/products/${product.id}`}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
                                                >
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                        <ImageWithFallback
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            {product.category}
                                                        </p>
                                                        <p className="text-primary font-semibold">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
