import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrustState {
  id: string;
  name: string;
  rating: 'excellent' | 'good' | 'moderate';
  features: string[];
  description: string;
  coords: { x: number; y: number };
}

const trustFriendlyStates: TrustState[] = [
  {
    id: 'NV',
    name: 'Nevada',
    rating: 'excellent',
    features: ['No state income tax', 'Strong asset protection', 'Self-settled spendthrift trusts', 'No rule against perpetuities'],
    description: 'Top choice for asset protection trusts with strongest creditor protection laws.',
    coords: { x: 115, y: 180 }
  },
  {
    id: 'SD',
    name: 'South Dakota',
    rating: 'excellent',
    features: ['No state income tax', 'Dynasty trusts (perpetual)', 'Strong privacy laws', 'Directed trust statutes'],
    description: 'Premier dynasty trust jurisdiction with perpetual trusts and exceptional privacy.',
    coords: { x: 320, y: 120 }
  },
  {
    id: 'DE',
    name: 'Delaware',
    rating: 'excellent',
    features: ['Chancery Court expertise', 'Silent trusts allowed', 'Asset protection trusts', 'Flexible trust laws'],
    description: 'Gold standard for business trusts with specialized trust courts.',
    coords: { x: 580, y: 200 }
  },
  {
    id: 'WY',
    name: 'Wyoming',
    rating: 'excellent',
    features: ['No state income tax', 'Asset protection', 'LLC-trust combinations', 'Privacy protections'],
    description: 'Excellent for combining LLCs with trusts for maximum protection.',
    coords: { x: 220, y: 160 }
  },
  {
    id: 'AK',
    name: 'Alaska',
    rating: 'excellent',
    features: ['First domestic asset protection', 'No state income tax', 'Self-settled trusts', 'Strong creditor protection'],
    description: 'Pioneer in domestic asset protection trusts since 1997.',
    coords: { x: 80, y: 60 }
  },
  {
    id: 'TN',
    name: 'Tennessee',
    rating: 'good',
    features: ['No state income tax on trusts', 'Investment trust flexibility', 'Community property trusts', 'Modern trust code'],
    description: 'Rising star with no income tax and modern trust legislation.',
    coords: { x: 470, y: 270 }
  },
  {
    id: 'TX',
    name: 'Texas',
    rating: 'good',
    features: ['No state income tax', 'Strong homestead protection', 'Community property', 'Favorable trust taxation'],
    description: 'No income tax with strong homestead and community property laws.',
    coords: { x: 320, y: 340 }
  },
  {
    id: 'FL',
    name: 'Florida',
    rating: 'good',
    features: ['No state income tax', 'Unlimited homestead protection', 'Tenancy by entireties', 'Strong retirement protection'],
    description: 'Exceptional homestead and retirement account protection.',
    coords: { x: 560, y: 370 }
  },
  {
    id: 'NH',
    name: 'New Hampshire',
    rating: 'good',
    features: ['No income tax on trusts', 'Quiet trust provisions', 'Modern directed trust', 'Asset protection'],
    description: 'New England option with favorable trust taxation.',
    coords: { x: 605, y: 130 }
  },
  {
    id: 'MO',
    name: 'Missouri',
    rating: 'moderate',
    features: ['Domestic asset protection', 'Favorable trust laws', 'No perpetuities limit', 'Healthcare directives'],
    description: 'Midwest option with improving trust legislation.',
    coords: { x: 400, y: 240 }
  }
];

