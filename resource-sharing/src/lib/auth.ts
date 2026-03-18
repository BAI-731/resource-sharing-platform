import { supabase } from './supabase';
import type { User as SupabaseUser, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export class AuthError extends Error {
  constructor(message: string, public originalError?: SupabaseAuthError) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async signUp(credentials: RegisterCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    });

    if (error) {
      throw new AuthError(error.message, error);
    }

    if (!data.user) {
      throw new AuthError('注册失败，请稍后重试');
    }

    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      name: credentials.name,
      created_at: new Date().toISOString(),
    });

    return data.user;
  },

  async signIn(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new AuthError(error.message, error);
    }

    if (!data.user) {
      throw new AuthError('登录失败，请稍后重试');
    }

    return data.user;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AuthError(error.message, error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
    return user;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  },
};
