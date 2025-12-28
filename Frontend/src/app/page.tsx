"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from './components/ProductCard';
import { Product, Category } from './lib/types';
import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { ArrowRight, Truck, Shield, CreditCard, HeadphonesIcon } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();
    const { scrollY } = useScroll();
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [bestsellers, setBestsellers] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch for basic data
                const [prodRes, catRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);
                const prods = await prodRes.json();
                const cats = await catRes.json();

                setCategories(Array.isArray(cats) ? cats.slice(0, 6) : []);
                setBestsellers(Array.isArray(prods) ? prods.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, 8) : []);

                // If user is logged in, fetch PERSONALIZED recommendations for "Featured Products"
                if (session?.user?.id) {
                    try {
                        console.log('Fetching recommendations for user:', session.user.id);
                        // Use local proxy API to avoid CORS/Network issues
                        const recRes = await fetch(`/api/recommendations/?user_id=${session.user.id}&limit=8`);
                        if (recRes.ok) {
                            const recs = await recRes.json();
                            console.log('Received recommendations:', recs);
                            if (Array.isArray(recs) && recs.length > 0) {
                                // Map recommendation items to full Product objects
                                const recProducts: Product[] = recs.map((r: any) => ({
                                    id: r.itemid,
                                    name: r.name,
                                    description: `Recommended specifically for you based on your browsing history.`,
                                    price: (r.itemid % 100) + 29.99, // Mock price
                                    image: `https://images.unsplash.com/photo-${1500000000000 + r.itemid}?w=400&q=80`,
                                    category: r.categoryid || "Recommended",
                                    rating: 4.8,
                                    reviewCount: 120,
                                    inStock: true,
                                    isFeatured: true
                                }));
                                setFeaturedProducts(recProducts);
                                return;
                            }
                        } else {
                            console.warn('Recommendation API returned non-OK status:', recRes.status);
                        }
                    } catch (err) {
                        console.warn('Could not fetch recommendations (using fallback):', err);
                    }
                    // Fallback inside the if block if fetch/try failed
                    setFeaturedProducts(Array.isArray(prods) ? prods.slice(0, 8) : []);
                } else {
                    // Not logged in: Show generic featured products
                    setFeaturedProducts(Array.isArray(prods) ? prods.slice(0, 8) : []);
                }


            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    // Parallax effect: background moves slower than foreground
    const heroY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section with Parallax */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20">
                {/* Parallax Background Layer */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{ y: heroY, opacity: heroOpacity }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                </motion.div>

                <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                New Season Collection
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                Discover Your
                                <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Perfect Style
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Shop the latest trends with exclusive deals up to 50% off. Free shipping on orders over $50.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/products">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        Shop Now
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </Link>
                                <Link href="/products">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 rounded-full border-2 border-primary text-primary font-medium"
                                    >
                                        View Deals
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1758467700917-3517eb11ec8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMGVsZWN0cm9uaWNzJTIwbW9kZXJufGVufDF8fHx8MTc2NjI1NDk0NHww&ixlib=rb-4.1.0&q=80&w=1080"
                                    alt="Hero"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            </div>
                            {/* Floating badges */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute top-8 right-8 px-6 py-4 rounded-2xl bg-background/90 backdrop-blur-lg shadow-xl"
                            >
                                <p className="text-sm text-muted-foreground">Up to</p>
                                <p className="text-4xl font-bold text-primary">50% OFF</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
                    <p className="text-xl text-muted-foreground">
                        Explore our wide range of products across different categories
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                        ))
                    ) : (
                        categories.map((category) => (
                            <Link key={category.id} href={`/products?category=${category.slug}`}>
                                <motion.div
                                    variants={item}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                                >
                                    <ImageWithFallback
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute inset-0 flex items-end p-4">
                                        <h3 className="text-white font-semibold">{category.name}</h3>
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </motion.div>
            </section>

            <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-accent/30 to-background rounded-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-2">
                        {session?.user?.id ? "Recommended For You" : "Featured Products"}
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        {session?.user?.id
                            ? "Personalized picks based on your style"
                            : "Hand-picked selection just for you"}
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth"
                >
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex-none w-[280px] sm:w-[320px] aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                        ))
                    ) : (
                        featuredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                variants={item}
                                className="flex-none w-[280px] sm:w-[320px]"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))
                    )}
                </motion.div>

                <div className="flex justify-center mt-4">
                    <Link href={session?.user?.id ? "/recommendations" : "/products"}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-primary font-medium px-6 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors"
                        >
                            {session?.user?.id ? "View More Recommendations" : "View All Featured"}
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </div>
            </section>

            {/* Promotional Banner */}
            <section className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="relative h-96">
                        <ImageWithFallback
                            src="https://images.unsplash.com/photo-1711086316387-5f42369d06ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBmYXNoaW9uJTIwc3RvcmV8ZW58MXx8fHwxNzY2MjU0OTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Promo"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                        <div className="absolute inset-0 flex items-center">
                            <div className="container mx-auto px-12">
                                <div className="max-w-xl">
                                    <h2 className="text-5xl font-bold text-white mb-4">
                                        Summer Sale
                                    </h2>
                                    <p className="text-xl text-white/90 mb-6">
                                        Get ready for the hottest deals of the season. Up to 70% off on selected items.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 rounded-full bg-white text-black font-medium"
                                    >
                                        Shop the Sale
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Bestsellers */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Bestsellers</h2>
                    <p className="text-xl text-muted-foreground">
                        Most popular products loved by our customers
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth"
                >
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex-none w-[280px] sm:w-[320px] aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                        ))
                    ) : (
                        bestsellers.map((product) => (
                            <motion.div
                                key={product.id}
                                variants={item}
                                className="flex-none w-[280px] sm:w-[320px]"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </section>

            {/* Features/Benefits */}
            <section className="container mx-auto px-4 py-16">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {[
                        {
                            icon: Truck,
                            title: 'Free Shipping',
                            description: 'On orders over $50',
                        },
                        {
                            icon: Shield,
                            title: 'Secure Payment',
                            description: '100% secure transactions',
                        },
                        {
                            icon: CreditCard,
                            title: 'Easy Returns',
                            description: '30-day return policy',
                        },
                        {
                            icon: HeadphonesIcon,
                            title: '24/7 Support',
                            description: 'Dedicated customer service',
                        },
                    ].map(({ icon: Icon, title, description }) => (
                        <motion.div
                            key={title}
                            variants={item}
                            whileHover={{ y: -5 }}
                            className="text-center p-8 rounded-2xl bg-card border border-border"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </main>
    );
}