const TrustJurisdictionMap: React.FC = () => {
  const [selectedState, setSelectedState] = useState<TrustState | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'from-gold-500 to-gold-600';
      case 'good': return 'from-ocean-500 to-ocean-600';
      case 'moderate': return 'from-sage-500 to-sage-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent': return { text: 'Excellent', bg: 'bg-gold-100 text-gold-700 border-gold-300' };
      case 'good': return { text: 'Good', bg: 'bg-ocean-100 text-ocean-700 border-ocean-300' };
      case 'moderate': return { text: 'Moderate', bg: 'bg-sage-100 text-sage-700 border-sage-300' };
      default: return { text: 'Unknown', bg: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-ocean-50 via-sage-50 to-gold-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-ocean-600 text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Trust-Friendly Jurisdictions
          </span>
          <h2 className="text-3xl font-bold text-ocean-800 mb-4">
            Best States for Medical Trusts
          </h2>
          <p className="text-lg text-ocean-600/80 max-w-3xl mx-auto">
            Not all states are created equal for trusts. These jurisdictions offer the strongest
            asset protection, privacy, and tax benefits for your medical sovereignty planning.
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-600"></div>
            <span className="text-sm text-ocean-700">Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-ocean-500 to-ocean-600"></div>
            <span className="text-sm text-ocean-700">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-sage-500 to-sage-600"></div>
            <span className="text-sm text-ocean-700">Moderate</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200 shadow-xl p-8 mb-8">
          {/* Simple US Map SVG with markers */}
          <div className="relative w-full" style={{ paddingBottom: '60%' }}>
            <svg
              viewBox="0 0 700 450"
              className="absolute inset-0 w-full h-full"
              style={{ background: 'linear-gradient(135deg, #f0f7f4 0%, #e8f4f0 100%)' }}
            >
              {/* Simplified US outline */}
              <path
                d="M50,100 L150,80 L250,70 L350,65 L450,70 L550,90 L620,120 L630,180 L620,250 L600,320 L550,380 L450,400 L350,410 L250,400 L150,380 L80,320 L60,250 L50,180 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* State markers */}
              {trustFriendlyStates.map((state) => (
                <g key={state.id}>
                  {/* Pulse animation for excellent states */}
                  {state.rating === 'excellent' && (
                    <circle
                      cx={state.coords.x}
                      cy={state.coords.y}
                      r="20"
                      fill="none"
                      stroke="#D4B86A"
                      strokeWidth="2"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Main marker */}
                  <circle
                    cx={state.coords.x}
                    cy={state.coords.y}
                    r="16"
                    className={`cursor-pointer transition-all duration-200 ${
                      hoveredState === state.id ? 'opacity-100' : 'opacity-90'
                    }`}
                    fill={`url(#gradient-${state.rating})`}
                    stroke="white"
                    strokeWidth="3"
                    filter="url(#shadow)"
                    onMouseEnter={() => setHoveredState(state.id)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedState(state)}
                    style={{ transform: hoveredState === state.id ? 'scale(1.2)' : 'scale(1)', transformOrigin: `${state.coords.x}px ${state.coords.y}px` }}
                  />

                  {/* State label */}
                  <text
                    x={state.coords.x}
                    y={state.coords.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {state.id}
                  </text>
                </g>
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4B86A" />
                  <stop offset="100%" stopColor="#B8923A" />
                </linearGradient>
                <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2A6B72" />
                  <stop offset="100%" stopColor="#1F525A" />
                </linearGradient>
                <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5B9AA0" />
                  <stop offset="100%" stopColor="#4A8A90" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>
            </svg>
          </div>

          {/* Click instruction */}
          <p className="text-center text-sm text-ocean-500 mt-4">
            Click any state marker to see details
          </p>
        </div>

        {/* State Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFriendlyStates.map((state) => {
            const badge = getRatingBadge(state.rating);
            return (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/80 backdrop-blur-sm rounded-xl border-2 transition-all cursor-pointer ${
                  selectedState?.id === state.id
                    ? 'border-gold-400 shadow-lg ring-2 ring-gold-200'
                    : 'border-sage-200 hover:border-ocean-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedState(state)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRatingColor(state.rating)} flex items-center justify-center text-white font-bold shadow-md`}>
                        {state.id}
                      </div>
                      <h3 className="font-bold text-ocean-800">{state.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>

                  <p className="text-sm text-ocean-600 mb-3">{state.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {state.features.slice(0, 2).map((feature, i) => (
                      <span key={i} className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                    {state.features.length > 2 && (
                      <span className="text-xs text-ocean-500">+{state.features.length - 2} more</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected State Detail Modal */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ocean-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedState(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getRatingColor(selectedState.rating)} px-6 py-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {selectedState.id}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedState.name}</h3>
                        <span className="text-white/80 text-sm capitalize">{selectedState.rating} for Trusts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedState(null)}
                      className="text-white/80 hover:text-white p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-ocean-700 mb-6">{selectedState.description}</p>

                  <h4 className="font-semibold text-ocean-800 mb-3">Key Features</h4>
                  <ul className="space-y-2 mb-6">
                    {selectedState.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-ocean-700">
                        <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                    <p className="text-sm text-ocean-600">
                      <strong>Note:</strong> Consult with a qualified attorney in {selectedState.name} to understand
                      how these laws apply to your specific situation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why Jurisdiction Matters */}
        <div className="mt-12 bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Why Jurisdiction Matters for Medical Trusts</h3>
              <p className="text-ocean-100">
                The state where you establish your trust determines the legal protections available.
                For medical sovereignty planning, consider:
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Asset Protection
              </h4>
              <p className="text-sm text-ocean-100">
                Protect medical funds from creditors and lawsuits. Self-settled spendthrift trusts available in select states.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Privacy
              </h4>
              <p className="text-sm text-ocean-100">
                Keep medical decisions private. Silent trust provisions prevent disclosure of trust terms.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tax Benefits
              </h4>
              <p className="text-sm text-ocean-100">
                No state income tax on trust earnings in Nevada, South Dakota, Wyoming, Texas, and others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustJurisdictionMap;
