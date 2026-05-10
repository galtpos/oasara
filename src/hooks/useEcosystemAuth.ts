/**
 * useEcosystemAuth - Shared authentication hook for Aaron Day's 7-site ecosystem
 *
 * Central Supabase project: FreedomForge (uefznzzkrzqxgxxwslox)
 * Auth methods: Magic link (primary) + password (always visible)
 *
 * Works in both Vite+React and Next.js.
 * Zero dependencies beyond React + @supabase/supabase-js.
 *
 * Usage:
 *   const auth = useEcosystemAuth({
 *     supabaseUrl: 'https://uefznzzkrzqxgxxwslox.supabase.co',
 *     supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 *     siteKey: 'aarondayshow',
 *     siteName: 'The Aaron Day Show',
 *     redirectUrl: 'https://aaronday.com/auth/confirm',
 *   });
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EcosystemAuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteKey: string;
  siteName: string;
  redirectUrl: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  site_key: string;
  content_type: string;
  content_id: string;
  text: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profile
  display_name: string | null;
  avatar_url: string | null;
}

export interface VoteSummary {
  up: number;
  down: number;
  userVote: number | null;
}

export interface EcosystemAuth {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isAdmin: boolean;
  supabase: SupabaseClient;
  // Auth methods
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'preferences'>>) => Promise<{ error?: string }>;
  // Voting
  vote: (contentType: string, contentId: string, value: 1 | -1) => Promise<{ error?: string }>;
  removeVote: (contentType: string, contentId: string) => Promise<void>;
  getVotes: (contentType: string, contentId: string) => Promise<VoteSummary>;
  // Comments
  addComment: (contentType: string, contentId: string, text: string, parentId?: string) => Promise<{ error?: string; comment?: Comment }>;
  getComments: (contentType: string, contentId: string) => Promise<Comment[]>;
}

// ─── Admin emails ─────────────────────────────────────────────────────────────

const ADMIN_EMAILS = [
  'aaron@aaronday.com',
  'aaron@daylightfreedom.org',
  'aaron@freedomforge.io',
];

// ─── Supabase client cache ────────────────────────────────────────────────────

const clientCache = new Map<string, SupabaseClient>();

function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  const cacheKey = `${url}:${anonKey}`;
  let client = clientCache.get(cacheKey);
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    clientCache.set(cacheKey, client);
  }
  return client;
}

// ─── Gravatar URL from email ──────────────────────────────────────────────────

async function gravatarUrl(email: string): Promise<string> {
  const trimmed = email.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(trimmed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `https://www.gravatar.com/avatar/${hashHex}?d=identicon&s=80`;
}

// ─── Timeout wrapper ──────────────────────────────────────────────────────────

function withTimeout<T = any>(promise: PromiseLike<T> | Promise<T>, ms: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ]);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEcosystemAuth(config: EcosystemAuthConfig): EcosystemAuth {
  const { supabaseUrl, supabaseAnonKey, siteKey, redirectUrl } = config;

  const supabase = useMemo(
    () => getSupabaseClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(true);

  // ── Fetch / create profile ────────────────────────────────────────────────

  const fetchProfile = useCallback(async (userId: string, email?: string | null) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('ecosystem_profiles')
          .select('*')
          .eq('id', userId)
          .single()
      );

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet — create it
        const avatar = email ? await gravatarUrl(email) : null;
        const { data: newProfile, error: insertError } = await withTimeout(
          supabase
            .from('ecosystem_profiles')
            .insert({
              id: userId,
              email: email || null,
              display_name: email ? email.split('@')[0] : null,
              avatar_url: avatar,
              preferences: {},
            })
            .select()
            .single()
        );
        if (!insertError && newProfile && mountedRef.current) {
          setProfile(newProfile as UserProfile);
        }
        return;
      }

      if (!error && data && mountedRef.current) {
        setProfile(data as UserProfile);
      }
    } catch {
      // Profile fetch failed — non-fatal, UI can still render with user only
    }
  }, [supabase]);

  // ── Session initialization ────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await withTimeout(
          supabase.auth.getSession()
        );
        if (mountedRef.current) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user.email);
          }
        }
      } catch {
        // Auth initialization failed
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    init();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mountedRef.current) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // ── Session refresh on visibility change ──────────────────────────────────

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && session) {
        try {
          await supabase.auth.refreshSession();
        } catch {
          // Refresh failed — will retry on next visibility change
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [supabase, session]);

  // ── Periodic session refresh (every 10 minutes) ──────────────────────────

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      try {
        await supabase.auth.refreshSession();
      } catch {
        // Silent failure — will retry
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [supabase, session]);

  // ── Admin check ───────────────────────────────────────────────────────────

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (profile?.role === 'admin') return true;
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
    return false;
  }, [user, profile]);

  // ── Auth methods ──────────────────────────────────────────────────────────

  const signInWithMagicLink = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectUrl },
        })
      );
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Magic link failed' };
    }
  }, [supabase, redirectUrl]);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      );
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: displayName || email.split('@')[0] },
          },
        })
      );
      if (error) return { error: error.message };
      // Create profile immediately if user was auto-confirmed
      if (data.user && data.session) {
        const avatar = await gravatarUrl(email);
        await supabase.from('ecosystem_profiles').upsert({
          id: data.user.id,
          email,
          display_name: displayName || email.split('@')[0],
          avatar_url: avatar,
          preferences: {},
        });
      }
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  }, [supabase, redirectUrl]);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  }, [supabase]);

  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        })
      );
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Reset failed' };
    }
  }, [supabase, redirectUrl]);

  const updateProfile = useCallback(async (
    updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'preferences'>>
  ): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    try {
      const { error } = await withTimeout(
        supabase
          .from('ecosystem_profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      );
      if (error) return { error: error.message };
      // Update local state
      if (mountedRef.current && profile) {
        setProfile({ ...profile, ...updates, updated_at: new Date().toISOString() });
      }
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Update failed' };
    }
  }, [supabase, user, profile]);

  // ── Voting ────────────────────────────────────────────────────────────────

  const vote = useCallback(async (contentType: string, contentId: string, value: 1 | -1): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not signed in' };
    try {
      const { error } = await withTimeout(
        supabase
          .from('ecosystem_votes')
          .upsert(
            {
              user_id: user.id,
              site_key: siteKey,
              content_type: contentType,
              content_id: contentId,
              value,
            },
            { onConflict: 'user_id,content_type,content_id' }
          )
      );
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Vote failed' };
    }
  }, [supabase, user, siteKey]);

  const removeVote = useCallback(async (contentType: string, contentId: string): Promise<void> => {
    if (!user) return;
    await withTimeout(
      supabase
        .from('ecosystem_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
    ).catch(() => {});
  }, [supabase, user]);

  const getVotes = useCallback(async (contentType: string, contentId: string): Promise<VoteSummary> => {
    try {
      // Get aggregated votes
      const { data: allVotes } = await withTimeout(
        supabase
          .from('ecosystem_votes')
          .select('value')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
      );

      const up = allVotes?.filter(v => v.value === 1).length ?? 0;
      const down = allVotes?.filter(v => v.value === -1).length ?? 0;

      // Get user's vote if logged in
      let userVote: number | null = null;
      if (user) {
        const { data: myVote } = await withTimeout(
          supabase
            .from('ecosystem_votes')
            .select('value')
            .eq('user_id', user.id)
            .eq('content_type', contentType)
            .eq('content_id', contentId)
            .maybeSingle()
        );
        userVote = myVote?.value ?? null;
      }

      return { up, down, userVote };
    } catch {
      return { up: 0, down: 0, userVote: null };
    }
  }, [supabase, user]);

  // ── Comments ──────────────────────────────────────────────────────────────

  const addComment = useCallback(async (
    contentType: string,
    contentId: string,
    text: string,
    parentId?: string
  ): Promise<{ error?: string; comment?: Comment }> => {
    if (!user) return { error: 'Not signed in' };
    if (!text.trim()) return { error: 'Comment cannot be empty' };
    if (text.length > 2000) return { error: 'Comment too long (max 2000 characters)' };

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('ecosystem_comments')
          .insert({
            user_id: user.id,
            site_key: siteKey,
            content_type: contentType,
            content_id: contentId,
            text: text.trim(),
            parent_id: parentId || null,
          })
          .select(`
            *,
            ecosystem_profiles!inner(display_name, avatar_url)
          `)
          .single()
      );

      if (error) return { error: error.message };

      const comment: Comment = {
        ...(data as Record<string, unknown>),
        display_name: (data as any).ecosystem_profiles?.display_name ?? null,
        avatar_url: (data as any).ecosystem_profiles?.avatar_url ?? null,
      } as Comment;

      return { comment };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Failed to add comment' };
    }
  }, [supabase, user, siteKey]);

  const getComments = useCallback(async (contentType: string, contentId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('ecosystem_comments')
          .select(`
            *,
            ecosystem_profiles(display_name, avatar_url)
          `)
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .order('created_at', { ascending: true }),
        8000 // slightly longer timeout for comment lists
      );

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        site_key: row.site_key,
        content_type: row.content_type,
        content_id: row.content_id,
        text: row.text,
        parent_id: row.parent_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        display_name: row.ecosystem_profiles?.display_name ?? null,
        avatar_url: row.ecosystem_profiles?.avatar_url ?? null,
      }));
    } catch {
      return [];
    }
  }, [supabase]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    user,
    profile,
    session,
    loading,
    initialized,
    isAdmin,
    supabase,
    signInWithMagicLink,
    signInWithPassword,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    vote,
    removeVote,
    getVotes,
    addComment,
    getComments,
  };
}
