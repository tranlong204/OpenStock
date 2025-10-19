# Frontend Migration to Spring Boot Backend

This document outlines the changes made to migrate the OpenStock frontend from Next.js server actions to Spring Boot REST APIs.

## 🔄 **Migration Overview**

The frontend has been updated to:
- ✅ Use JWT authentication instead of Better Auth
- ✅ Call Spring Boot REST APIs instead of Next.js server actions
- ✅ Manage authentication state client-side
- ✅ Handle API errors gracefully

## 📁 **New Files Created**

### **API Client (`lib/api-client.ts`)**
- Centralized API client for all Spring Boot backend calls
- Handles JWT token management
- Provides typed interfaces for all API responses
- Includes error handling and retry logic

### **Authentication Context (`lib/auth-context.tsx`)**
- React context for managing authentication state
- Handles JWT token storage and retrieval
- Provides sign-in, sign-up, and sign-out methods
- Manages user session state

### **Configuration (`lib/config.ts`)**
- Centralized configuration for API endpoints
- Environment variable management
- Default settings and constants

## 🔧 **Updated Components**

### **Authentication Pages**
- **`app/(auth)/sign-in/page.tsx`**: Now uses `useAuth()` hook
- **`app/(auth)/sign-up/page.tsx`**: Updated to use Spring Boot signup API
- **`app/(auth)/layout.tsx`**: Client-side authentication check

### **Layout Components**
- **`app/layout.tsx`**: Wrapped with `AuthProvider`
- **`app/(root)/layout.tsx`**: Client-side authentication guard
- **`components/Header.tsx`**: Uses API client for stock data

### **Interactive Components**
- **`components/SearchCommand.tsx`**: Uses `apiClient.searchStocks()`
- **`components/WatchlistButton.tsx`**: Uses watchlist API endpoints
- **`components/UserDropdown.tsx`**: Uses `useAuth()` for sign out

## 🌐 **API Endpoints Used**

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### **Stocks**
- `GET /api/stocks/search?query={query}` - Search stocks
- `GET /api/stocks/price/{symbol}` - Get stock price

### **News**
- `GET /api/news?symbols={symbols}` - Get news articles

### **Watchlist**
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/{symbol}` - Remove stock from watchlist

### **User**
- `GET /api/user/profile` - Get current user profile

## 🔐 **Authentication Flow**

1. **Sign Up/Sign In**: User submits credentials
2. **JWT Token**: Backend returns JWT token on successful auth
3. **Token Storage**: Token stored in localStorage
4. **API Calls**: Token included in Authorization header
5. **Token Validation**: Backend validates token on each request
6. **Sign Out**: Token removed from localStorage

## 🚀 **Getting Started**

### **1. Start Spring Boot Backend**
```bash
cd OpenStock-spring-boot
JWT_SECRET=your-secret-key FINNHUB_API_KEY=your-api-key java -jar target/openstock-backend-0.1.0.jar
```

### **2. Configure Frontend**
Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### **3. Start Frontend**
```bash
cd OpenStock
npm install
npm run dev
```

## 🔧 **Configuration Options**

### **Environment Variables**
- `NEXT_PUBLIC_API_URL`: Spring Boot backend URL (default: http://localhost:8080)

### **API Client Configuration**
- `API_TIMEOUT`: Request timeout (default: 10000ms)
- `MAX_RETRY_ATTEMPTS`: Retry attempts (default: 3)
- `TOKEN_STORAGE_KEY`: localStorage key for JWT (default: 'auth_token')

## 🐛 **Error Handling**

The API client includes comprehensive error handling:
- Network errors
- HTTP status errors
- JWT token expiration
- API response errors

All errors are logged to console and displayed to users via toast notifications.

## 🔄 **Migration Benefits**

1. **Separation of Concerns**: Frontend focuses on UI, backend handles business logic
2. **Scalability**: Backend can be scaled independently
3. **Technology Flexibility**: Frontend and backend can use different technologies
4. **API Reusability**: APIs can be used by mobile apps or other clients
5. **Better Testing**: Frontend and backend can be tested independently

## 📝 **Next Steps**

1. **News Integration**: Update news components to use Spring Boot APIs
2. **Error Boundaries**: Add React error boundaries for better error handling
3. **Loading States**: Improve loading states throughout the app
4. **Caching**: Implement API response caching
5. **Offline Support**: Add offline functionality with service workers

## 🆘 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**: Ensure Spring Boot has CORS configured
2. **JWT Token Issues**: Check token expiration and secret key
3. **API Connection**: Verify Spring Boot backend is running
4. **Environment Variables**: Check `.env.local` configuration

### **Debug Mode**
Enable debug logging by setting `localStorage.debug = 'api-client'` in browser console.
