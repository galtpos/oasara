import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import OasisGuide from './OasisGuide';

const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated - use getSession (cached) not getUser (network)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      setIsChecking(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClick = () => {
    if (isAuthenticated) {
      setIsOpen(true);
    } else {
      // Redirect to auth
      navigate('/auth');
    }
  };

  // Don't show button while checking auth
  if (isChecking) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[9998]"
          >
            <button
              onClick={handleClick}
              className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-lg hover:shadow-gold hover:scale-105 transition-all"
              aria-label={isAuthenticated ? "Open Quick Q&A" : "Sign up to get started"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-sm font-semibold">
                {isAuthenticated ? 'Quick Q&A' : 'Get Started'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel - Only show for authenticated users */}
      {isAuthenticated && (
        <OasisGuide isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default ChatButton;
