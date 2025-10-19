// Frontend configuration for Spring Boot backend integration
export const config = {
  // Spring Boot Backend API URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // API timeout settings
  API_TIMEOUT: 10000,
  
  // Retry settings
  MAX_RETRY_ATTEMPTS: 3,
  
  // Authentication settings
  TOKEN_STORAGE_KEY: 'auth_token',
  
  // Default stock symbols for initial load
  DEFAULT_STOCK_SYMBOLS: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
    'META', 'NVDA', 'NFLX', 'ORCL', 'CRM'
  ]
};

export default config;
