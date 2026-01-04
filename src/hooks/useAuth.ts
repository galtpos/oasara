import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
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
  initialized: boolean; // NEW: Track if initial auth check is complete
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Timeout helper - works with both Promise and PromiseLike (Supabase)
const withTimeout = <T,>(promiseLike: PromiseLike<T>, ms: number): Promise<T> => {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]);
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    initialized: false,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);

  // Fetch user profile (non-blocking - doesn't affect auth state)
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const result = await withTimeout(
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        5000
      ) as { data: UserProfile | null; error: any };

      if (result.error && result.error.code !== 'PGRST116') {
        console.warn('[Auth] Profile fetch error (non-fatal):', result.error);
      }

      setState(prev => ({
        ...prev,
        profile: result.data,
      }));
    } catch (error) {
      console.warn('[Auth] Profile fetch timeout (non-fatal):', error);
    }
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    console.log('[Auth] Initializing...');

    try {
      // Try to get session with timeout
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        5000
      );

      if (error) {
        console.error('[Auth] Session error:', error);
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          loading: false,
          initialized: true,
          error: error.message,
        }));
        return;
      }

      console.log('[Auth] Session:', session ? 'found' : 'none');

      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
        error: null,
      }));

      // Fetch profile in background (non-blocking)
      if (session?.user) {
        fetchProfile(session.user.id);
      }

    } catch (error) {
      console.error('[Auth] Initialization timeout:', error);
      
      // Even on timeout, check localStorage for cached session
      try {
        const stored = localStorage.getItem('oasara.auth.token');
        if (stored) {
          const data = JSON.parse(stored);
          if (data?.user) {
            console.log('[Auth] Using cached session from localStorage');
            setState(prev => ({
              ...prev,
              user: data.user,
              session: data,
              loading: false,
              initialized: true,
              error: null,
            }));
            return;
          }
        }
      } catch {}

      // No session found
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        initialized: true,
        error: 'Unable to verify session',
      }));
    } finally {
      initializingRef.current = false;
    }
  }, [fetchProfile]);

  // Refresh session (call this periodically and after idle)
  const refreshSession = useCallback(async (): Promise<boolean> => {
    console.log('[Auth] Refreshing session...');
    
    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.refreshSession(),
        5000
      );

      if (error || !session) {
        console.warn('[Auth] Session refresh failed:', error?.message);
        return false;
      }

      console.log('[Auth] Session refreshed successfully');
      setState(prev => ({
        ...prev,
        session,
        user: session.user,
        error: null,
      }));
      return true;
    } catch (error) {
      console.error('[Auth] Session refresh timeout:', error);
      return false;
    }
  }, []);

  // Set up auth state listener and initialization
  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event, session ? 'has session' : 'no session');

        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
          error: null,
        }));

        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // Set up periodic session refresh (every 10 minutes)
    refreshIntervalRef.current = setInterval(() => {
      if (state.session) {
        refreshSession();
      }
    }, 10 * 60 * 1000);

    // Refresh on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.session) {
        console.log('[Auth] Tab became visible, refreshing session...');
        refreshSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeAuth, fetchProfile, refreshSession, state.session]);

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
      initialized: true,
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
    refreshSession,
  };
}

export { AuthContext };
export type { UserProfile, AuthContextType };
