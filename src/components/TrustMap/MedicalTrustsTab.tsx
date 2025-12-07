import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StateTrustLaw, CriteriaKey } from '../../types/trustLaws';
import { stateTrustLaws, getStatesByScore } from '../../data/stateTrustLaws';
import USStateTrustMap from './USStateTrustMap';
import TrustFilters from './TrustFilters';
import StateDetailPanel from './StateDetailPanel';

const MedicalTrustsTab: React.FC = () => {
  const [selectedCriteria, setSelectedCriteria] = useState<CriteriaKey[]>([]);
  const [selectedState, setSelectedState] = useState<StateTrustLaw | null>(null);

  const topStates = getStatesByScore().slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 min-h-[calc(100vh-200px)]">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ocean-600 via-ocean-700 to-slate-800 py-10">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-teal-200 text-sm font-medium mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Medical Trust Planning
              </span>
              <h2 className="text-3xl font-bold text-white mb-2">
                State-by-State Trust Law Guide
              </h2>
              <p className="text-teal-100/80 max-w-xl">
                Compare asset protection, tax treatment, and healthcare provisions across all 50 states 
                to find the optimal jurisdiction for your medical trust.
              </p>
            </div>

            {/* Top States Quick Access */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-white/60 text-xs uppercase tracking-wide mr-2">Top Rated:</span>
              {topStates.slice(0, 3).map((state, index) => (
                <button
                  key={state.stateCode}
                  onClick={() => setSelectedState(state)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-gold-400 text-ocean-900 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-white text-sm font-medium">{state.stateCode}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Filters */}
          <aside className="space-y-4">
            <TrustFilters
              selectedCriteria={selectedCriteria}
              onCriteriaChange={setSelectedCriteria}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">DAPT States</span>
                  <span className="font-bold text-ocean-600">
                    {stateTrustLaws.filter(s => s.criteria.selfSettledTrusts.allowed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">No Income Tax</span>
                  <span className="font-bold text-ocean-600">
                    {stateTrustLaws.filter(s => !s.criteria.taxTreatment.hasStateTax).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Top Tier</span>
                  <span className="font-bold text-ocean-600">
                    {stateTrustLaws.filter(s => s.tier === 'top').length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Data Coverage</span>
                  <span className="font-bold text-ocean-600">{stateTrustLaws.length}/50</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm mb-1">How to Use</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Click any state on the map to view detailed trust law information. 
                    Use filters to compare states on specific criteria.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Map Container */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-5 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Interactive Trust Law Map</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedCriteria.length === 0 
                      ? 'Showing overall favorability scores' 
                      : `Filtered by ${selectedCriteria.length} criteria`}
                  </p>
                </div>
                {selectedCriteria.length > 0 && (
                  <button
                    onClick={() => setSelectedCriteria([])}
                    className="text-xs text-ocean-600 hover:text-ocean-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                )}
              </div>
            </div>
            <div className="aspect-[4/3] lg:aspect-[16/9]">
              <USStateTrustMap
                selectedCriteria={selectedCriteria}
                onStateSelect={setSelectedState}
                selectedState={selectedState}
              />
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Asset Protection</h3>
            <p className="text-sm text-gray-600">
              DAPTs allow you to be a beneficiary while protecting assets from creditors in select states.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tax Efficiency</h3>
            <p className="text-sm text-gray-600">
              States without income tax provide significant savings on trust income and distributions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Healthcare Planning</h3>
            <p className="text-sm text-gray-600">
              Special needs trusts preserve benefit eligibility while ensuring quality medical care.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-800 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>Legal Disclaimer:</strong> This information is for educational purposes only and does not constitute legal, tax, or financial advice. 
              Trust and estate laws are complex and subject to change. Always consult with a qualified attorney and tax professional.
            </span>
          </p>
        </div>
      </div>

      {/* State Detail Panel */}
      {selectedState && (
        <StateDetailPanel
          state={selectedState}
          onClose={() => setSelectedState(null)}
        />
      )}
    </div>
  );
};

export default MedicalTrustsTab;

