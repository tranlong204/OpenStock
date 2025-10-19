'use client';

import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

const Header = ({ user }: { user: User }) => {
    const [initialStocks, setInitialStocks] = useState<StockWithWatchlistStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialStocks = async () => {
            try {
                const stocks = await apiClient.searchStocks();
                // Convert to StockWithWatchlistStatus format
                const stocksWithStatus = stocks.map(stock => ({
                    ...stock,
                    isInWatchlist: false // Will be updated by watchlist service
                }));
                setInitialStocks(stocksWithStatus);
            } catch (error) {
                console.error('Failed to fetch initial stocks:', error);
                setInitialStocks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialStocks();
    }, []);

    if (isLoading) {
        return (
            <header className="sticky top-0 header">
                <div className="container header-wrapper">
                    <Link href="/" className="flex items-center justify-center gap-2">
                        <Image
                            src="https://i.ibb.co/r28VWPjS/Screenshot-2025-10-04-123317-Picsart-Ai-Image-Enhancer-removebg-preview.png"
                            alt="OpenStock"
                            width={200}
                            height={50}
                        />
                    </Link>
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/" className="flex items-center justify-center gap-2">
                    <Image
                        src="https://i.ibb.co/r28VWPjS/Screenshot-2025-10-04-123317-Picsart-Ai-Image-Enhancer-removebg-preview.png"
                        alt="OpenStock"
                        width={200}
                        height={50}
                    />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems initialStocks={initialStocks}/>
                </nav>

                <UserDropdown user={user} initialStocks={initialStocks} />
            </div>
        </header>
    )
}
export default Header