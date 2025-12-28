"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../lib/types';

interface CartFlyInContextType {
    triggerFlyIn: (product: Product, sourceRect: DOMRect) => void;
}

const CartFlyInContext = createContext<CartFlyInContextType | undefined>(undefined);

export function useCartFlyIn() {
    const context = useContext(CartFlyInContext);
    if (!context) {
        throw new Error('useCartFlyIn must be used within CartFlyInProvider');
    }
    return context;
}

interface FlyingItem {
    id: string;
    product: Product;
    startX: number;
    startY: number;
}

export function CartFlyInProvider({ children }: { children: React.ReactNode }) {
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    const triggerFlyIn = useCallback((product: Product, sourceRect: DOMRect) => {
        const cartIcon = document.querySelector('[data-cart-icon]');
        if (!cartIcon) return;

        const flyingItem: FlyingItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            startX: sourceRect.left + sourceRect.width / 2,
            startY: sourceRect.top + sourceRect.height / 2,
        };

        setFlyingItems((prev) => [...prev, flyingItem]);

        // Remove after animation completes
        setTimeout(() => {
            setFlyingItems((prev) => prev.filter((item) => item.id !== flyingItem.id));
        }, 1000);
    }, []);

    return (
        <CartFlyInContext.Provider value={{ triggerFlyIn }}>
            {children}
            <AnimatePresence>
                {flyingItems.map((item) => {
                    const cartIcon = document.querySelector('[data-cart-icon]');
                    const cartRect = cartIcon?.getBoundingClientRect();

                    return (
                        <motion.div
                            key={item.id}
                            initial={{
                                position: 'fixed',
                                left: item.startX,
                                top: item.startY,
                                width: 80,
                                height: 80,
                                zIndex: 9999,
                                opacity: 1,
                            }}
                            animate={{
                                left: cartRect ? cartRect.left + cartRect.width / 2 : item.startX,
                                top: cartRect ? cartRect.top + cartRect.height / 2 : item.startY,
                                width: 20,
                                height: 20,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.43, 0.13, 0.23, 0.96],
                            }}
                            className="pointer-events-none"
                        >
                            <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg shadow-xl"
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </CartFlyInContext.Provider>
    );
}
