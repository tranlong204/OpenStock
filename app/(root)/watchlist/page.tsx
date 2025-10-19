'use client';

import React, { useEffect, useState } from 'react';
import { apiClient, WatchlistItem } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import WatchlistButton from '@/components/WatchlistButton';
import { toast } from 'sonner';

const WatchlistPage = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchlist();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWatchlist = async () => {
        try {
            const items = await apiClient.getWatchlist();
            setWatchlist(items);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
            toast.error('Failed to load watchlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
        if (!isAdded) {
            // Remove from local state
            setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-100 mb-4">My Watchlist</h1>
                    <p className="text-gray-400">Please sign in to view your watchlist.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your watchlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-100 mb-8">My Watchlist</h1>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6B7280"
                            strokeWidth="1.5"
                            className="h-16 w-16 mx-auto"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">Your watchlist is empty</h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                        Start building your watchlist by searching for stocks and clicking the star icon to add them.
                    </p>
                    <a
                        href="/"
                        className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Browse Stocks
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-100">My Watchlist</h1>
                <span className="text-gray-400">{watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}</span>
            </div>

            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Symbol</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Company</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Added</th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {watchlist.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-100">{item.symbol}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-300">{item.company}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-400">
                                            {new Date(item.addedAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <WatchlistButton
                                                symbol={item.symbol}
                                                company={item.company}
                                                isInWatchlist={true}
                                                type="icon"
                                                onWatchlistChange={handleWatchlistChange}
                                            />
                                            <a
                                                href={`/stocks/${item.symbol}`}
                                                className="text-teal-500 hover:text-teal-400 text-sm font-medium"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WatchlistPage;
