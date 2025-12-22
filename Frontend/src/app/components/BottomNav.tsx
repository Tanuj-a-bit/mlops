"use client";

import { Home, Package, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useCartStore } from '../stores/cartStore';
import { Badge } from './ui/badge';

export function BottomNav() {
    const pathname = usePathname();
    const totalItems = useCartStore((state) => state.getTotalItems());

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/products', icon: Package, label: 'Products' },
        { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
            <div className="flex items-center justify-around py-2">
                {navItems.map(({ href, icon: Icon, label, badge }) => {
                    const isActive = pathname === href;

                    return (
                        <Link key={href} href={href} className="flex-1">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-1 py-2"
                            >
                                <div className="relative">
                                    <Icon
                                        className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                                    />
                                    {badge !== undefined && badge > 0 && (
                                        <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                                            {badge}
                                        </Badge>
                                    )}
                                </div>
                                <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                    {label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
