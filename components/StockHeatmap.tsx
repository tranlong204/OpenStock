'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface HeatmapStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

interface StockHeatmapProps {
  symbols: string[];
  className?: string;
  height?: number;
}

// Sector mapping for stocks
const SECTOR_MAP: Record<string, string> = {
  'AAPL': 'Electronic Technology',
  'MSFT': 'Technology Services',
  'GOOGL': 'Technology Services',
  'AMZN': 'Retail Trade',
  'TSLA': 'Consumer Durables',
  'META': 'Technology Services',
  'NVDA': 'Electronic Technology',
  'AVGO': 'Electronic Technology',
  'JPM': 'Finance',
  'BAC': 'Finance',
  'WFC': 'Finance',
  'MA': 'Finance',
  'V': 'Finance',
  'HD': 'Retail Trade',
  'WMT': 'Retail Trade',
  'COST': 'Retail Trade',
  'JNJ': 'Health Technology',
  'PG': 'Consumer Non-Durables',
  'KO': 'Consumer Non-Durables',
  'PEP': 'Consumer Non-Durables',
  'NFLX': 'Technology Services',
  'ADBE': 'Technology Services',
  'CRM': 'Technology Services',
  'ORCL': 'Technology Services',
  'INTC': 'Electronic Technology',
  'AMD': 'Electronic Technology',
  'QCOM': 'Electronic Technology',
  'TXN': 'Electronic Technology',
  'CSCO': 'Electronic Technology',
  'IBM': 'Technology Services',
  'UBER': 'Technology Services',
  'LYFT': 'Technology Services',
};

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
              sector: SECTOR_MAP[symbol] || 'Other',
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

  // TradingView-style color scheme (more accurate gradients)
  const getBackgroundColor = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    
    if (changePercent > 0) {
      // Green shades for positive (TradingView style)
      if (absChange >= 4) return '#0f5132'; // Very dark green
      if (absChange >= 3) return '#198754'; // Dark green
      if (absChange >= 2) return '#20c997'; // Medium green
      if (absChange >= 1) return '#4ade80'; // Light green
      if (absChange >= 0.5) return '#86efac'; // Pale green
      return '#d1fae5'; // Very light green
    } else if (changePercent < 0) {
      // Red shades for negative (TradingView style)
      if (absChange >= 4) return '#7f1d1d'; // Very dark red
      if (absChange >= 3) return '#b91c1c'; // Dark red
      if (absChange >= 2) return '#dc2626'; // Medium red
      if (absChange >= 1) return '#f87171'; // Light red
      if (absChange >= 0.5) return '#fca5a5'; // Pale red
      return '#fecaca'; // Very light red
    } else {
      // Gray for zero change
      return '#6b7280';
    }
  };

  const getTextColor = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    
    // Use white text for dark backgrounds, dark text for light backgrounds
    if (absChange >= 1.5) {
      return '#ffffff';
    } else if (absChange >= 0.3) {
      return '#1f2937';
    } else {
      return '#111827';
    }
  };

  const formatChangePercent = (changePercent: number): string => {
    const sign = changePercent > 0 ? '+' : changePercent < 0 ? '' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  // Group stocks by sector
  const stocksBySector = stocks.reduce((acc, stock) => {
    const sector = stock.sector || 'Other';
    if (!acc[sector]) {
      acc[sector] = [];
    }
    acc[sector].push(stock);
    return acc;
  }, {} as Record<string, HeatmapStock[]>);

  if (isLoading) {
    return (
      <div className={className} style={{ 
        height, 
        backgroundColor: '#1e222d', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #2a2e39'
      }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p style={{ color: '#787b86' }}>Loading heatmap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className={className} style={{ 
        height, 
        backgroundColor: '#1e222d', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #2a2e39'
      }}>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#787b86' }}>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ 
      height, 
      backgroundColor: '#1e222d', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '1px solid #2a2e39'
    }}>
      {/* Header - TradingView style */}
      <div style={{ 
        padding: '16px 20px',
        borderBottom: '1px solid #2a2e39',
        backgroundColor: '#1e222d'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#d1d4dc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          Stock Heatmap
        </h3>
      </div>

      {/* Heatmap Content - Sector-grouped layout */}
      <div style={{ 
        padding: '12px',
        overflowY: 'auto',
        height: 'calc(100% - 64px)',
        backgroundColor: '#131722'
      }}>
        {Object.entries(stocksBySector).map(([sector, sectorStocks]) => (
          <div key={sector} style={{ marginBottom: '16px' }}>
            {/* Sector Header - TradingView blue style */}
            <div style={{
              backgroundColor: '#2962ff',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {sector}
              <span style={{ fontSize: '11px', opacity: 0.8 }}>›</span>
            </div>

            {/* Stocks Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '6px'
            }}>
              {sectorStocks.map((stock) => {
                const bgColor = getBackgroundColor(stock.changePercent);
                const textColor = getTextColor(stock.changePercent);
                
                return (
                  <div
                    key={stock.symbol}
                    style={{
                      backgroundColor: bgColor,
                      borderRadius: '6px',
                      padding: '14px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '90px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                      e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.zIndex = '1';
                    }}
                    title={`${stock.name}\n$${stock.price.toFixed(2)}\n${formatChangePercent(stock.changePercent)}`}
                  >
                    {/* Symbol */}
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: textColor,
                      marginBottom: '6px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '0.3px'
                    }}>
                      {stock.symbol}
                    </div>
                    
                    {/* Percentage Change */}
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: textColor,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {formatChangePercent(stock.changePercent)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockHeatmap;
