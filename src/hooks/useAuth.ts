import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  user_type: 'patient' | 'facility_rep' | 'admin';
  facility_id?: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState(): AuthState & {
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: session ? true : false, // Keep loading if we need to fetch profile
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: session ? true : false,
        }));

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setState(prev => ({ ...prev, profile: null, loading: false }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: data as UserProfile,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(state.user.id);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      return { error: message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      return { error: message };
    }
  };

  return {
    ...state,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    updateProfile,
    resetPassword,
  };
}

export { AuthContext };
export type { UserProfile, AuthContextType };
