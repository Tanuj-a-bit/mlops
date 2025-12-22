import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { User as PrismaUser } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            email: string
            name?: string
            image?: string
        }
    }
}

async function getUser(email: string): Promise<PrismaUser | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user: any = await getUser(email)
                    if (!user) return null

                    // Check if password matches
                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = Number(user.id)
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.role = token.role as string
                session.user.id = String(token.id)
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
})
