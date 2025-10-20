'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, AuthResponse } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (data: SignUpFormData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
  };

  useEffect(() => {
    // Set up auth error callback
    apiClient.setOnAuthError(() => {
      clearAuth();
    });

    // Check for existing token on mount
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
      setToken(existingToken);
      apiClient.setToken(existingToken);
      // Try to get user info
      apiClient.getCurrentUser()
        .then(setUser)
        .catch((error) => {
          console.log('Token validation failed:', error);
          // Only clear auth if it's a 401 error (token expired)
          if (error.message.includes('401') || error.message.includes('Authentication required')) {
            clearAuth();
          } else {
            // For other errors, just set loading to false
            setIsLoading(false);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Set up periodic token validation (every 5 minutes)
    const tokenValidationInterval = setInterval(() => {
      if (token && user) {
        // Validate token by making a lightweight API call
        apiClient.getCurrentUser()
          .then(setUser)
          .catch((error) => {
            console.log('Periodic token validation failed:', error);
            // Only clear auth if it's a 401 error (token expired)
            if (error.message.includes('401') || error.message.includes('Authentication required')) {
              clearAuth();
            }
          });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(tokenValidationInterval);
    };
  }, [token, user]);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.signIn({ email, password });
    if (response.success && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      apiClient.setToken(response.token);
    }
    return response;
  };

  const signUp = async (data: SignUpFormData): Promise<AuthResponse> => {
    const response = await apiClient.signUp(data);
    if (response.success && response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      apiClient.setToken(response.token);
    }
    return response;
  };

  const signOut = async (): Promise<void> => {
    try {
      await apiClient.signOut();
    } catch (error) {
      // Ignore errors during signout
    } finally {
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!token && !!user,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
