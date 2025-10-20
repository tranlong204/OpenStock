'use client';

import React, { useEffect, useState } from 'react';
import WatchlistButton from "@/components/WatchlistButton";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface WatchlistButtonWrapperProps {
    symbol: string;
}

export default function WatchlistButtonWrapper({ symbol }: WatchlistButtonWrapperProps) {
    const { isAuthenticated, user } = useAuth();
    const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
    const [isLoadingWatchlistStatus, setIsLoadingWatchlistStatus] = useState<boolean>(true);

    useEffect(() => {
        const checkWatchlistStatus = async () => {
            console.log('WatchlistButtonWrapper: isAuthenticated =', isAuthenticated);
            console.log('WatchlistButtonWrapper: user =', user);
            
            if (!isAuthenticated) {
                console.log('WatchlistButtonWrapper: User not authenticated, skipping watchlist check');
                setIsLoadingWatchlistStatus(false);
                return;
            }

            try {
                console.log('WatchlistButtonWrapper: Checking watchlist status for', symbol);
                const status = await apiClient.isInWatchlist(symbol.toUpperCase());
                console.log('WatchlistButtonWrapper: Watchlist status =', status);
                setIsInWatchlist(status);
            } catch (error) {
                console.error('WatchlistButtonWrapper: Failed to check watchlist status:', error);
                setIsInWatchlist(false);
            } finally {
                setIsLoadingWatchlistStatus(false);
            }
        };

        checkWatchlistStatus();
    }, [symbol, isAuthenticated, user]);

    const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
        setIsInWatchlist(isAdded);
    };

    return (
        <WatchlistButton 
            symbol={symbol.toUpperCase()} 
            company={symbol.toUpperCase()} 
            isInWatchlist={isInWatchlist}
            onWatchlistChange={handleWatchlistChange}
        />
    );
}
