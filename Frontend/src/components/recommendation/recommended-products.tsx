'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
    itemid: number;
    name: string;
    categoryid: string;
}

interface RecommendedProductsProps {
    userId?: number;
    itemId?: number;
}

export function RecommendedProducts({ userId, itemId }: RecommendedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                const params = new URLSearchParams();
                if (userId) params.append('user_id', userId.toString());
                if (itemId) params.append('item_id', itemId.toString());
                if (userId || itemId) {
                    // Use local proxy API
                    const url = `/api/recommendations/?${params.toString()}`;
                    console.log('Fetching from backend:', url);
                    const res = await fetch(url);
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Failed to fetch recommendations: ${res.status} ${errorText}`);
                    }

                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                setError('Could not load recommendations');
                console.error('Recommendation fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        if (userId || itemId) {
            fetchRecommendations();
        }
    }, [userId, itemId]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading recommendations...</div>;
    if (error) return null; // Hide section on error
    if (products.length === 0) return null;

    return (
        <div className="my-12">
            <h2 className="text-3xl font-bold mb-8">{itemId ? "Similar Products" : "Recommended for You"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                    <Link key={product.itemid} href={`/products/${product.itemid}`}>
                        <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                            <div className="aspect-square bg-muted overflow-hidden relative">
                                <img
                                    src={`https://images.unsplash.com/photo-${1500000000000 + product.itemid}?w=400&q=80`}
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        ID: {product.itemid}
                                    </span>
                                    <div className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        View →
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
