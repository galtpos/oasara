import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  user_type: string;
  avatar_url?: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAdminStatus();
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAdminStatus() {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, email, name, user_type, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (profile && profile.user_type === 'admin') {
        setUser(profile as AdminUser);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
        // Redirect non-admins away from admin area
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    await checkAdminStatus();
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsAdmin(false);
    navigate('/admin/login');
  }

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
    checkAdminStatus,
  };
}
