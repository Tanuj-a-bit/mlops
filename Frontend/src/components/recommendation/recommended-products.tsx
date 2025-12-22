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
                    const url = `http://localhost:8000/api/v1/recommendations/?${params.toString()}`;
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
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                    <div key={product.itemid} className="border rounded-lg p-4 hover:shadow-lg transition bg-white">
                        <div className="aspect-square bg-gray-200 rounded mb-2 overflow-hidden relative">
                            {/* Placeholder image since we don't have the full product data here, or we fetch it */}
                            <img
                                src={`https://images.unsplash.com/photo-${1500000000000 + product.itemid}?w=400&q=80`}
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h3 className="font-semibold text-sm truncate" title={product.name}>{product.name}</h3>
                        <p className="text-xs text-gray-500">Category: {product.categoryid}</p>
                        <div className="mt-2 text-blue-600 font-medium text-sm">View Product</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
