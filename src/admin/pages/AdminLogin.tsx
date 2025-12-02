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
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="logo-gradient text-5xl mb-2">OASARA</h1>
          <p className="text-sage-500 text-sm italic">Admin Access</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl p-8 border-2 border-sage-200 shadow-card">
          <h2 className="font-display text-2xl text-ocean-700 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-ocean-600 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-sage-50 border-2 border-sage-200 text-ocean-700 placeholder-sage-400 focus:outline-none focus:border-ocean-400 transition-colors"
                placeholder="admin@oasara.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-ocean-600 mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-sage-50 border-2 border-sage-200 text-ocean-700 placeholder-sage-400 focus:outline-none focus:border-ocean-400 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full btn-gold py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-sage-500 hover:text-ocean-600 transition-colors"
            >
              ← Back to site
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-sage-400 text-xs mt-6">
          This is a restricted area. All access is logged and monitored.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
