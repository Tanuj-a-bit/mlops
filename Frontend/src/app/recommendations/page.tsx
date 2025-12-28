
"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/types';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RecommendationsPage() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session?.user?.id) return;

            setLoading(true);
            try {
                // Fetch a larger batch of recommendations
                const recRes = await fetch(`/api/recommendations/?user_id=${session.user.id}&limit=100`);
                if (recRes.ok) {
                    const recs = await recRes.json();
                    if (Array.isArray(recs)) {
                        const recProducts: Product[] = recs.map((r: any) => ({
                            id: r.itemid,
                            name: r.name,
                            description: `Recommended specifically for you based on your browsing history.`,
                            price: (r.itemid % 100) + 29.99, // Mock price
                            image: `https://images.unsplash.com/photo-${1500000000000 + r.itemid}?w=400&q=80`,
                            category: r.categoryid || "Recommended",
                            rating: 4.8,
                            reviewCount: 120,
                            inStock: true
                        }));
                        setProducts(recProducts);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchRecommendations();
        }
    }, [session]);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p className="mb-4">You need to be logged in to view your personalized recommendations.</p>
                    <Link href="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Recommended for You</h1>
                            <p className="text-muted-foreground">
                                Curated selections based on your unique style and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
                        <p className="text-muted-foreground">Start browsing products to get personalized suggestions!</p>
                        <Link href="/products" className="mt-4 inline-block">
                            <Button variant="outline">Browse Products</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
