"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '../../lib/utils';
import { motion } from 'motion/react';
import {
    CheckCircle2,
    Package,
    Mail,
    ArrowRight,
    Download
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import confetti from 'canvas-confetti';

import { Suspense } from 'react';

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const total = searchParams.get('total');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Trigger confetti animation
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Get email from localStorage or use placeholder
        setEmail('customer@example.com');
    }, []);

    if (!orderId || !total) {
        if (typeof window !== 'undefined') {
            router.push('/');
        }
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                <Card className="p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </motion.div>

                    {/* Success Message */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Thank you for your purchase. Your order has been successfully placed.
                    </p>

                    {/* Order Details */}
                    <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                                <p className="text-lg font-mono font-bold">#{orderId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Order Total</p>
                                <p className="text-lg font-bold text-primary">{formatPrice(parseFloat(total))}</p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Confirmation Email</p>
                                <p className="text-sm">
                                    A confirmation email with order details has been sent to{' '}
                                    <span className="font-semibold">{email}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 text-left">
                        <div className="flex items-start gap-3 mb-4">
                            <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-1">What happens next?</h3>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                    <li>• You'll receive an email confirmation shortly</li>
                                    <li>• We'll send you tracking information once your order ships</li>
                                    <li>• Estimated delivery: 3-5 business days</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            onClick={() => router.push('/products')}
                            className="flex items-center gap-2"
                        >
                            Continue Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => alert('Download receipt (demo)')}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Receipt
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <p className="text-sm text-muted-foreground mt-8">
                        Need help? Contact our customer support at{' '}
                        <a href="mailto:support@shophub.com" className="text-primary hover:underline">
                            support@shophub.com
                        </a>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
