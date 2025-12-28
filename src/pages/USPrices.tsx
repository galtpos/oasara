import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/Layout/SiteHeader';
import {
  getProceduresByCategory,
  searchPrices,
  getPriceStats,
  formatPrice,
  calculateSavings,
} from '../lib/priceApi';
import { CAPTURE_TIER_CONFIG } from '../types/hospital';
import type { Procedure, HospitalPrice } from '../types/hospital';

export default function USPrices() {
  const [procedures, setProcedures] = useState<Record<string, Procedure[]>>({});
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [prices, setPrices] = useState<HospitalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalPricesIndexed: number;
    hospitalsWithPricing: number;
    proceduresCovered: number;
  } | null>(null);

  // Load procedures on mount
  useEffect(() => {
    async function loadProcedures() {
      try {
        const procs = await getProceduresByCategory();
        setProcedures(procs);

        const priceStats = await getPriceStats();
        setStats(priceStats);
      } catch (err) {
        console.error('Error loading procedures:', err);
      }
    }
    loadProcedures();
  }, []);

  // Search when procedure or state changes
  useEffect(() => {
    if (!selectedProcedure) {
      setPrices([]);
      return;
    }

    const procId = selectedProcedure; // Capture for closure

    async function search() {
      setLoading(true);
      try {
        const results = await searchPrices({
          procedureId: procId,
          state: selectedState || undefined,
          limit: 100,
          sortBy: 'cash_price',
        });
        setPrices(results);
      } catch (err) {
        console.error('Error searching prices:', err);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [selectedProcedure, selectedState]);

  const savings = calculateSavings(prices);
  const selectedProc = Object.values(procedures)
    .flat()
    .find(p => p.id === selectedProcedure);

  // Get unique states from prices
  const availableStates = [...new Set(prices.map(p => p.state))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative py-12 px-4 border-b border-sage-200 bg-gradient-to-r from-ocean-600 to-ocean-700">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
                  Compare US <span className="text-gold-400">Hospital Prices</span>
                </h1>
                <p className="text-ocean-100 text-lg">
                  The same MRI can cost <span className="text-gold-400 font-bold">$400</span> at one hospital
                  and <span className="text-gold-400 font-bold">$4,000</span> at another down the street.
                  See the real prices hospitals are legally required to publish.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3">
                <Link
                  to="/us-hospitals"
                  className="bg-gold-500 hover:bg-gold-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-white"
                >
                  View Hospital Map
                </Link>
              </div>
            </div>

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 bg-white/10 border border-white/20 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="text-gold-400 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gold-400">Price Transparency is Your Right:</span>{' '}
                  <span className="text-ocean-100">
                    Since January 2021, hospitals must publish machine-readable pricing files.
                    Only 15.7% comply—<strong className="text-gold-300">84.3% refuse to show you prices.</strong>{' '}
                    Use this data to negotiate or escape to international care.
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-sage-200 shadow-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-sage-200 bg-gradient-to-r from-sage-50 to-ocean-50/30">
            <h2 className="text-2xl font-bold text-ocean-800 mb-2">
              Compare <span className="text-gold-600">Procedure Prices</span>
            </h2>
            <p className="text-sage-600 text-sm">
              Search pricing from {stats?.hospitalsWithPricing || 0} transparent hospitals.
              Same procedure, wildly different prices.
            </p>

            {/* Stats Bar */}
            {stats && (
              <div className="flex gap-4 mt-4">
                <div className="bg-sage-100 rounded-lg px-4 py-2 border border-sage-200">
                  <div className="text-lg font-bold text-ocean-700">{stats.totalPricesIndexed.toLocaleString()}</div>
                  <div className="text-xs text-sage-500">Prices Indexed</div>
                </div>
                <div className="bg-sage-100 rounded-lg px-4 py-2 border border-sage-200">
                  <div className="text-lg font-bold text-ocean-600">{stats.hospitalsWithPricing}</div>
                  <div className="text-xs text-sage-500">Hospitals</div>
                </div>
                <div className="bg-sage-100 rounded-lg px-4 py-2 border border-sage-200">
                  <div className="text-lg font-bold text-gold-600">{stats.proceduresCovered}</div>
                  <div className="text-xs text-sage-500">Procedures</div>
                </div>
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="p-6 bg-sage-50/50">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Procedure Select */}
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Select Procedure
                </label>
                <select
                  value={selectedProcedure || ''}
                  onChange={(e) => setSelectedProcedure(e.target.value || null)}
                  className="w-full bg-white border border-sage-300 rounded-lg px-4 py-3 text-sage-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20"
                >
                  <option value="">Choose a procedure...</option>
                  {Object.entries(procedures).map(([category, procs]) => (
                    <optgroup key={category} label={category}>
                      {procs.map(proc => (
                        <option key={proc.id} value={proc.id}>
                          {proc.common_name || proc.description} ({proc.code})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-2">
                  Filter by State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white border border-sage-300 rounded-lg px-4 py-3 text-sage-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20"
                >
                  <option value="">All States</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          <AnimatePresence>
            {savings.potentialSavings && savings.savingsPercent && savings.savingsPercent > 20 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-gold-50 to-ocean-50 border-y border-gold-200"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      <svg className="w-12 h-12 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gold-700">
                        Save up to {formatPrice(savings.potentialSavings)}
                      </div>
                      <div className="text-sage-600">
                        {savings.savingsPercent}% price difference between US hospitals for{' '}
                        <span className="text-ocean-700 font-medium">{selectedProc?.common_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-6 text-sm">
                    <div>
                      <span className="text-sage-500">Lowest US:</span>{' '}
                      <span className="text-green-600 font-bold">{formatPrice(savings.lowestCash)}</span>
                    </div>
                    <div>
                      <span className="text-sage-500">Highest US:</span>{' '}
                      <span className="text-red-500 font-bold">{formatPrice(savings.highestCash)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Medical Tourism CTA */}
          {selectedProc && savings.lowestCash && savings.lowestCash > 500 && (
            <div className="mx-6 my-4 p-4 bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Escape the US Healthcare System</h3>
                  <p className="text-ocean-100 text-sm">
                    Get the same procedure at a JCI-accredited international facility for 50-80% less
                  </p>
                </div>
                <Link
                  to={`/?search=${encodeURIComponent(selectedProc.common_name || selectedProc.description)}`}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  Find International Options
                </Link>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sage-500">Searching prices...</p>
              </div>
            ) : !selectedProcedure ? (
              <div className="text-center py-12 text-sage-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Select a procedure to compare prices</p>
              </div>
            ) : prices.length === 0 ? (
              <div className="text-center py-12 text-sage-500">
                <p>No pricing data available for this procedure yet.</p>
                <p className="text-sm mt-2">We're actively indexing more hospitals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sage-600">
                    {prices.length} hospital{prices.length !== 1 ? 's' : ''} with pricing
                  </span>
                  <span className="text-sm text-sage-400">
                    Sorted by cash price (lowest first)
                  </span>
                </div>

                {prices.map((price, index) => {
                  const tierConfig = price.capture_tier
                    ? CAPTURE_TIER_CONFIG[price.capture_tier as keyof typeof CAPTURE_TIER_CONFIG]
                    : null;

                  return (
                    <motion.div
                      key={price.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`bg-white rounded-lg p-4 border ${
                        index === 0 ? 'border-green-400 ring-2 ring-green-100' : 'border-sage-200'
                      } hover:border-ocean-400 transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {index === 0 && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                                LOWEST
                              </span>
                            )}
                            {tierConfig && (
                              <span
                                className="text-xs px-2 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor: `${tierConfig.color}15`,
                                  color: tierConfig.color,
                                }}
                              >
                                {tierConfig.label}
                              </span>
                            )}
                          </div>
                          <h3 className="text-ocean-800 font-semibold mt-1">
                            {price.hospital_name}
                          </h3>
                          <p className="text-sage-500 text-sm">
                            {price.city}, {price.state} {price.zip}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-ocean-700">
                            {formatPrice(price.discounted_cash_price)}
                          </div>
                          <div className="text-xs text-sage-500">Cash Price</div>
                          {price.gross_charge && (
                            <div className="text-sm text-sage-400 mt-1">
                              <span className="line-through">{formatPrice(price.gross_charge)}</span>
                              <span className="text-sage-300 ml-1">list</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="mt-3 pt-3 border-t border-sage-100 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-sage-400">Gross Charge</div>
                          <div className="text-sage-700 font-medium">{formatPrice(price.gross_charge)}</div>
                        </div>
                        <div>
                          <div className="text-sage-400">Insurance Low</div>
                          <div className="text-sage-700 font-medium">{formatPrice(price.min_negotiated_rate)}</div>
                        </div>
                        <div>
                          <div className="text-sage-400">Insurance High</div>
                          <div className="text-sage-700 font-medium">{formatPrice(price.max_negotiated_rate)}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-sage-50 border-t border-sage-200 text-center">
            <p className="text-xs text-sage-500">
              Prices sourced from hospital Machine Readable Files (MRF) per CMS Price Transparency Rule.
              Always verify prices directly with the hospital before service.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center text-ocean-800">
          How to <span className="text-gold-600">Save Money</span> on Healthcare
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-sage-200 rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-gold-600">1</span>
            </div>
            <h3 className="text-lg font-bold text-ocean-800 mb-2">Compare Before You Go</h3>
            <p className="text-sage-600 text-sm">
              Search for your procedure above. The same service can vary by 5-10x between hospitals
              in the same city. Cash prices are often lower than insurance copays.
            </p>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-ocean-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-ocean-600">2</span>
            </div>
            <h3 className="text-lg font-bold text-ocean-800 mb-2">Ask for the Cash Price</h3>
            <p className="text-sage-600 text-sm">
              Call hospitals and ask: "What's your cash price for [procedure]?"
              Many hospitals offer 30-60% discounts for self-pay patients who pay upfront.
            </p>
          </div>

          <div className="bg-white border border-sage-200 rounded-xl p-6 shadow-card">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-red-600">3</span>
            </div>
            <h3 className="text-lg font-bold text-ocean-800 mb-2">Or Escape to Medical Tourism</h3>
            <p className="text-sage-600 text-sm">
              Even the lowest US price is often 2-5x more than international options.
              JCI-accredited facilities abroad offer the same quality at a fraction of the cost.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-sage-200">
        <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Why Pay US Prices?
          </h2>
          <p className="text-ocean-100 mb-8 max-w-xl mx-auto">
            The average US procedure costs 3-5x more than the same procedure at a
            world-class international facility. Same doctors. Same equipment. Lower prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse International Facilities
            </Link>
            <Link
              to="/us-hospitals"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/30"
            >
              Explore US Hospital Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
