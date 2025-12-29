import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { supabase } from '../../lib/supabase';
import { procedures, searchProcedures, getCheapestGlobalCost, getAverageGlobalCost, calculateSavings, ProcedureData } from '../../data/procedureDatabase';
import AnimatedCounter from '../PriceComparison/AnimatedCounter';

export default function SavingsCalculator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Debounced search
  const searchResults = useMemo(() => {
    return searchProcedures(searchQuery);
  }, [searchQuery]);

  // Query real-time Oasara pricing from facilities
  const { data: oasaraData } = useQuery({
    queryKey: ['oasara-pricing', selectedProcedure?.id],
    queryFn: async () => {
      if (!selectedProcedure) return null;

      // Query facilities that have this procedure
      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('procedure_pricing, popular_procedures')
        .or(`procedure_pricing.cs.{${selectedProcedure.name}},popular_procedures.cs.{${selectedProcedure.name}}`);

      if (error) {
        console.error('Error fetching facility pricing:', error);
        // Fallback to cheapest global price (for "Save UP TO" marketing)
        return {
          avgPrice: getCheapestGlobalCost(selectedProcedure),
          facilityCount: 0,
          isRealData: false,
        };
      }

      // Calculate average from real facility data
      const prices: number[] = [];
      facilities?.forEach((facility: any) => {
        // Check procedure_pricing array
        if (facility.procedure_pricing) {
          const match = facility.procedure_pricing.find(
            (p: any) => p.procedure_name?.toLowerCase().includes(selectedProcedure.name.toLowerCase())
          );
          if (match?.price) {
            prices.push(match.price);
          } else if (match?.price_min && match?.price_max) {
            prices.push((match.price_min + match.price_max) / 2);
          }
        }

        // Check popular_procedures array
        if (facility.popular_procedures) {
          const match = facility.popular_procedures.find(
            (p: any) => p.name?.toLowerCase().includes(selectedProcedure.name.toLowerCase())
          );
          if (match?.price_range) {
            // Parse "$8,000-12,000" format
            const cleaned = match.price_range.replace(/\$/g, '').replace(/,/g, '');
            if (cleaned.includes('-')) {
              const [min, max] = cleaned.split('-').map(Number);
              prices.push((min + max) / 2);
            }
          }
        }
      });

      if (prices.length > 0) {
        const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        return {
          avgPrice,
          facilityCount: prices.length,
          isRealData: true,
        };
      }

      // Fallback to cheapest global price if no facility data (for "Save UP TO" marketing)
      return {
        avgPrice: getCheapestGlobalCost(selectedProcedure),
        facilityCount: 0,
        isRealData: false,
      };
    },
    enabled: !!selectedProcedure,
  });

  const handleProcedureSelect = (procedure: ProcedureData) => {
    setSelectedProcedure(procedure);
    setSearchQuery(procedure.name);
    setShowResults(true);
  };

  const handleSeeFacilities = () => {
    if (selectedProcedure) {
      navigate(`/?specialty=${encodeURIComponent(selectedProcedure.name)}`);
    }
  };

  const oasaraPrice = oasaraData?.avgPrice || 0;
  const usPrice = selectedProcedure?.usaCostMax || 0; // Use MAX US cost for "Save UP TO" marketing
  const savings = usPrice > 0 && oasaraPrice > 0 ? calculateSavings(usPrice, oasaraPrice) : null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Headlines */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-center">
            Stop Overpaying for Healthcare
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95 text-center">
            See how much you could save by going abroad
          </p>

          {/* Calculator Box */}
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="procedure-search" className="block text-gray-900 text-lg font-semibold mb-3">
                What procedure do you need?
              </label>
              <input
                id="procedure-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(false);
                }}
                placeholder="e.g., hip replacement, dental implants, LASIK"
                className="w-full px-4 py-3 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
              />

              {/* Autocomplete Dropdown */}
              {searchQuery.length >= 2 && searchResults.length > 0 && !showResults && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {searchResults.slice(0, 8).map((procedure) => {
                    const cheapestGlobal = getCheapestGlobalCost(procedure);
                    const savingsPreview = calculateSavings(procedure.usaCostMax, cheapestGlobal); // Show MAX savings

                    return (
                      <button
                        key={procedure.id}
                        onClick={() => handleProcedureSelect(procedure)}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-900 font-semibold">{procedure.name}</div>
                            <div className="text-sm text-gray-500">{procedure.categoryTitle}</div>
                          </div>
                          <div className="text-green-600 font-bold text-sm">
                            Save UP TO ${savingsPreview.amount.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results Display */}
            {showResults && selectedProcedure && oasaraData && (
              <div className="mt-8 animate-fadeIn">
                {/* Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                  {/* US Price */}
                  <div className="text-center p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="text-sm text-red-600 font-semibold mb-2">Average US Cost</div>
                    <div className="text-3xl md:text-4xl font-bold text-red-600">
                      ${usPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center text-3xl text-gray-400 hidden md:block">
                    →
                  </div>

                  {/* Oasara Price */}
                  <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="text-sm text-green-600 font-semibold mb-2">
                      {oasaraData.isRealData ? 'Oasara Average' : 'Global Average'}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-green-600">
                      ${oasaraPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Savings Highlight */}
                {savings && (
                  <div className="bg-green-50 border-4 border-green-500 rounded-xl p-6 mb-6 text-center">
                    <div className="text-green-900 text-lg font-semibold mb-2">
                      YOU CAN SAVE UP TO
                    </div>
                    <div className="text-green-600 font-bold mb-2">
                      <AnimatedCounter
                        end={savings.amount}
                        duration={1500}
                        className="text-5xl md:text-6xl inline"
                      />
                      <span className="text-5xl md:text-6xl"> </span>
                    </div>
                    <div className="text-green-700 text-xl">
                      ({savings.percentage}% savings)
                    </div>
                  </div>
                )}

                {/* Facility Count */}
                {oasaraData.isRealData && oasaraData.facilityCount > 0 && (
                  <div className="text-center text-sm text-gray-600 mb-4">
                    ✓ Based on {oasaraData.facilityCount} verified facilities offering this procedure
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSeeFacilities}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all"
                  >
                    {oasaraData.facilityCount > 0
                      ? `See ${oasaraData.facilityCount} Facilities Offering This Price →`
                      : `Search Facilities for ${selectedProcedure.name} →`
                    }
                  </button>

                  <button
                    onClick={() => navigate('/hub')}
                    className="w-full px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all"
                  >
                    Learn More About {selectedProcedure.name}
                  </button>
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {!showResults && searchQuery.length < 2 && (
              <div className="mt-6">
                <div className="text-sm text-gray-500 mb-3">Popular searches:</div>
                <div className="flex flex-wrap gap-2">
                  {procedures.slice(0, 6).map((procedure) => (
                    <button
                      key={procedure.id}
                      onClick={() => handleProcedureSelect(procedure)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-full text-sm font-medium transition-colors"
                    >
                      {procedure.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center opacity-90">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>518 Accredited Facilities</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>10,000+ Successful Procedures</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>All-Inclusive Pricing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
