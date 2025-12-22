"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';
import {
    Filter,
    ChevronDown,
    LayoutGrid,
    List,
    X,
    SlidersHorizontal
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
    const [sortBy, setSortBy] = useState<string>('featured');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [displayLimit, setDisplayLimit] = useState(6);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    // Reset display limit when filters change
    useEffect(() => {
        setDisplayLimit(6);
    }, [selectedCategory, priceRange, sortBy, selectedRatings]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory || (typeof product.category === 'object' && product.category.slug === selectedCategory);
                const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
                const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(Math.floor(product.rating));
                return categoryMatch && priceMatch && ratingMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'rating':
                        return b.rating - a.rating;
                    case 'newest':
                    default:
                        return 0;
                }
            });
    }, [selectedCategory, priceRange, sortBy, selectedRatings, products]);

    const displayedProducts = useMemo(() =>
        filteredProducts.slice(0, displayLimit),
        [filteredProducts, displayLimit]);

    const loadMore = useCallback(() => {
        if (isMoreLoading) return;
        setIsMoreLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setDisplayLimit(prev => prev + 6);
            setIsMoreLoading(false);
        }, 800);
    }, [isMoreLoading]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && filteredProducts.length > displayLimit) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, filteredProducts.length, displayLimit, loadMore]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);
                const prods = await prodRes.json();
                const cats = await catRes.json();
                setProducts(prods);
                setCategories(cats);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleRating = (rating: number) => {
        setSelectedRatings(prev =>
            prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
        );
    };

    const FilterSidebar = () => (
        <div className="space-y-8">
            {/* Categories */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === 'all'
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-accent'
                            }`}
                    >
                        All Products
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.slug
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'hover:bg-accent'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Price Range</h3>
                    <span className="text-sm font-medium text-primary">
                        ${priceRange[0]} - ${priceRange[1]}
                    </span>
                </div>
                <Slider
                    defaultValue={[0, 2000]}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-6"
                />
            </div>

            {/* Ratings */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Customer Rating</h3>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                            <Checkbox
                                id={`rating-${rating}`}
                                checked={selectedRatings.includes(rating)}
                                onCheckedChange={() => toggleRating(rating)}
                            />
                            <label
                                htmlFor={`rating-${rating}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                            >
                                {rating} Stars & Up
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 2000]);
                    setSelectedRatings([]);
                    setSortBy('featured');
                }}
            >
                Reset Filters
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Our Products</h1>
                    <p className="text-muted-foreground">
                        {loading ? 'Loading...' : `Showing ${filteredProducts.length} results for ${selectedCategory === 'all' ? 'all categories' : selectedCategory}`}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-muted/20 rounded-2xl border border-border">
                            <div className="flex items-center gap-2">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4" />
                                            Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                        <SheetHeader>
                                            <SheetTitle>Filters</SheetTitle>
                                            <SheetDescription>
                                                Narrow down your search
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-8">
                                            <FilterSidebar />
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <div className="flex items-center bg-background rounded-lg border border-border p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden md:inline">Sort by:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="rating">Avg. Customer Rating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <motion.div
                                layout
                                className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}
                            >
                                <AnimatePresence mode="popLayout">
                                    {displayedProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            ref={index === displayedProducts.length - 1 ? lastProductRef : null}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isMoreLoading && (
                                    <>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={`skeleton-${i}`} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                                        ))}
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
                                <Button onClick={() => {
                                    setSelectedCategory('all');
                                    setPriceRange([0, 2000]);
                                    setSelectedRatings([]);
                                }}>
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
