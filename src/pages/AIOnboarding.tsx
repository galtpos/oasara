import React from 'react';
import { motion } from 'framer-motion';
import OnboardingChatbot from '../components/Onboarding/OnboardingChatbot';

const AIOnboarding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Hero Section - Minimal */}
      <div className="pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-display text-ocean-800 mb-3">
            Let's Talk About Your Care
          </h1>
          <p className="text-lg text-ocean-600 max-w-2xl mx-auto px-4">
            No forms. No hassle. Just tell us what you're looking for, and we'll help you find the perfect option.
          </p>
        </motion.div>
      </div>

      {/* Chatbot Container */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-[calc(100vh-200px)] min-h-[600px]"
        >
          <OnboardingChatbot />
        </motion.div>
      </div>

      {/* Trust Indicators - Below chatbot */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-ocean-600"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>JCI-Accredited Facilities</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your Data is Private</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save 40-80% vs US Prices</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIOnboarding;
