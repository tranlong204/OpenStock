'use client';

import React, { useEffect, useState } from 'react';
import { apiClient, StockPriceDto } from '@/lib/api-client';

interface HeatmapStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  sector?: string;
}

interface StockHeatmapProps {
  symbols: string[];
  className?: string;
  height?: number;
}

const StockHeatmap: React.FC<StockHeatmapProps> = ({ 
  symbols, 
  className = '', 
  height = 600 
}) => {
  const [stocks, setStocks] = useState<HeatmapStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stockPromises = symbols.map(async (symbol) => {
          try {
            const priceData = await apiClient.getStockPrice(symbol);
            return {
              symbol: priceData.symbol,
              name: priceData.name,
              price: priceData.currentPrice,
              change: priceData.priceChange,
              changePercent: priceData.priceChangePercent,
              marketCap: 0, // We don't have market cap data from Finnhub
              sector: 'Technology' // Default sector, could be enhanced
            };
          } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
            return null;
          }
        });

        const stockData = await Promise.all(stockPromises);
        const validStocks = stockData.filter((stock): stock is HeatmapStock => stock !== null);
        
        setStocks(validStocks);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
        setError('Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    };

    if (symbols.length > 0) {
      fetchStockData();
    }
  }, [symbols]);

  const getColorIntensity = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    const maxChange = 5; // Maximum change percentage for color intensity
    
    if (changePercent >= 0) {
      // Green for positive changes
      const intensity = Math.min(absChange / maxChange, 1);
      const opacity = 0.3 + (intensity * 0.7); // 0.3 to 1.0 opacity
      return `rgba(34, 197, 94, ${opacity})`; // Green with varying intensity
    } else {
      // Red for negative changes
      const intensity = Math.min(absChange / maxChange, 1);
      const opacity = 0.3 + (intensity * 0.7); // 0.3 to 1.0 opacity
      return `rgba(239, 68, 68, ${opacity})`; // Red with varying intensity
    }
  };

  const getTextColor = (changePercent: number): string => {
    return changePercent >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number): string => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading heatmap data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-2">Error loading heatmap</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No stock data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`} style={{ height }}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-100 mb-2">Stock Heatmap</h3>
        <p className="text-gray-400 text-sm">Real-time data from our backend</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 mb-6">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="relative group cursor-pointer"
            style={{
              backgroundColor: getColorIntensity(stock.changePercent),
              borderRadius: '8px',
              padding: '12px',
              minHeight: '80px',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm mb-1">
                {stock.symbol}
              </div>
              <div className={`text-xs font-semibold ${getTextColor(stock.changePercent)}`}>
                {formatChangePercent(stock.changePercent)}
              </div>
              <div className="text-xs text-gray-700 mt-1">
                ${stock.price.toFixed(2)}
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="font-semibold">{stock.name}</div>
              <div>Price: ${stock.price.toFixed(2)}</div>
              <div>Change: {formatChange(stock.change)}</div>
              <div>Change %: {formatChangePercent(stock.changePercent)}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">Negative</span>
          </div>
        </div>
        <div className="text-gray-500 text-xs">
          Intensity based on percentage change
        </div>
      </div>
    </div>
  );
};

export default StockHeatmap;
