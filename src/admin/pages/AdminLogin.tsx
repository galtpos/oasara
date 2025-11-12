import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.user_type !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Admin access required');
      }

      // Success - navigate to admin dashboard
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl text-champagne-gold mb-2">OASARA</h1>
          <p className="text-cream/70 text-sm italic">Admin Access</p>
        </div>

        {/* Login Form */}
        <div className="glass-morphism rounded-2xl p-8">
          <h2 className="font-serif text-2xl text-cream mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-cream/80 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-dark-base/50 border border-cream/20 text-cream placeholder-cream/40 focus:outline-none focus:border-champagne-gold transition-colors"
                placeholder="admin@oasara.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-cream/80 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-dark-base/50 border border-cream/20 text-cream placeholder-cream/40 focus:outline-none focus:border-champagne-gold transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full gradient-cta py-3 rounded-lg font-semibold text-dark-base transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-cream/60 hover:text-champagne-gold transition-colors"
            >
              ← Back to site
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-cream/40 text-xs mt-6">
          This is a restricted area. All access is logged and monitored.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
