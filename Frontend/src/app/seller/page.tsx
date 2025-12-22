import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function SellerDashboard() {
    const session = await auth()

    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
        redirect("/")
    }

    // Fetch seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: Number(session.user.id) }
    })

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-lg mb-2">Welcome, {session.user.name ?? "Partner"}!</p>
                <p className="text-gray-600 mb-4">Role: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{session.user.role}</span></p>

                {sellerProfile ? (
                    <div className="bg-gray-50 p-4 rounded border">
                        <h3 className="font-bold text-gray-800">Store Details</h3>
                        <p>Store Name: {sellerProfile.storeName}</p>
                        <p>Description: {sellerProfile.description}</p>
                    </div>
                ) : (
                    <p className="text-yellow-600">No seller profile found. Please contact support.</p>
                )}
            </div>
        </div>
    )
}
