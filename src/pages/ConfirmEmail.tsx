import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      // Supabase handles the token verification automatically via the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        setStatus('error');
        return;
      }

      if (session) {
        setStatus('success');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        // Check if there's a token_hash in the URL (email confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'signup') {
          // Session should be set automatically by Supabase
          const { data, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            setError(refreshError.message);
            setStatus('error');
          } else if (data.session) {
            setStatus('success');
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          // No token found, might be expired or invalid
          setError('Invalid or expired confirmation link. Please request a new one.');
          setStatus('error');
        }
      }
    };

    confirmEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/30 to-sage-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-display text-4xl bg-gradient-to-r from-gold-500 via-gold-600 to-ocean-600 bg-clip-text text-transparent tracking-tight">
              OASARA
            </h1>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-sage-200 shadow-xl rounded-2xl p-8"
        >
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">Verifying Your Email</h2>
              <p className="text-ocean-600/70">Please wait while we confirm your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">Email Confirmed!</h2>
              <p className="text-ocean-600/70 mb-4">
                Your account is now active. Redirecting to your dashboard...
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ocean-700 mb-2">Verification Failed</h2>
              <p className="text-ocean-600/70 mb-4">{error}</p>
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="block px-6 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-white font-medium hover:shadow-lg transition-all"
                >
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="block px-6 py-2 rounded-lg bg-gold-100 text-ocean-700 border border-gold-300 font-medium hover:bg-gold-200 transition-all"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
