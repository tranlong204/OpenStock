// API client for Spring Boot backend
import { config } from './config';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface StockDto {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface StockPriceDto {
  symbol: string;
  name: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  volume: number;
  timestamp: string;
  exchange: string;
  currency: string;
  priceChange: number;
  priceChangePercent: number;
}

export interface NewsArticleDto {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  company: string;
  addedAt: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onAuthError?: () => void;

  constructor(baseUrl: string = config.API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem(config.TOKEN_STORAGE_KEY) : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(config.TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(config.TOKEN_STORAGE_KEY);
      }
    }
  }

  setOnAuthError(callback: () => void) {
    this.onAuthError = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 401) {
        // Clear auth state and notify auth context
        this.setToken(null);
        if (this.onAuthError) {
          this.onAuthError();
        }
        throw new Error("Authentication required. Please sign in.");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to perform this action.");
      } else if (response.status === 404) {
        throw new Error("Resource not found.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication endpoints
  async signUp(data: SignUpFormData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInFormData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signOut(): Promise<void> {
    await this.request('/api/auth/signout', {
      method: 'POST',
    });
    this.setToken(null);
  }

  // Stock endpoints
  async searchStocks(query?: string): Promise<StockDto[]> {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    return this.request<StockDto[]>(`/api/stocks/search${params}`);
  }

  async getStockPrice(symbol: string): Promise<StockPriceDto> {
    return this.request<StockPriceDto>(`/api/stocks/price/${symbol}`);
  }

  // News endpoints
  async getNews(symbols?: string[]): Promise<NewsArticleDto[]> {
    const params = symbols && symbols.length > 0 
      ? `?symbols=${symbols.join(',')}` 
      : '';
    return this.request<NewsArticleDto[]>(`/api/news${params}`);
  }

  // Watchlist endpoints
  async getWatchlist(): Promise<WatchlistItem[]> {
    return this.request<WatchlistItem[]>('/api/watchlist');
  }

  async addToWatchlist(symbol: string, company: string): Promise<void> {
    await this.request('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol, company }),
    });
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    await this.request(`/api/watchlist/${symbol}`, {
      method: 'DELETE',
    });
  }

  async isInWatchlist(symbol: string): Promise<boolean> {
    return this.request<boolean>(`/api/watchlist/check/${symbol}`);
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/user/profile');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
