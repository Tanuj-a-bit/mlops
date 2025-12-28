"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../stores/cartStore';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    CreditCard,
    Truck,
    Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [currentStep, setCurrentStep] = useState(1);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
    });

    const subtotal = getTotalPrice();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-8">
                        Add some items to your cart before checking out.
                    </p>
                    <Button size="lg" onClick={() => router.push('/products')}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStep(2);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStep(3);
    };

    const handlePlaceOrder = () => {
        // Simulate order placement
        const orderId = Math.random().toString(36).substring(2, 12).toUpperCase();
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}&total=${total.toFixed(2)}`);
    };

    const steps = [
        { number: 1, title: 'Shipping', icon: Truck },
        { number: 2, title: 'Payment', icon: CreditCard },
        { number: 3, title: 'Review', icon: Check },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Checkout</h1>

                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between max-w-2xl">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : isActive
                                                    ? 'border-primary text-primary'
                                                    : 'border-border text-muted-foreground'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span className={`mt-2 text-sm font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-primary' : 'bg-border'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Shipping Information */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="p-8">
                                        <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                                        <form onSubmit={handleShippingSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="fullName">Full Name *</Label>
                                                    <Input
                                                        id="fullName"
                                                        required
                                                        value={shippingInfo.fullName}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        value={shippingInfo.email}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="address">Street Address *</Label>
                                                <Input
                                                    id="address"
                                                    required
                                                    value={shippingInfo.address}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                    placeholder="123 Main St, Apt 4B"
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="city">City *</Label>
                                                    <Input
                                                        id="city"
                                                        required
                                                        value={shippingInfo.city}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="state">State *</Label>
                                                    <Input
                                                        id="state"
                                                        required
                                                        value={shippingInfo.state}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                                        placeholder="NY"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="zipCode">ZIP Code *</Label>
                                                    <Input
                                                        id="zipCode"
                                                        required
                                                        value={shippingInfo.zipCode}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                                                        placeholder="10001"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="country">Country</Label>
                                                <Select value={shippingInfo.country} onValueChange={(value) => setShippingInfo({ ...shippingInfo, country: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="United States">United States</SelectItem>
                                                        <SelectItem value="Canada">Canada</SelectItem>
                                                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-4">
                                                <Button type="submit" size="lg" className="min-w-[200px]">
                                                    Continue to Payment
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Step 2: Payment Information */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="p-8">
                                        <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                            <div>
                                                <Label htmlFor="cardNumber">Card Number *</Label>
                                                <Input
                                                    id="cardNumber"
                                                    required
                                                    value={paymentInfo.cardNumber}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="cardName">Cardholder Name *</Label>
                                                <Input
                                                    id="cardName"
                                                    required
                                                    value={paymentInfo.cardName}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        required
                                                        value={paymentInfo.expiryDate}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="cvv">CVV *</Label>
                                                    <Input
                                                        id="cvv"
                                                        required
                                                        value={paymentInfo.cvv}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                                                        placeholder="123"
                                                        maxLength={3}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between gap-4 pt-4">
                                                <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
                                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                                    Back
                                                </Button>
                                                <Button type="submit" size="lg" className="min-w-[200px]">
                                                    Review Order
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Step 3: Review Order */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Card className="p-8">
                                        <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="font-semibold mb-3">Shipping Address</h3>
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <p className="font-medium">{shippingInfo.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{shippingInfo.email}</p>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {shippingInfo.address}<br />
                                                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                                                        {shippingInfo.country}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-3">Payment Method</h3>
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <p className="font-medium">Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                                                    <p className="text-sm text-muted-foreground">{paymentInfo.cardName}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-4 pt-6">
                                            <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep(2)}>
                                                <ChevronLeft className="w-5 h-5 mr-2" />
                                                Back
                                            </Button>
                                            <Button size="lg" className="min-w-[200px]" onClick={handlePlaceOrder}>
                                                Place Order
                                                <Check className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <ImageWithFallback
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold whitespace-nowrap">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span className="font-medium">{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600 font-semibold">FREE</span>
                                        ) : (
                                            formatPrice(shipping)
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
