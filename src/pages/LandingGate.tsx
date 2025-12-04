import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuth';

const SUPABASE_URL = 'https://whklrclzrtijneqdjmiy.supabase.co';
const LAUNCH_DATE = new Date('2025-12-04T18:00:00-05:00'); // Dec 4, 2025 @ 6pm ET

const LandingGate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);
  const { signInWithMagicLink, loading } = useAuthState();

  const [isLaunched, setIsLaunched] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [signupStats, setSignupStats] = useState<{
    count: number;
    milestone: number;
    spotsRemaining: number;
    percentFilled: number;
    isAlmostFull: boolean;
    isCritical: boolean;
  } | null>(null);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = LAUNCH_DATE.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsLaunched(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsLaunched(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch signup count
  const fetchSignupCount = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-signup-count?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      if (data.success) setSignupStats(data);
    } catch (err) {
      console.error('Failed to fetch signup count:', err);
    }
  };

  useEffect(() => {
    if (!isLaunched) {
      fetchSignupCount();
      const interval = setInterval(fetchSignupCount, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLaunched]);

  // Early access signup (pre-launch)
  const handleEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setEarlyAccessLoading(true);
    setError('');

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/early-access-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        setName('');
        await fetchSignupCount();
      } else {
        setError(data.message || 'Failed to join. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setEarlyAccessLoading(false);
    }
  };

  // Magic link login (post-launch)
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
      setSuccess(true);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-ocean-700 mb-2">
              {isLaunched ? 'Check Your Email' : 'You\'re on the List!'}
            </h2>
            <p className="text-ocean-600/70 mb-2">
              {isLaunched
                ? <>We sent a magic link to <strong>{email}</strong></>
                : 'We\'ll notify you when access opens.'
              }
            </p>
            {isLaunched && (
              <p className="text-ocean-500/60 text-sm mb-4">
                Click the link to access 500+ medical facilities worldwide.
              </p>
            )}
            {signupStats && !isLaunched && (
              <p className="text-sm text-gold-600 font-semibold mb-4">
                You secured spot #{signupStats.count} of {signupStats.milestone}
              </p>
            )}
            <button
              onClick={() => setSuccess(false)}
              className="inline-block px-6 py-2 rounded-lg bg-gold-100 hover:bg-gold-200 text-ocean-700 border border-gold-300 transition-colors text-sm font-medium"
            >
              {isLaunched ? 'Send Again' : 'Sign up another email'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-6xl md:text-7xl bg-gradient-to-r from-gold-500 via-gold-600 to-ocean-600 bg-clip-text text-transparent mb-4 tracking-tight">
            OASARA
          </h1>
          <p className="text-xl text-ocean-600/80 italic mb-4 font-display">
            Your Oasis for Medical Sovereignty
          </p>
          <p className="text-lg text-ocean-600/70">
            518 JCI-certified facilities across 39 countries. Direct access. Zero middlemen.
          </p>
        </motion.div>

        {/* Signup Stats - Pre-launch only */}
        {!isLaunched && signupStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className={`max-w-md mx-auto p-4 rounded-xl border-2 ${
              signupStats.isCritical ? 'bg-red-50/80 border-red-300'
                : signupStats.isAlmostFull ? 'bg-orange-50/80 border-orange-300'
                : 'bg-white/80 border-gold-300/30'
            } backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-ocean-700">
                  {signupStats.isCritical ? 'Last Spots!' : signupStats.isAlmostFull ? 'Almost Full!' : 'Limited Access'}
                </span>
                <span className="text-sm font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                  {signupStats.count}/{signupStats.milestone}
                </span>
              </div>
              <div className="w-full bg-sage-100 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signupStats.percentFilled}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${
                    signupStats.isCritical ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : signupStats.isAlmostFull ? 'bg-gradient-to-r from-orange-400 to-gold-500'
                      : 'bg-gradient-to-r from-gold-400 to-gold-600'
                  }`}
                />
              </div>
              <p className="text-xs text-ocean-600/70 text-center">
                {signupStats.isCritical ? `Only ${signupStats.spotsRemaining} spots left!`
                  : signupStats.isAlmostFull ? `Just ${signupStats.spotsRemaining} spots remaining`
                  : `Only the first ${signupStats.milestone} get early access`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Countdown - Pre-launch only */}
        {!isLaunched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center mb-3">
              <p className="text-sm text-ocean-600/60 font-medium uppercase tracking-wider">Early Access Opens In</p>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
              {['days', 'hours', 'minutes', 'seconds'].map((unit, i) => (
                <div key={unit} className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-4 shadow-lg">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                    {timeLeft[unit as keyof typeof timeLeft]}
                  </div>
                  <div className="text-xs text-ocean-600/60 uppercase tracking-wider mt-1">
                    {unit === 'minutes' ? 'Mins' : unit === 'seconds' ? 'Secs' : unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-sage-200 shadow-2xl rounded-2xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h3 className="font-display text-xl text-ocean-700 mb-2">
              {isLaunched ? 'Get Instant Access' : 'Get Early Access'}
            </h3>
            <p className="text-ocean-600/70 text-sm">
              {isLaunched
                ? 'No password required. We\'ll email you a magic link.'
                : 'Be among the first to explore.'}
            </p>
          </div>

          <form onSubmit={isLaunched ? handleMagicLink : handleEarlyAccess} className="space-y-4">
            {!isLaunched && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                placeholder="Your name (optional)"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all text-center text-lg"
              placeholder="your@email.com"
            />

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || earlyAccessLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {(loading || earlyAccessLoading) ? 'Sending...' : isLaunched ? 'Send Magic Link' : 'Get Early Access'}
            </button>

            <p className="text-xs text-ocean-500/60 text-center">
              {isLaunched
                ? 'New user? Your account is created automatically.'
                : 'No spam. No tracking. Just pure medical sovereignty updates.'}
            </p>
          </form>

          {isLaunched && (
            <div className="mt-4 pt-4 border-t border-sage-200 text-center">
              <Link to="/login" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                Prefer to use a password? Sign in here
              </Link>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="text-center p-4 rounded-xl bg-white/60 border border-sage-200 shadow-lg">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold text-sm mb-1">Privacy First</h3>
            <p className="text-ocean-600/60 text-xs">Zano blockchain</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-white/60 border border-sage-200 shadow-lg">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-gold-500 to-ocean-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold text-sm mb-1">518 Facilities</h3>
            <p className="text-ocean-600/60 text-xs">39 countries</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-white/60 border border-sage-200 shadow-lg">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold text-sm mb-1">Direct Access</h3>
            <p className="text-ocean-600/60 text-xs">No middlemen</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-ocean-600/50 text-xs italic font-display">
            "In the desert of captured healthcare, Oasara is your oasis."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingGate;
