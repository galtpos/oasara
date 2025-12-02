import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Launch date - update this to your actual launch date
const LAUNCH_DATE = new Date('2025-01-15T00:00:00Z');

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SignupStats {
  count: number;
  milestone: number;
  spotsRemaining: number;
  percentFilled: number;
  isAlmostFull: boolean;
  isCritical: boolean;
}

const EarlyAccess: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = LAUNCH_DATE.getTime();
      const difference = target - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch signup count on mount and after successful signup
  useEffect(() => {
    fetchSignupCount();
  }, [success]);

  const fetchSignupCount = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/get-signup-count`
      );
      const data = await response.json();
      if (data.success) {
        setSignupStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch signup count:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the Supabase Edge Function
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/early-access-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, name }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        setName('');
      } else {
        setError(data.message || 'Failed to join early access. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Early access signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo/Brand */}
          <h1 className="font-display text-6xl md:text-7xl bg-gradient-to-r from-gold-500 via-gold-600 to-ocean-600 bg-clip-text text-transparent mb-4 tracking-tight">
            OASARA
          </h1>
          <p className="text-xl text-ocean-600/80 italic mb-8 font-display">
            Your Oasis for Medical Sovereignty
          </p>

          {/* Main Message */}
          <h2 className="font-display text-3xl md:text-4xl text-ocean-700 mb-6">
            Join the Revolution
          </h2>
          <p className="text-lg text-ocean-600/70 leading-relaxed mb-4">
            Be among the first to access the world's premier privacy-preserving medical tourism marketplace.
          </p>
          <p className="text-base text-ocean-600/60 leading-relaxed">
            518 JCI-certified facilities across 39 countries. Direct access. Zero middlemen. Your sovereignty.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <p className="text-center text-sm text-ocean-600/60 uppercase tracking-widest mb-4">
            Early Access Opens In
          </p>
          <div className="flex justify-center gap-4">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Mins' },
              { value: countdown.seconds, label: 'Secs' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="w-20 h-20 bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-3xl font-bold text-gold-600">{item.value}</span>
                <span className="text-xs text-ocean-600/60 uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Signup Count Progress */}
        {signupStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-ocean-700 font-semibold">
                  {signupStats.count} of {signupStats.milestone} spots claimed
                </span>
                <span className={`text-sm font-medium ${signupStats.isCritical ? 'text-red-500' : signupStats.isAlmostFull ? 'text-gold-600' : 'text-ocean-600/60'}`}>
                  {signupStats.spotsRemaining} remaining
                </span>
              </div>
              <div className="w-full bg-sage-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signupStats.percentFilled}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    signupStats.isCritical
                      ? 'bg-gradient-to-r from-red-400 to-red-500'
                      : signupStats.isAlmostFull
                        ? 'bg-gradient-to-r from-gold-400 to-gold-600'
                        : 'bg-gradient-to-r from-gold-400 to-gold-600'
                  }`}
                />
              </div>
              {signupStats.isCritical && (
                <p className="text-center text-sm text-red-500 mt-2 font-medium">
                  Almost full! Only {signupStats.spotsRemaining} spots left in this batch.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading state for signup stats */}
        {statsLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-white/60 backdrop-blur-sm border border-sage-200 rounded-xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-sage-200 rounded w-48 mb-3"></div>
              <div className="h-3 bg-sage-200 rounded-full"></div>
            </div>
          </motion.div>
        )}

        {/* Sign-up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-sage-200 shadow-2xl rounded-2xl p-8 mb-8"
        >
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-ocean-700 mb-2">
                Welcome to the Oasis
              </h3>
              <p className="text-ocean-600/70">
                You're on the list for early access. We'll be in touch soon.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 px-6 py-2 rounded-lg bg-gold-100 hover:bg-gold-200 text-ocean-700 border border-gold-300 transition-colors text-sm font-medium"
              >
                Sign up another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ocean-700 mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ocean-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-sage-50 border border-sage-200 text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Joining...' : 'Get Early Access'}
              </button>

              <p className="text-xs text-ocean-500/60 text-center">
                No spam. No tracking. Just pure medical sovereignty updates.
              </p>
            </form>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center p-6 rounded-xl bg-white/60 border border-sage-200 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold mb-1">Privacy First</h3>
            <p className="text-ocean-600/60 text-sm">Zero-knowledge architecture powered by Zano blockchain</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/60 border border-sage-200 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-500 to-ocean-500 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold mb-1">Global Access</h3>
            <p className="text-ocean-600/60 text-sm">518 JCI-certified facilities across 39 countries</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/60 border border-sage-200 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-ocean-700 font-semibold mb-1">Direct Control</h3>
            <p className="text-ocean-600/60 text-sm">No intermediaries. Your choice. Your sovereignty.</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-ocean-600/50 text-xs italic font-display">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EarlyAccess;
