import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Step = 'email' | 'sent';

const Login: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const navigate = useNavigate();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (authError) throw authError;
      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-ocean-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/">
            <h1
              className="font-display text-5xl tracking-[0.3em] mb-3"
              style={{
                background: 'linear-gradient(180deg, #D4B86A 0%, #A67C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              OASARA
            </h1>
          </Link>
          <p className="text-ocean-200 text-lg">Your Oasis for Medical Sovereignty</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl text-ocean-700 mb-2">Welcome Back</h2>
                <p className="text-ocean-600/70">Sign in to access your account</p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-5">
                {/* Email field */}
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
                    className="w-full px-4 py-3 rounded-xl bg-sage-50 border-2 border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all text-lg"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password Option Toggle */}
                {!showPasswordOption && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordOption(true)}
                    className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                  >
                    Sign in with password instead
                  </button>
                )}

                {/* Password field (optional) */}
                <AnimatePresence>
                  {showPasswordOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label htmlFor="password" className="block text-sm font-medium text-ocean-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-sage-50 border-2 border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all text-lg"
                        placeholder="Your password"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="space-y-3">
                  {password ? (
                    <button
                      type="button"
                      onClick={handlePasswordLogin}
                      disabled={loading}
                      className="w-full bg-gradient-to-b from-gold-500 to-gold-700 py-4 rounded-xl font-bold text-white text-lg shadow-[0_4px_0_#8B6914] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#8B6914] active:translate-y-[0px] active:shadow-[0_2px_0_#8B6914] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Signing In...' : 'Sign In with Password'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-b from-gold-500 to-gold-700 py-4 rounded-xl font-bold text-white text-lg shadow-[0_4px_0_#8B6914] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#8B6914] active:translate-y-[0px] active:shadow-[0_2px_0_#8B6914] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Magic Link...
                        </span>
                      ) : (
                        'Send Magic Link'
                      )}
                    </button>
                  )}
                </div>

                <p className="text-center text-ocean-500 text-sm">
                  We'll email you a secure link to sign in instantly.
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-sage-200 text-center">
                <p className="text-ocean-600/70 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-gold-600 hover:text-gold-700 font-semibold">
                    Create One
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-b from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-ocean-700 mb-3">Check Your Email</h2>
              <p className="text-ocean-600/80 text-lg mb-2">
                We've sent a magic link to:
              </p>
              <p className="font-semibold text-ocean-700 text-xl mb-6">{email}</p>
              <p className="text-ocean-500 text-sm mb-8">
                Click the link in your email to sign in instantly.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setStep('email')}
                  className="text-gold-600 hover:text-gold-700 font-semibold text-sm"
                >
                  Use a different email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center items-center gap-6 text-ocean-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Privacy First</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
