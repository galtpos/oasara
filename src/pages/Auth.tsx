import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Step = 'email' | 'sent';

const Auth: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const { user } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from ProtectedRoute redirect or default to /start
  const from = (location.state as any)?.from || '/start';

  // If user is already logged in, redirect to intended destination
  useEffect(() => {
    if (user) {
      navigate(from);
    }
  }, [user, navigate, from]);

  // Store intended destination for magic link flow
  useEffect(() => {
    if (from) {
      localStorage.setItem('oasara-auth-redirect', from);
    }
  }, [from]);

  // Magic link handles BOTH signup and login seamlessly
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setStep('sent');
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password login for returning users who set a password
  const handlePasswordLogin = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError) {
        // If password login fails, suggest magic link
        if (authError.message.includes('Invalid login credentials')) {
          setError('Password not recognized. Try the magic link instead!');
        } else {
          setError(authError.message);
        }
      } else {
        navigate(from);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
                <h2 className="font-display text-3xl text-ocean-700 mb-2">
                  Access Your Journey
                </h2>
                <p className="text-ocean-600/70">
                  New or returning? Just enter your email.
                </p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-5">
                {/* Email field - THE ONLY REQUIRED FIELD */}
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
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-sage-50 border-2 border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all text-lg"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password Option Toggle - Hidden by default */}
                {!showPasswordOption && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordOption(true)}
                    className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                  >
                    Have a password? Sign in with password
                  </button>
                )}

                {/* Password field (optional, for returning users) */}
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordOption(false);
                          setPassword('');
                        }}
                        className="text-xs text-ocean-400 hover:text-ocean-600 mt-2"
                      >
                        Use magic link instead
                      </button>
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
                        'Continue with Email'
                      )}
                    </button>
                  )}
                </div>

                <p className="text-center text-ocean-500 text-sm">
                  We'll email you a secure link to sign in instantly.
                  <br />
                  <span className="text-ocean-400">Works for new and existing accounts.</span>
                </p>
              </form>
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
                Click the link in your email to continue to your healthcare journey.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setPassword('');
                    setShowPasswordOption(false);
                  }}
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
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>500+ Facilities</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
