import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EarlyAccess: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-dark-base flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo/Brand */}
          <h1 className="font-serif text-6xl md:text-7xl text-champagne-gold mb-4 tracking-tight">
            OASARA
          </h1>
          <p className="text-xl text-cream/80 italic mb-8">
            Your Oasis for Medical Sovereignty
          </p>

          {/* Main Message */}
          <h2 className="font-serif text-3xl md:text-4xl text-cream mb-6">
            Join the Revolution
          </h2>
          <p className="text-lg text-cream/70 leading-relaxed mb-4">
            Be among the first to access the world's premier privacy-preserving medical tourism marketplace.
          </p>
          <p className="text-base text-cream/60 leading-relaxed">
            518 JCI-certified facilities across 39 countries. Direct access. Zero middlemen. Your sovereignty.
          </p>
        </motion.div>

        {/* Sign-up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-morphism rounded-2xl p-8 mb-8"
        >
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-champagne-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-champagne-gold mb-2">
                Welcome to the Oasis
              </h3>
              <p className="text-cream/70">
                You're on the list for early access. We'll be in touch soon.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 px-6 py-2 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream transition-colors text-sm"
              >
                Sign up another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm text-cream/80 mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-base/50 border border-cream/20 text-cream placeholder-cream/40 focus:outline-none focus:border-champagne-gold transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-cream/80 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-dark-base/50 border border-cream/20 text-cream placeholder-cream/40 focus:outline-none focus:border-champagne-gold transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full gradient-cta py-4 rounded-lg font-semibold text-dark-base text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Joining...' : 'Get Early Access'}
              </button>

              <p className="text-xs text-cream/50 text-center">
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
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-champagne-gold/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-cream font-semibold mb-1">Privacy First</h3>
            <p className="text-cream/60 text-sm">Zero-knowledge architecture powered by Zano blockchain</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-champagne-gold/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-cream font-semibold mb-1">Global Access</h3>
            <p className="text-cream/60 text-sm">518 JCI-certified facilities across 39 countries</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-champagne-gold/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-cream font-semibold mb-1">Direct Control</h3>
            <p className="text-cream/60 text-sm">No intermediaries. Your choice. Your sovereignty.</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-cream/40 text-xs italic">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EarlyAccess;
