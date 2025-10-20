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
  const [isLoading, setIsLoading] = useState(false); // Start with false

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
  };

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    
    // Set up auth error callback
    apiClient.setOnAuthError(() => {
      console.log('Auth error callback triggered');
      clearAuth();
    });

    // Check for existing token on mount
    const existingToken = localStorage.getItem('auth_token');
    console.log('Existing token:', existingToken ? 'exists' : 'none');
    
    if (existingToken) {
      setToken(existingToken);
      apiClient.setToken(existingToken);
    }
  }, []); // Empty dependency array to run only once on mount

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
