'use client';

import Header from "@/components/Header";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sign-in');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <main className="min-h-screen text-gray-400">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Loading...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect
    }

    return (
        <main className="min-h-screen text-gray-400">
            <Header user={user} />

            <div className="container py-10">
                {children}
            </div>

            <Footer />
        </main>
    )
}
export default Layout