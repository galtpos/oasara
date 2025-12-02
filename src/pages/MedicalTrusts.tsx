import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StateTrustLaw, CriteriaKey } from '../types/trustLaws';
import { stateTrustLaws, getStatesByScore } from '../data/stateTrustLaws';
import USStateTrustMap from '../components/TrustMap/USStateTrustMap';
import TrustFilters from '../components/TrustMap/TrustFilters';
import StateDetailPanel from '../components/TrustMap/StateDetailPanel';
import OnlineTrustServicesComparison from '../components/TrustServices/OnlineTrustServicesComparison';

const MedicalTrusts: React.FC = () => {
  const [selectedCriteria, setSelectedCriteria] = useState<CriteriaKey[]>([]);
  const [selectedState, setSelectedState] = useState<StateTrustLaw | null>(null);

  const topStates = getStatesByScore().slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Oasara</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/hub" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                Hub
              </Link>
              <Link to="/medical-trusts" className="text-sm font-medium text-teal-700 border-b-2 border-teal-700 pb-0.5">
                Trust Laws
              </Link>
              <Link to="/early-access" className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Join Waitlist
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-slate-800" />
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-teal-200 text-sm font-medium mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Medical Trust Planning
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Medical Trust Laws<br />
              <span className="text-teal-200">State by State Guide</span>
            </h1>
            <p className="text-lg text-teal-100/90 leading-relaxed mb-8 max-w-2xl">
              Navigate the complex landscape of medical trust laws across the United States. 
              Compare asset protection strength, tax treatment, and healthcare-specific provisions 
              to find the optimal jurisdiction for your medical trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#map" 
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Explore the Map
              </a>
              <Link 
                to="/early-access"
                className="inline-flex items-center gap-2 bg-teal-500/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-500/30 transition-colors border border-teal-400/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Get Expert Guidance
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top States Banner */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap flex-shrink-0">
              TOP JURISDICTIONS:
            </span>
            {topStates.map((state, index) => (
              <button
                key={state.stateCode}
                onClick={() => setSelectedState(state)}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 px-4 py-2 rounded-full transition-colors flex-shrink-0"
              >
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-semibold text-teal-800">{state.state}</span>
                <span className="text-sm text-teal-600">{state.overallScore.toFixed(1)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar - Filters */}
          <aside className="space-y-6">
            <TrustFilters
              selectedCriteria={selectedCriteria}
              onCriteriaChange={setSelectedCriteria}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">States with DAPT Laws</span>
                  <span className="font-bold text-teal-700">
                    {stateTrustLaws.filter(s => s.criteria.selfSettledTrusts.allowed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">No State Income Tax</span>
                  <span className="font-bold text-teal-700">
                    {stateTrustLaws.filter(s => !s.criteria.taxTreatment.hasStateTax).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Tier States</span>
                  <span className="font-bold text-teal-700">
                    {stateTrustLaws.filter(s => s.tier === 'top').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">States with Data</span>
                  <span className="font-bold text-teal-700">{stateTrustLaws.length}/50</span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Click on any state to see detailed information about its trust laws. 
                    Use the filters to focus on criteria most important to you.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Map Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Interactive Trust Law Map</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedCriteria.length === 0 
                      ? 'Showing overall favorability scores' 
                      : `Filtered by ${selectedCriteria.length} criteria`}
                  </p>
                </div>
                {selectedCriteria.length > 0 && (
                  <button
                    onClick={() => setSelectedCriteria([])}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
            <div className="aspect-[4/3] lg:aspect-[16/10]">
              <USStateTrustMap
                selectedCriteria={selectedCriteria}
                onStateSelect={setSelectedState}
                selectedState={selectedState}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Info Section */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Understanding Medical Trusts
            </h2>
            <p className="text-lg text-gray-600">
              A medical trust can help protect assets while ensuring funds are available for healthcare needs. 
              Different states offer varying levels of protection and flexibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Asset Protection</h3>
              <p className="text-gray-600">
                Domestic Asset Protection Trusts (DAPTs) allow you to be a beneficiary while protecting assets from creditors. 
                Only certain states authorize these structures.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tax Efficiency</h3>
              <p className="text-gray-600">
                States without income tax can provide significant savings on trust income. 
                Proper structuring can minimize both state and federal tax exposure.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Healthcare Planning</h3>
              <p className="text-gray-600">
                Special needs trusts and healthcare funding trusts can preserve eligibility for benefits 
                while ensuring quality medical care is accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Trust Services Comparison */}
      <OnlineTrustServicesComparison />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Plan Your Medical Trust?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Our platform connects you with qualified professionals who can help you navigate 
            the complexities of medical trust planning across jurisdictions.
          </p>
          <Link 
            to="/early-access"
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-400 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Early Access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Oasara. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 max-w-xl text-center md:text-right">
              This information is for educational purposes only and does not constitute legal, tax, or financial advice. 
              Consult qualified professionals for guidance specific to your situation.
            </p>
          </div>
        </div>
      </footer>

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

export default MedicalTrusts;

