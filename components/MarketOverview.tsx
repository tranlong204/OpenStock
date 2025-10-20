'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

interface MarketOverviewProps {
  className?: string;
  height?: number;
}

const MARKET_STOCKS = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corp', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corp', sector: 'Technology' },
];

const MarketOverview: React.FC<MarketOverviewProps> = ({ 
  className = '', 
  height = 600 
}) => {
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('Technology');

  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stockPromises = MARKET_STOCKS.map(async (stock) => {
          try {
            const priceData = await apiClient.getStockPrice(stock.symbol);
            return {
              symbol: priceData.symbol,
              name: stock.name,
              price: priceData.currentPrice,
              change: priceData.priceChange,
              changePercent: priceData.priceChangePercent,
              sector: stock.sector,
            };
          } catch (error) {
            console.error(`Failed to fetch data for ${stock.symbol}:`, error);
            return null;
          }
        });

        const stockData = await Promise.all(stockPromises);
        const validStocks = stockData.filter((stock): stock is MarketStock => stock !== null);
        
        setStocks(validStocks);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        setError('Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number): string => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? '#00d4aa' : '#ff6b6b';
  };

  if (isLoading) {
    return (
      <div className={className} style={{ 
        height, 
        backgroundColor: '#131722', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #2a2e39'
      }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p style={{ color: '#787b86' }}>Loading market overview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || stocks.length === 0) {
    return (
      <div className={className} style={{ 
        height, 
        backgroundColor: '#131722', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #2a2e39'
      }}>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#787b86' }}>{error || 'No market data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ 
      height, 
      backgroundColor: '#131722', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '1px solid #2a2e39'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px',
        borderBottom: '1px solid #2a2e39',
        backgroundColor: '#131722'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#d1d4dc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Market Overview
        </h3>
      </div>

      {/* Tabs */}
      <div style={{
        padding: '12px 20px 0',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #2a2e39'
      }}>
        {['Financial', 'Technology', 'Services'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedTab === tab ? '#2962ff' : 'transparent',
              color: selectedTab === tab ? '#ffffff' : '#787b86',
              border: selectedTab === tab ? '1px solid #2962ff' : '1px solid #2a2e39',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (selectedTab !== tab) {
                e.currentTarget.style.backgroundColor = '#2a2e39';
                e.currentTarget.style.color = '#d1d4dc';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTab !== tab) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#787b86';
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div style={{
        height: '200px',
        margin: '16px 20px',
        backgroundColor: '#1e222d',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #2a2e39'
      }}>
        <div style={{ textAlign: 'center', color: '#787b86' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '14px' }}>Market Chart</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Real-time data from our backend</div>
        </div>
      </div>

      {/* Time Range Filters */}
      <div style={{
        padding: '0 20px 16px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {['1D', '1M', '3M', '1Y', '5Y', 'All'].map((period) => (
          <button
            key={period}
            style={{
              padding: '6px 12px',
              backgroundColor: period === '1Y' ? '#2a2e39' : 'transparent',
              color: period === '1Y' ? '#ffffff' : '#787b86',
              border: '1px solid #2a2e39',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (period !== '1Y') {
                e.currentTarget.style.backgroundColor = '#2a2e39';
                e.currentTarget.style.color = '#d1d4dc';
              }
            }}
            onMouseLeave={(e) => {
              if (period !== '1Y') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#787b86';
              }
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stock List */}
      <div style={{
        padding: '0 20px 20px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #2a2e39',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e222d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Logo Placeholder */}
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#2a2e39',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#d1d4dc'
            }}>
              {stock.symbol.charAt(0)}
            </div>

            {/* Stock Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#d1d4dc',
                marginBottom: '2px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {stock.symbol}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#787b86',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {stock.name}
              </div>
            </div>

            {/* Price Info */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#d1d4dc',
                marginBottom: '2px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                ${formatPrice(stock.price)}
              </div>
              <div style={{
                fontSize: '12px',
                color: getChangeColor(stock.change),
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;

