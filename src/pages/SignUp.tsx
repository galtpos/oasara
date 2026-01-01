import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const { user } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from ProtectedRoute redirect
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
          data: { name: name || undefined }
        }
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignup = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: { name: name || undefined }
        }
      });

      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Success state - check email
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white shadow-2xl border border-sage-200 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-b from-gold-500 to-gold-700 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-ocean-700 mb-3 tracking-wide">
              Check Your Email
            </h2>
            <p className="text-ocean-600/70 mb-2">
              We sent a magic link to
            </p>
            <p className="text-ocean-700 font-semibold text-lg mb-6">{email}</p>
            <p className="text-ocean-600/50 text-sm mb-8">
              Click the link to access 518 JCI-certified medical facilities worldwide.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setName('');
                setPassword('');
                setShowPasswordOption(false);
              }}
              className="px-8 py-3 rounded-md bg-sage-100 hover:bg-sage-200 text-ocean-700 border border-sage-200 transition-all text-sm font-medium"
            >
              Use Different Email
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-6 px-6 border-b border-sage-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <h1
              className="font-display text-3xl tracking-[0.5em]"
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
          <div className="text-ocean-600 text-sm font-medium">
            Medical Sovereignty Platform
          </div>
        </div>
      </header>

      {/* Hero Stats Bar - Ocean Teal */}
      <div className="bg-ocean-600 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3 bg-white/15 border-2 border-white/25 rounded-lg px-5 py-2">
              <span className="font-display text-3xl font-black text-gold-300">518</span>
              <span className="text-white/80 text-sm">JCI Facilities</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 border-2 border-white/25 rounded-lg px-5 py-2">
              <span className="font-display text-3xl font-black text-gold-300">39</span>
              <span className="text-white/80 text-sm">Countries</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 border-2 border-white/25 rounded-lg px-5 py-2">
              <span className="font-display text-3xl font-black text-gold-300">50-90%</span>
              <span className="text-white/80 text-sm">Savings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Marketing Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              US Healthcare is Broken
            </div>

            <h2 className="font-display text-5xl lg:text-6xl text-ocean-700 leading-tight mb-6 tracking-wide">
              Escape the
              <span className="block bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent">
                Healthcare Cartel
              </span>
            </h2>

            <p className="text-xl text-ocean-600/80 mb-8 leading-relaxed">
              Americans pay <span className="text-red-600 font-semibold">3-10x more</span> for the same procedures.
              Insurance premiums are up <span className="text-red-600 font-semibold">47%</span> in 5 years.
              The system is designed to extract your wealth.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-gold-500 to-gold-700 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-ocean-700 font-semibold">518 JCI-Certified Facilities</div>
                  <div className="text-ocean-600/60 text-sm">39 countries, same quality as US hospitals</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-ocean-700 font-semibold">Save 50-90% on Procedures</div>
                  <div className="text-ocean-600/60 text-sm">$6,000 knee replacement vs $50,000 in the US</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg border border-sage-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-ocean-500 to-ocean-700 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-ocean-700 font-semibold">Privacy-Preserving Payments</div>
                  <div className="text-ocean-600/60 text-sm">Zano blockchain for financial sovereignty</div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white shadow-2xl border border-sage-200 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl text-ocean-700 mb-2 tracking-wide">
                  Join the Revolution
                </h3>
                <p className="text-ocean-600/60">
                  No password needed. We'll send you a magic link.
                </p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-ocean-700 text-sm font-medium mb-2">
                    Name <span className="text-ocean-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-md bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 transition-all text-lg"
                    placeholder="What should we call you?"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-ocean-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-md bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 transition-all text-lg"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password Option Toggle */}
                <AnimatePresence>
                  {!showPasswordOption && (
                    <motion.button
                      type="button"
                      onClick={() => setShowPasswordOption(true)}
                      className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      + Add a password (optional)
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Password field (optional, progressive) */}
                <AnimatePresence>
                  {showPasswordOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label htmlFor="password" className="block text-ocean-700 text-sm font-medium mb-2">
                        Password <span className="text-ocean-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        className="w-full px-5 py-4 rounded-md bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/50 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 transition-all text-lg"
                        placeholder="Min 6 characters (or skip for magic link)"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {password ? (
                  <button
                    type="button"
                    onClick={handlePasswordSignup}
                    disabled={loading}
                    className="w-full bg-gradient-to-b from-gold-500 to-gold-700 py-4 rounded-md font-semibold text-white text-lg transition-all hover:translate-y-[-2px] shadow-[0_4px_0_#8B6914,0_6px_16px_rgba(139,105,20,0.3)] active:translate-y-0 active:shadow-[0_2px_0_#8B6914] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-b from-gold-500 to-gold-700 py-4 rounded-md font-semibold text-white text-lg transition-all hover:translate-y-[-2px] shadow-[0_4px_0_#8B6914,0_6px_16px_rgba(139,105,20,0.3)] active:translate-y-0 active:shadow-[0_2px_0_#8B6914] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Magic Link'
                    )}
                  </button>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-sage-200">
                <p className="text-ocean-600/50 text-xs text-center mb-4">
                  Your email is used for:
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-sage-50 border border-sage-100">
                    <svg className="w-5 h-5 text-gold-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-ocean-700 text-xs font-medium">Bounty Rewards</div>
                  </div>
                  <div className="p-3 rounded-lg bg-sage-50 border border-sage-100">
                    <svg className="w-5 h-5 text-ocean-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="text-ocean-700 text-xs font-medium">Community</div>
                  </div>
                  <div className="p-3 rounded-lg bg-sage-50 border border-sage-100">
                    <svg className="w-5 h-5 text-emerald-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="text-ocean-700 text-xs font-medium">Updates</div>
                  </div>
                </div>
              </div>

              <p className="text-ocean-600/40 text-xs text-center mt-6">
                No spam. No tracking. Just medical sovereignty.
              </p>

              <div className="mt-6 text-center">
                <p className="text-ocean-600/60 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Price Comparison Footer */}
      <footer className="bg-sage-50 py-8 border-t border-sage-200">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="font-display text-center text-ocean-700 text-lg mb-6 tracking-wide">
            See What You Could Save
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="bg-white rounded-lg border border-sage-200 p-4 shadow-sm">
              <div className="text-ocean-600/60 text-xs uppercase tracking-wider mb-2">Hip Replacement</div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-500 line-through text-sm">$40,000 US</span>
                <span className="text-emerald-600 font-bold text-lg">$12,000</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-sage-200 p-4 shadow-sm">
              <div className="text-ocean-600/60 text-xs uppercase tracking-wider mb-2">Dental Implants</div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-500 line-through text-sm">$5,000 US</span>
                <span className="text-emerald-600 font-bold text-lg">$800</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-sage-200 p-4 shadow-sm">
              <div className="text-ocean-600/60 text-xs uppercase tracking-wider mb-2">Heart Bypass</div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-500 line-through text-sm">$150,000 US</span>
                <span className="text-emerald-600 font-bold text-lg">$25,000</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-sage-200 p-4 shadow-sm">
              <div className="text-ocean-600/60 text-xs uppercase tracking-wider mb-2">Knee Replacement</div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-red-500 line-through text-sm">$50,000 US</span>
                <span className="text-emerald-600 font-bold text-lg">$6,000</span>
              </div>
            </div>
          </div>
          <p className="text-center text-ocean-600/50 text-sm mt-6">
            Your Oasis for Medical Sovereignty
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
