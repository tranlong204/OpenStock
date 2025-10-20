'use client';

import React, { useEffect, useState } from 'react';
import { apiClient, StockPriceDto } from '@/lib/api-client';

interface HeatmapStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
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

  // TradingView-style color scheme
  const getBackgroundColor = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    
    if (changePercent >= 0) {
      // Green shades for positive (TradingView style)
      if (absChange >= 3) return 'rgb(34, 139, 34)'; // Dark green
      if (absChange >= 2) return 'rgb(60, 179, 113)'; // Medium green
      if (absChange >= 1) return 'rgb(144, 238, 144)'; // Light green
      if (absChange >= 0.5) return 'rgb(152, 251, 152)'; // Pale green
      return 'rgb(193, 255, 193)'; // Very light green
    } else {
      // Red shades for negative (TradingView style)
      if (absChange >= 3) return 'rgb(139, 0, 0)'; // Dark red
      if (absChange >= 2) return 'rgb(178, 34, 34)'; // Medium red
      if (absChange >= 1) return 'rgb(205, 92, 92)'; // Light red
      if (absChange >= 0.5) return 'rgb(240, 128, 128)'; // Pale red
      return 'rgb(255, 182, 193)'; // Very light red
    }
  };

  const formatChangePercent = (changePercent: number): string => {
    return `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`} style={{ height, backgroundColor: '#131722', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading heatmap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className={`relative ${className}`} style={{ height, backgroundColor: '#131722', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height, backgroundColor: '#131722', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header - TradingView style */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#D1D4DC' 
        }}>
          Stock Heatmap
        </h3>
        <span style={{ 
          fontSize: '12px', 
          color: '#787B86' 
        }}>
          Real-time data
        </span>
      </div>

      {/* Heatmap Grid - TradingView style */}
      <div style={{ 
        padding: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '4px',
        height: 'calc(100% - 60px)',
        overflowY: 'auto'
      }}>
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            style={{
              backgroundColor: getBackgroundColor(stock.changePercent),
              borderRadius: '4px',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              minHeight: '80px',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.zIndex = '1';
            }}
            title={`${stock.name}\nPrice: $${stock.price.toFixed(2)}\nChange: ${formatChangePercent(stock.changePercent)}`}
          >
            {/* Symbol */}
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1E222D',
              marginBottom: '4px',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              {stock.symbol}
            </div>
            
            {/* Percentage Change */}
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: stock.changePercent >= 0 ? '#1E222D' : '#1E222D',
              textAlign: 'center'
            }}>
              {formatChangePercent(stock.changePercent)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockHeatmap;
