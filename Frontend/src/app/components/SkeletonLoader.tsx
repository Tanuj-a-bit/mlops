import { motion } from 'motion/react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <motion.div
            animate={{
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className={`bg-muted rounded ${className}`}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm h-full">
            {/* Image skeleton */}
            <Skeleton className="aspect-square w-full" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-28" />
            </div>
        </div>
    );
}

export function ProductListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="aspect-square rounded-2xl overflow-hidden">
            <Skeleton className="w-full h-full" />
        </div>
    );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CategorySkeleton key={i} />
            ))}
        </div>
    );
}
