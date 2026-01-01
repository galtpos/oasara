import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ConfirmEmail: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const processAuth = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');

      // Check for errors first
      if (errorParam) {
        setError(errorDescription || errorParam);
        setStatus('error');
        return;
      }

      // Get stored redirect destination (from signup flow)
      // Default to /my-journey - it redirects to /start if no journeys exist
      const redirectTo = localStorage.getItem('oasara-auth-redirect') || '/my-journey';

      // Must have access token
      if (!accessToken) {
        // Maybe already logged in?
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          localStorage.removeItem('oasara-auth-redirect');
          window.location.replace(redirectTo);
          return;
        }
        setError('No access token found. Please request a new magic link.');
        setStatus('error');
        return;
      }

      // Check if token is expired before even trying
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload.exp && Date.now() > payload.exp * 1000) {
          setError('This magic link has expired. Please request a new one.');
          setStatus('error');
          return;
        }
      } catch {
        // If we can't parse, continue anyway
      }

      // Set the session with 5s timeout (setSession can hang on bad tokens)
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const result = await Promise.race([
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          }),
          timeout
        ]);

        const { data, error: sessionError } = result as any;

        if (sessionError) {
          setError(sessionError.message);
          setStatus('error');
          return;
        }

        if (data?.session) {
          setStatus('success');
          window.history.replaceState(null, '', window.location.pathname);
          localStorage.removeItem('oasara-auth-redirect');
          window.location.replace(redirectTo);
        } else {
          setError('Failed to establish session. Please try again.');
          setStatus('error');
        }
      } catch (err: any) {
        if (err.message === 'timeout') {
          setError('Link expired or invalid. Please request a new magic link.');
        } else {
          setError(err.message || 'Authentication failed');
        }
        setStatus('error');
      }
    };

    processAuth();
  }, []);

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
