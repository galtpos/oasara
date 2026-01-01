import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatHero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section className="bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Value Proposition */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-white mb-4 leading-tight">
          Exit the Healthcare System
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10">
          Save 70-90% on world-class care abroad
        </p>

        {/* Signup CTA Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-display text-ocean-800 mb-3">
              Your Personal Healthcare Guide
            </h2>
            <p className="text-ocean-600 text-lg">
              Tell us what you need. We'll find the best facilities, compare prices, and guide you every step of the way.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-ocean-700 font-medium">AI-Powered Matching</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-ocean-700 font-medium">Save 70-90%</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm text-ocean-700 font-medium">100% Private</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="w-full py-4 px-8 bg-gradient-to-b from-gold-500 to-gold-700 text-white text-lg font-semibold rounded-xl shadow-[0_4px_0_#8B6914,0_6px_16px_rgba(139,105,20,0.3)] hover:translate-y-[-2px] active:translate-y-0 active:shadow-[0_2px_0_#8B6914] transition-all"
          >
            Get Started Free
          </button>

          <p className="text-ocean-500 text-sm mt-4">
            No credit card required. Just your email.
          </p>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>500+ JCI-Accredited Facilities</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>39 Countries</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatHero;
