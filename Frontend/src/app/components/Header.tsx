"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu, Heart, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { SearchBar } from './SearchBar';

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ShopHub
            </h1>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center hover:bg-accent relative"
            >
              <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {wishlistItems.length}
                </Badge>
              )}
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center hover:bg-accent"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
            </motion.button>

            {/* User Account */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex w-10 h-10 rounded-lg items-center justify-center hover:bg-accent"
            >
              <User className="w-5 h-5" />
            </motion.button>


            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent"
              data-cart-icon
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                  {totalItems}
                </Badge>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-border">
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Deals
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            New Arrivals
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Electronics
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Fashion
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Home & Garden
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Sports
          </Link>
        </nav>
      </div>
    </header>
  );
}
