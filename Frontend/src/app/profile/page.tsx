"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { User, LogOut, Package, Heart, Settings, Bell, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse text-2xl font-bold">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect in useEffect
    }

    const sections = [
        { icon: Package, label: "My Orders", path: "/orders" },
        { icon: Heart, label: "Wishlist", path: "/wishlist" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <div className="min-h-screen bg-muted/30 pt-20 pb-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-8 bg-background p-6 rounded-2xl shadow-sm border border-border">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{session.user?.name || "User"}</h1>
                            <p className="text-muted-foreground">{session.user?.email}</p>
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                {session.user?.role || "Customer"} Account
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm text-muted-foreground">Orders Placed</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-sm text-muted-foreground">Saved Items</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Navigation Items */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-1">
                            {sections.map(({ icon: Icon, label, path }) => (
                                <button
                                    key={label}
                                    onClick={() => router.push(path)}
                                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background">
                                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Logout Button */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button
                            variant="destructive"
                            className="w-full py-6 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="w-6 h-6" />
                            Log Out
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
