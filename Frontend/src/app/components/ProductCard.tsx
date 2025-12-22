"use client";

import Link from 'next/link';
import { Product } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useModalStore } from '../stores/modalStore';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useCartFlyIn } from './CartFlyIn';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { triggerFlyIn } = useCartFlyIn();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const openQuickView = useModalStore((state) => state.openQuickView);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Get the product image element position
    const target = e.currentTarget as HTMLElement;
    const card = target.closest('[data-product-card]') as HTMLElement;
    const imageElement = card?.querySelector('img');

    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      triggerFlyIn(product, rect);
    }

    // Small delay to show animation before updating cart
    setTimeout(() => {
      addItem(product);
    }, 100);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickView(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="block">
      <motion.div
        whileHover={{ y: -8 }}
        className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full"
        data-product-card
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{product.discount}%
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-primary text-primary-foreground">
                Bestseller
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <motion.div
              animate={{
                scale: isWishlisted ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'
                  }`}
              />
            </motion.div>
          </motion.button>

          {/* Quick View Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickView}
            className="absolute top-14 right-3 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-5 h-5 text-foreground" />
          </motion.button>

          {/* Quick Add to Cart */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="absolute bottom-3 left-3 right-3 bg-primary text-primary-foreground py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {typeof product.category === 'string' ? product.category : product.category.name}
          </p>

          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 min-h-[3em]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || product.reviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <p className="text-sm text-destructive mt-2">Out of Stock</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
