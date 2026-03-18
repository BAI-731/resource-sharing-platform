import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type User } from '../lib/auth';
import type { SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn({ email, password });
    setUser(user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const user = await authService.signUp({ email, password, name });
    setUser(user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
