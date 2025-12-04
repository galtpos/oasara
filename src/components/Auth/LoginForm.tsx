import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuth';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(true); // Default to magic link
  const { signIn, signInWithMagicLink, resetPassword, loading } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const { error: magicLinkError } = await signInWithMagicLink(email);

    if (magicLinkError) {
      setError(magicLinkError);
    } else {
      setMagicLinkSent(true);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError);
    } else {
      setResetSent(true);
    }
  };

  if (magicLinkSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ocean-700 mb-2">Check Your Email</h2>
          <p className="text-ocean-600/70 mb-2">
            We've sent a magic link to <strong>{email}</strong>.
          </p>
          <p className="text-ocean-500/60 text-sm mb-6">
            Click the link in your email to sign in instantly. No password needed!
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="inline-block px-6 py-2 rounded-lg bg-gold-100 hover:bg-gold-200 text-ocean-700 border border-gold-300 transition-colors text-sm font-medium"
          >
            Send Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (resetSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ocean-700 mb-2">Check Your Email</h2>
          <p className="text-ocean-600/70 mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <button
            onClick={() => {
              setResetSent(false);
              setShowResetForm(false);
            }}
            className="inline-block px-6 py-2 rounded-lg bg-gold-100 hover:bg-gold-200 text-ocean-700 border border-gold-300 transition-colors text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    );
  }

  if (showResetForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ocean-700 mb-2">Reset Password</h1>
          <p className="text-ocean-600/70">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-3 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            onClick={() => setShowResetForm(false)}
            className="w-full py-2 text-ocean-600/70 hover:text-ocean-700 text-sm font-medium transition-colors"
          >
            Back to Login
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-ocean-700 mb-2">
          {useMagicLink ? 'Sign In Instantly' : 'Welcome Back'}
        </h1>
        <p className="text-ocean-600/70">
          {useMagicLink
            ? 'No password required. We\'ll email you a magic link.'
            : 'Sign in to your OASARA account'}
        </p>
      </div>

      {useMagicLink ? (
        <form onSubmit={handleMagicLink} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <p className="text-sm text-ocean-500/70">
            New user? We'll create your account automatically.
            <br />
            <span className="text-gold-600">Returning? We'll log you in instantly.</span>
          </p>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-3 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <button
            type="button"
            onClick={() => setUseMagicLink(false)}
            className="w-full py-2 text-ocean-600/70 hover:text-ocean-700 text-sm font-medium transition-colors"
          >
            Use password instead
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ocean-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
              placeholder="Your password"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-3 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setUseMagicLink(true)}
            className="w-full py-2 text-ocean-600/70 hover:text-ocean-700 text-sm font-medium transition-colors"
          >
            Use magic link instead (no password)
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-ocean-600/70 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-gold-600 hover:text-gold-700 font-medium">
            Create Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
