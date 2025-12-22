import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-lg mb-2">Welcome back, {session.user.name ?? "Admin"}!</p>
                <p className="text-gray-600">Role: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{session.user.role}</span></p>
                <p className="text-gray-600">UserID: {session.user.id}</p>
                <div className="mt-8 border-t pt-4">
                    <p className="text-sm text-gray-500">System Status: Operational</p>
                    {/* Add admin controls here */}
                </div>
            </div>
        </div>
    )
}
