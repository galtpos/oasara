import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ConfirmEmail: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for error in URL hash (Supabase puts errors there)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      setStatus('error');
      return;
    }

    // Get redirect destination
    const redirectTo = localStorage.getItem('oasara-auth-redirect') || '/my-journey';

    // Check if already logged in (Supabase auto-detects URL token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
        localStorage.removeItem('oasara-auth-redirect');
        window.history.replaceState(null, '', window.location.pathname);
        window.location.replace(redirectTo);
      }
    });

    // Listen for auth state change (triggered when Supabase processes URL token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        localStorage.removeItem('oasara-auth-redirect');
        window.history.replaceState(null, '', window.location.pathname);
        window.location.replace(redirectTo);
      }
    });

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (status === 'verifying') {
        setError('Sign-in timed out. Please request a new magic link.');
        setStatus('error');
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [status]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1
              className="font-display text-4xl tracking-[0.3em]"
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl border border-sage-200 rounded-2xl p-8"
        >
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-b from-gold-500 to-gold-700 flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">Signing You In</h2>
              <p className="text-ocean-600/70">Please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">You're In!</h2>
              <p className="text-ocean-600/70 mb-4">
                Welcome to OASARA. Redirecting...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-b from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">Verification Failed</h2>
              <p className="text-ocean-600/70 mb-6">{error}</p>
              <Link
                to="/auth"
                className="inline-block px-6 py-3 rounded-md bg-gradient-to-b from-gold-500 to-gold-700 text-white font-medium shadow-[0_4px_0_#8B6914] hover:translate-y-[-2px] transition-all"
              >
                Request New Link
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
