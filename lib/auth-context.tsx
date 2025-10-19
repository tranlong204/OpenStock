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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
      setToken(existingToken);
      apiClient.setToken(existingToken);
      // Try to get user info
      apiClient.getCurrentUser()
        .then(setUser)
        .catch(() => {
          // Token might be expired, clear it
          localStorage.removeItem('auth_token');
          setToken(null);
          apiClient.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

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
    await apiClient.signOut();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!token && !!user,
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
