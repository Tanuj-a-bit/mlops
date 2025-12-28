import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";
import { CartFlyInProvider } from "./components/CartFlyIn";
import { BottomNav } from "./components/BottomNav";
import { RecentlyViewedSidebar } from "./components/RecentlyViewedSidebar";
import { ModalProvider } from "./components/ModalProvider";
import { Providers } from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Modern E-Commerce Store",
    description: "Premium E-commerce platform with advanced features",
    manifest: "/manifest.json",
    themeColor: "#3b82f6",
    viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "E-Shop",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <ThemeProvider>
                        <CartFlyInProvider>
                            <Header />
                            {children}
                            <Footer />
                            <BottomNav />
                            <RecentlyViewedSidebar />
                            <ModalProvider />
                        </CartFlyInProvider>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
