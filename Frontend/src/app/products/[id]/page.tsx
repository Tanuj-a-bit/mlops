"use client";

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../lib/types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore';
import { motion } from 'motion/react';
import {
    Star,
    ShoppingCart,
    Heart,
    ChevronLeft,
    Truck,
    ShieldCheck,
    RotateCcw,
    Share2
} from 'lucide-react';
import { ProductGallery } from '../../components/ProductGallery';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ProductCard } from '../../components/ProductCard';
import { RecommendedProducts } from '@/components/recommendation/recommended-products';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const addRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.error) {
                    setProduct(null);
                } else {
                    setProduct(data);
                    // Fetch related products
                    const relRes = await fetch(`/api/products?category=${data.category.name}`);
                    const relData = await relRes.json();
                    setRelatedProducts(relData.filter((p: Product) => p.id !== data.id).slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const isWishlisted = useMemo(() => product ? isInWishlist(product.id) : false, [product, wishlistItems, isInWishlist]);

    useEffect(() => {
        if (product) {
            addRecentlyViewed(product);
        }
    }, [product, addRecentlyViewed]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 bg-muted rounded w-1/4 mx-auto" />
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="aspect-square bg-muted rounded-2xl" />
                        <div className="space-y-4">
                            <div className="h-12 bg-muted rounded w-3/4" />
                            <div className="h-6 bg-muted rounded w-1/2" />
                            <div className="h-24 bg-muted rounded w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push('/products')}>Back to Products</Button>
            </div>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
    };

    // Create a mock image gallery for demonstration
    const images = [product.image, product.image, product.image, product.image];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Breadcrumbs / Back Button */}
            <div className="container mx-auto px-4 py-6">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:gap-3 transition-all p-0"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to browsing
                </Button>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Side: Image Gallery */}
                    <div className="relative">
                        <ProductGallery images={images} name={product.name} />
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-full shadow-lg h-10 w-10"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isWishlisted) {
                                        removeFromWishlist(product.id);
                                    } else {
                                        addToWishlist(product);
                                    }
                                }}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-10 w-10">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="outline" className="rounded-full px-4">{product.category.name}</Badge>
                                {product.isBestseller && (
                                    <Badge className="bg-primary text-primary-foreground rounded-full px-4 text-xs font-bold uppercase tracking-wider">
                                        Bestseller
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="ml-2 font-medium">{product.rating}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-muted-foreground font-medium">
                                    {(product.reviewCount || product.reviews || 0).toLocaleString()} verified reviews
                                </span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-4xl font-bold text-primary">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <>
                                        <span className="text-2xl text-muted-foreground line-through font-light">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                        <Badge variant="destructive" className="text-sm font-bold">
                                            SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                        </Badge>
                                    </>
                                )}
                            </div>

                            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                {product.description}
                            </p>
                        </div>

                        <Separator className="mb-8" />

                        {/* Selection Options */}
                        <div className="space-y-8 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-border rounded-full overflow-hidden bg-muted/50 p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors rounded-full"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors rounded-full"
                                    >
                                        +
                                    </button>
                                </div>
                                <Button
                                    size="lg"
                                    className="flex-1 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                                    disabled={!product.inStock}
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="w-6 h-6 mr-3" />
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-muted/30 border border-border mb-10">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Truck className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Fast Global Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Secure Payments</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <RotateCcw className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">30-Day Returns</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Product Tabs */}
                <section className="mt-20">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-14 p-0">
                            <TabsTrigger
                                value="description"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full px-8 text-lg"
                            >
                                Description
                            </TabsTrigger>
                            <TabsTrigger
                                value="specifications"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full px-8 text-lg"
                            >
                                Specifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full px-8 text-lg"
                            >
                                Reviews ({product.reviewCount || product.reviews || 0})
                            </TabsTrigger>
                        </TabsList>
                        <div className="py-10">
                            <TabsContent value="description" className="mt-0">
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <p className="text-muted-foreground text-lg leading-loose">
                                        {product.description}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                    </p>
                                </div>
                            </TabsContent>
                            <TabsContent value="specifications" className="mt-0">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {Object.entries(JSON.parse(product.properties || '{}')).map(([key, value]) => (
                                        <div key={key} className="flex justify-between p-4 rounded-xl bg-muted/20 border border-border">
                                            <span className="font-medium text-muted-foreground">{key}</span>
                                            <span className="font-semibold">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-0">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-bold">Verified Customer Reviews</h3>
                                        <Button>Write a Review</Button>
                                    </div>
                                    {/* Mock reviews */}
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-8 rounded-3xl bg-muted/20 border border-border">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                                                        {['A', 'J', 'S'][i - 1]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{['Alex M.', 'Jordan K.', 'Sarah L.'][i - 1]}</p>
                                                        <p className="text-sm text-muted-foreground">March {10 + i}, 2024</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Fantastic product! Exceeded my expectations in every way. The quality is top-notch and it arrived much faster than expected. Highly recommended to anyone looking for premium quality.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </section>


                {/* AI Recommendations */}
                <section className="mt-20">
                    <RecommendedProducts itemId={Number(id)} />
                </section>

                {/* Related Products */}
                <section className="mt-20">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold">You may also like</h2>
                        <Button variant="ghost" className="hover:gap-2 transition-all">
                            View All <ShoppingCart className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
