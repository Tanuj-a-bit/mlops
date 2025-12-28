"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../stores/cartStore';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShoppingCart,
    X,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    ShoppingBag
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollArea } from './ui/scroll-area';

interface CartDrawerProps {
    children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
    const [open, setOpen] = useState(false);
    const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

    const subtotal = getTotalPrice();
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                        <ShoppingBag className="w-6 h-6" />
                        Shopping Cart
                        {getTotalItems() > 0 && (
                            <Badge className="ml-2">{getTotalItems()} items</Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        {items.length === 0
                            ? "Your cart is empty. Start shopping to add items!"
                            : "Review your items and proceed to checkout"}
                    </SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-xs">
                            Looks like you haven't added any items yet. Start shopping to fill it up!
                        </p>
                        <Button onClick={() => setOpen(false)} asChild>
                            <Link href="/products">
                                Browse Products
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <ScrollArea className="flex-1 -mx-6 px-6 my-6">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex gap-4 py-4 border-b border-border last:border-0"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <ImageWithFallback
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/products/${item.id}`}
                                                onClick={() => setOpen(false)}
                                                className="hover:text-primary transition-colors"
                                            >
                                                <h4 className="font-medium line-clamp-1 mb-1">{item.name}</h4>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {formatPrice(item.price)} each
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-10 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </ScrollArea>

                        {/* Cart Summary */}
                        <div className="border-t border-border pt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span className="font-medium">{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600 font-semibold">FREE</span>
                                        ) : (
                                            formatPrice(shipping)
                                        )}
                                    </span>
                                </div>
                                {shipping > 0 && subtotal < 50 && (
                                    <p className="text-xs text-muted-foreground italic">
                                        Add {formatPrice(50 - subtotal)} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(total)}
                                </span>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-semibold"
                                asChild
                                onClick={() => setOpen(false)}
                            >
                                <Link href="/checkout">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setOpen(false)}
                                asChild
                            >
                                <Link href="/products">
                                    Continue Shopping
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
