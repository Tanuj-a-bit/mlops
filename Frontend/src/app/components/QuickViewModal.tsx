"use client";

import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { X, ShoppingCart, Heart, Star, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProductGallery } from './ProductGallery';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

interface QuickViewModalProps {
    product: Product | null;
    onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

    if (!product) return null;

    const isWishlisted = isInWishlist(String(product.id));

    const handleAddToCart = () => {
        addItem(product);
    };

    const handleToggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(String(product.id));
        } else {
            addToWishlist(product);
        }
    };

    return (
        <AnimatePresence>
            {product && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-border"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 rounded-full bg-background/50 backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                            <div className="space-y-4">
                                <ProductGallery images={[product.image, product.image]} name={product.name} />
                            </div>

                            <div className="flex flex-col">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="outline" className="rounded-full">{product.category}</Badge>
                                        {product.isBestseller && (
                                            <Badge className="bg-primary text-primary-foreground rounded-full px-3 text-[10px] font-bold uppercase">
                                                Bestseller
                                            </Badge>
                                        )}
                                    </div>

                                    <h2 className="text-3xl font-bold mb-2">{product.name}</h2>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-4 h-4 ${s <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-6">
                                        <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                                        {product.originalPrice && (
                                            <span className="text-xl text-muted-foreground line-through font-light">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-muted-foreground leading-relaxed mb-8 line-clamp-4">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="flex gap-4">
                                        <Button
                                            className="flex-1 h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/20"
                                            onClick={handleAddToCart}
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-3" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-14 w-14 rounded-full"
                                            onClick={handleToggleWishlist}
                                        >
                                            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                                        </Button>
                                    </div>

                                    <Button variant="ghost" className="w-full rounded-full" onClick={() => window.location.href = `/products/${product.id}`}>
                                        View Full Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
