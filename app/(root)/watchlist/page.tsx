'use client';

import React, { useEffect, useState } from 'react';
import { apiClient, WatchlistItem, StockPriceDto } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import WatchlistButton from '@/components/WatchlistButton';
import { toast } from 'sonner';

interface WatchlistItemWithPrice extends WatchlistItem {
    currentPrice?: number;
    changePercent?: number;
    change?: number;
    volume?: number;
    openPrice?: number;
    highPrice?: number;
    lowPrice?: number;
    previousClose?: number;
}

const WatchlistPage = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItemWithPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
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
            // Fetch current prices for all stocks
            await fetchCurrentPrices(items);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
            toast.error('Failed to load watchlist');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentPrices = async (items: WatchlistItem[]) => {
        setLoadingPrices(true);
        try {
            const pricePromises = items.map(async (item) => {
                try {
                    const priceData = await apiClient.getStockPrice(item.symbol);
                    return {
                        ...item,
                        currentPrice: priceData.currentPrice,
                        changePercent: priceData.priceChangePercent || 0,
                        change: priceData.priceChange || 0,
                        volume: priceData.volume || 0,
                        openPrice: priceData.openPrice || 0,
                        highPrice: priceData.highPrice || 0,
                        lowPrice: priceData.lowPrice || 0,
                        previousClose: priceData.previousClose || 0
                    };
                } catch (error) {
                    console.error(`Failed to fetch price for ${item.symbol}:`, error);
                    return {
                        ...item,
                        currentPrice: 0,
                        changePercent: 0,
                        change: 0,
                        volume: 0,
                        openPrice: 0,
                        highPrice: 0,
                        lowPrice: 0,
                        previousClose: 0
                    };
                }
            });

            const itemsWithPrices = await Promise.all(pricePromises);
            setWatchlist(itemsWithPrices);
        } catch (error) {
            console.error('Failed to fetch prices:', error);
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
        if (!isAdded) {
            // Remove from local state
            setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchWatchlist();
            toast.success('Watchlist refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh watchlist:', error);
            toast.error('Failed to refresh watchlist');
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatPrice = (price: number) => {
        return price.toFixed(2);
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}`;
    };

    const formatChangePercent = (changePercent: number) => {
        const sign = changePercent >= 0 ? '+' : '';
        return `${sign}${changePercent.toFixed(2)}%`;
    };

    const formatVolume = (volume: number) => {
        if (volume === 0) return 'N/A';
        
        if (volume >= 1e9) {
            return `${(volume / 1e9).toFixed(1)}B`;
        } else if (volume >= 1e6) {
            return `${(volume / 1e6).toFixed(1)}M`;
        } else if (volume >= 1e3) {
            return `${(volume / 1e3).toFixed(1)}K`;
        } else {
            return volume.toString();
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
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">{watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}</span>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || loadingPrices}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 hover:text-gray-100 rounded-lg transition-colors"
                        title="Refresh watchlist data"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        <span className="text-sm font-medium">
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </span>
                    </button>
                    {loadingPrices && !isRefreshing && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                    )}
                </div>
            </div>

            {/* Robinhood-style stock list */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-700 px-6 py-3 border-b border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-100 font-medium">My Stocks</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                <div className="divide-y divide-gray-600">
                    {watchlist.map((item) => {
                        const isPositive = (item.changePercent || 0) >= 0;
                        const changeColor = isPositive ? 'text-green-400' : 'text-orange-400';
                        
                        return (
                            <div key={item.id} className="px-6 py-6 hover:bg-gray-700/50 transition-colors">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - Symbol and Name */}
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                Symbol
                                            </div>
                                            <div className="text-gray-100 font-bold text-xl">
                                                {item.symbol}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                Name
                                            </div>
                                            <div className="text-gray-300 text-sm">
                                                {item.company}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Column - Price Data */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    Current Price
                                                </div>
                                                <div className="text-gray-100 font-semibold text-lg">
                                                    ${formatPrice(item.currentPrice || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    Open Price
                                                </div>
                                                <div className="text-gray-300 text-sm">
                                                    ${formatPrice(item.openPrice || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    High Price
                                                </div>
                                                <div className="text-green-400 text-sm font-medium">
                                                    ${formatPrice(item.highPrice || 0)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    Change
                                                </div>
                                                <div className={`text-sm font-medium ${changeColor}`}>
                                                    {formatChangePercent(item.changePercent || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    Low Price
                                                </div>
                                                <div className="text-red-400 text-sm font-medium">
                                                    ${formatPrice(item.lowPrice || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                    Previous Close
                                                </div>
                                                <div className="text-gray-300 text-sm">
                                                    ${formatPrice(item.previousClose || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Volume and Actions */}
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                                Volume
                                            </div>
                                            <div className="text-gray-300 text-sm font-medium">
                                                {formatVolume(item.volume || 0)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                            <WatchlistButton
                                                symbol={item.symbol}
                                                company={item.company}
                                                isInWatchlist={true}
                                                type="icon"
                                                onWatchlistChange={handleWatchlistChange}
                                            />
                                            <a
                                                href={`/stocks/${item.symbol}`}
                                                className="text-teal-500 hover:text-teal-400 text-sm font-medium px-3 py-1 rounded hover:bg-teal-500/10 transition-colors"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WatchlistPage;
