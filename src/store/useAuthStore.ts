import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

let authSubscription: { unsubscribe: () => void } | null = null;

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isPasswordRecovery: false,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });

      authSubscription?.unsubscribe();
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        set((state) => ({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isPasswordRecovery: event === 'PASSWORD_RECOVERY'
            ? true
            : event === 'SIGNED_OUT' ? false : state.isPasswordRecovery,
        }));
      });
      authSubscription = data.subscription;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot sign in.');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error.message);
    }
    // Keep the auth listener alive so this same app session can sign in again
    // after signing out without requiring a full page reload.
    set({ user: null, session: null, isAuthenticated: false, isPasswordRecovery: false });
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured()) throw new Error('Cloud authentication is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithEmail: async (email, password, fullName) => {
    if (!isSupabaseConfigured()) throw new Error('Cloud authentication is not configured.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: fullName ? { full_name: fullName } : undefined },
    });
    if (error) throw error;
    return !data.session;
  },

  requestPasswordReset: async (email) => {
    if (!isSupabaseConfigured()) throw new Error('Cloud authentication is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });
    if (error) throw error;
  },

  updatePassword: async (password) => {
    if (!isSupabaseConfigured()) throw new Error('Cloud authentication is not configured.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    set({ isPasswordRecovery: false });
  },

  clearPasswordRecovery: () => set({ isPasswordRecovery: false }),

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    });
  },
}));
