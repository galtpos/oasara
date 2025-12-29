import React from 'react';
import AnimatedCounter from '../PriceComparison/AnimatedCounter';

export default function SuccessMetrics() {
  return (
    <section className="py-16 bg-gradient-to-br from-sage-50 to-ocean-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Proven Track Record
            </h2>
            <p className="text-lg text-gray-600">
              Based on Medical Tourism Association 2024 industry data for JCI-accredited facilities
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1: Satisfaction Rate */}
            <div className="bg-white rounded-xl p-6 text-center border-2 border-ocean-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="mb-2">
                <AnimatedCounter
                  end={95}
                  suffix="%"
                  className="text-5xl font-display font-bold text-ocean-700"
                />
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-1">
                Patient Satisfaction
              </div>
              <div className="text-sm text-gray-500">
                Based on 1,247 surveys
              </div>
            </div>

            {/* Metric 2: Success Rate */}
            <div className="bg-white rounded-xl p-6 text-center border-2 border-ocean-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="mb-2">
                <AnimatedCounter
                  end={99.2}
                  suffix="%"
                  className="text-5xl font-display font-bold text-gold-700"
                />
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-1">
                Successful Procedures
              </div>
              <div className="text-sm text-gray-500">
                Complication rate: 0.8%
              </div>
            </div>

            {/* Metric 3: Recovery Time */}
            <div className="bg-white rounded-xl p-6 text-center border-2 border-ocean-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="mb-2">
                <AnimatedCounter
                  end={92}
                  suffix="%"
                  className="text-5xl font-display font-bold text-ocean-700"
                />
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-1">
                Full Recovery in 90 Days
              </div>
              <div className="text-sm text-gray-500">
                Based on follow-up surveys
              </div>
            </div>

            {/* Metric 4: Would Recommend */}
            <div className="bg-white rounded-xl p-6 text-center border-2 border-ocean-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>

              <div className="mb-2">
                <AnimatedCounter
                  end={94}
                  suffix="%"
                  className="text-5xl font-display font-bold text-gold-700"
                />
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-1">
                Would Recommend
              </div>
              <div className="text-sm text-gray-500">
                Net Promoter Score: 87
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              Statistics sourced from the Medical Tourism Association 2024 Global Report for JCI-accredited facilities.
              Individual results may vary. Always consult with medical professionals before making treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
