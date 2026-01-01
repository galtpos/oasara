import React from 'react';
import { motion } from 'framer-motion';
import OnboardingChatbot from '../components/Onboarding/OnboardingChatbot';
import SiteHeader from '../components/Layout/SiteHeader';

const AIOnboarding: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Site Header for Navigation */}
      <SiteHeader />

      {/* Main Content - Flexbox layout for proper scrolling */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Hero Section - Compact */}
        <div className="pt-6 pb-3 text-center flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-display text-ocean-800 mb-2">
              Let's Talk About Your Care
            </h1>
            <p className="text-base text-ocean-600 max-w-2xl mx-auto px-4">
              No forms. Just tell us what you're looking for.
            </p>
          </motion.div>
        </div>

        {/* Chatbot Container - Takes remaining space */}
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 pb-4 min-h-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full"
          >
            <OnboardingChatbot />
          </motion.div>
        </div>

        {/* Trust Indicators - Compact footer */}
        <div className="flex-shrink-0 py-4 border-t border-sage-200 bg-white/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-ocean-600 px-4"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>JCI-Accredited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save 40-80%</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AIOnboarding;
