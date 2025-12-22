import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role
    const { pathname } = req.nextUrl

    // Protected Routes
    const isAdminRoute = pathname.startsWith("/admin")
    const isSellerRoute = pathname.startsWith("/seller")
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register")

    if (isAuthRoute) {
        if (isLoggedIn) {
            if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", req.nextUrl))
            if (userRole === "SELLER") return NextResponse.redirect(new URL("/seller", req.nextUrl))
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (isAdminRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl))
        if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    if (isSellerRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl))
        if (userRole !== "SELLER" && userRole !== "ADMIN") return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
