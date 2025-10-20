'use client';

import React, { useEffect, useState } from 'react';
import WatchlistButton from "@/components/WatchlistButton";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface WatchlistButtonWrapperProps {
    symbol: string;
}

export default function WatchlistButtonWrapper({ symbol }: WatchlistButtonWrapperProps) {
    const { isAuthenticated } = useAuth();
    const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
    const [isLoadingWatchlistStatus, setIsLoadingWatchlistStatus] = useState<boolean>(true);

    useEffect(() => {
        const checkWatchlistStatus = async () => {
            if (!isAuthenticated) {
                setIsLoadingWatchlistStatus(false);
                return;
            }

            try {
                const status = await apiClient.isInWatchlist(symbol.toUpperCase());
                setIsInWatchlist(status);
            } catch (error) {
                console.error('Failed to check watchlist status:', error);
                setIsInWatchlist(false);
            } finally {
                setIsLoadingWatchlistStatus(false);
            }
        };

        checkWatchlistStatus();
    }, [symbol, isAuthenticated]);

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
