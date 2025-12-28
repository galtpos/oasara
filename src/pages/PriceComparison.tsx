import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/Layout/SiteHeader';
import HospitalSearch from '../components/PriceComparison/HospitalSearch';
import ComparisonTable from '../components/PriceComparison/ComparisonTable';
import ChatbotCTA from '../components/PriceComparison/ChatbotCTA';
import AnimatedCounter from '../components/PriceComparison/AnimatedCounter';
import { Hospital } from '../types/hospital';

export default function PriceComparison() {
  const [searchResults, setSearchResults] = useState<Hospital | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-200 uppercase tracking-wide text-sm font-semibold mb-3">
              US Hospital Price Transparency
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The Truth About What You're Paying
            </h1>

            {/* Shocking Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-2">Mayo Clinic</div>
                  <div className="text-5xl font-bold">$52,000</div>
                  <div className="text-sm mt-2 opacity-75">Hip Replacement</div>
                </div>

                <div className="text-3xl font-bold opacity-75">vs</div>

                <div className="text-center">
                  <div className="text-sm opacity-90 mb-2">Bangkok Hospital</div>
                  <div className="text-5xl font-bold">$8,000</div>
                  <div className="text-sm mt-2 opacity-75">Same JCI Accreditation</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-3xl font-bold text-green-300">
                  You'd save: $44,000 (85%)
                </div>
              </div>
            </div>

            <p className="text-xl opacity-95">
              Search your local hospital below to see YOUR potential savings
            </p>
          </div>
        </div>
      </section>

      {/* Hospital Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Find Your Local Hospital
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Search by hospital name, city, or ZIP code
            </p>

            <HospitalSearch onResults={setSearchResults} />
          </div>
        </div>
      </section>

      {/* Static Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Common Procedures: Price Comparison
              </h2>
              <p className="text-gray-600">
                See how much you could save on these popular procedures
              </p>
            </div>

            <ComparisonTable />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                * All prices are all-inclusive (surgery + hospital stay + medications + follow-up).
                <br />
                US prices are national averages from Healthcare Bluebook 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot CTA */}
      <ChatbotCTA />

      {/* Final CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Save Thousands on Your Procedure?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse 518 JCI-accredited facilities worldwide
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
            >
              Browse Facilities →
            </Link>
            <Link
              to="/hub"
              className="px-8 py-4 bg-white text-teal-600 border-2 border-teal-600 rounded-lg font-semibold text-lg hover:bg-teal-50 transition-all"
            >
              Learn About Medical Tourism
            </Link>
          </div>

          {/* Trust Signals - Oasara Branded */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-sage-50 to-ocean-50 rounded-xl p-6 border-2 border-ocean-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-ocean-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <AnimatedCounter end={518} className="font-display text-3xl font-bold text-ocean-700" />
              </div>
              <div className="text-ocean-800 font-semibold">Accredited Facilities</div>
              <div className="text-sm text-sage-600 mt-1">JCI-certified worldwide</div>
            </div>

            <div className="bg-gradient-to-br from-gold-50 to-sage-50 rounded-xl p-6 border-2 border-gold-300 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <AnimatedCounter end={10000} suffix="+" className="font-display text-3xl font-bold text-gold-700" />
              </div>
              <div className="text-ocean-800 font-semibold">Successful Procedures</div>
              <div className="text-sm text-sage-600 mt-1">Patient testimonials</div>
            </div>

            <div className="bg-gradient-to-br from-ocean-50 to-sage-100 rounded-xl p-6 border-2 border-ocean-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-ocean-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <AnimatedCounter end={39} className="font-display text-3xl font-bold text-ocean-700" />
              </div>
              <div className="text-ocean-800 font-semibold">Countries</div>
              <div className="text-sm text-sage-600 mt-1">Crypto payments accepted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-12 border-t border-sage-200 bg-sage-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sage-500 text-base italic max-w-3xl mx-auto leading-relaxed">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely, choices bloom abundantly, and every seeker finds their path to healing."
          </p>
          <p className="text-sage-400 text-sm mt-6">
            Privacy-preserving medical marketplace. Your sovereignty. Your choice.
          </p>
        </div>
      </footer>
    </div>
  );
}
