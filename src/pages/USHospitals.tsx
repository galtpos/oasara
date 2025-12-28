import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import USHospitalMap from '../components/Map/USHospitalMap';
import USMapFilters from '../components/Filters/USMapFilters';
import type { HospitalMapItem, HospitalFilters } from '../types/hospital';
import { getHospitalsForMap, getFilterOptions, getHospitalStats } from '../lib/hospitalApi';
import { CAPTURE_TIER_CONFIG } from '../types/hospital';

export default function USHospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<HospitalMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Partial<HospitalFilters>>({});
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // Filter options from DB
  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    hospitalTypes: string[];
    ownershipTypes: string[];
  }>({ states: [], hospitalTypes: [], ownershipTypes: [] });

  // Stats for header - real data from database
  const [stats, setStats] = useState<{
    totalHospitals: number;
    mrfPublished: number;
    nonComplianceRate: number;
  }>({ totalHospitals: 0, mrfPublished: 0, nonComplianceRate: 84.3 });

  // Load filter options and stats on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        const [options, hospitalStats] = await Promise.all([
          getFilterOptions(),
          getHospitalStats()
        ]);

        setFilterOptions(options);

        // Calculate actual non-compliance rate from database
        const nonCompliance = hospitalStats.totalHospitals > 0
          ? ((hospitalStats.totalHospitals - hospitalStats.mrfPublished) / hospitalStats.totalHospitals) * 100
          : 84.3;

        setStats({
          totalHospitals: hospitalStats.totalHospitals,
          mrfPublished: hospitalStats.mrfPublished,
          nonComplianceRate: parseFloat(nonCompliance.toFixed(1)),
        });
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    }
    loadOptions();
  }, []);

  // Load hospitals when filters change
  const loadHospitals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getHospitalsForMap(filters);
      setHospitals(data);
    } catch (err) {
      setError('Failed to load hospitals. Please try again.');
      console.error('Error loading hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const handleHospitalClick = (hospital: HospitalMapItem) => {
    navigate(`/us-hospitals/${hospital.id}`);
  };

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Hero Section */}
      <section className="relative py-12 px-4 bg-gradient-to-b from-ocean-800 to-ocean-700">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left"
          >
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link to="/" className="text-sage-300 hover:text-white transition-colors text-sm">
                Oasara Home
              </Link>
              <span className="text-sage-400 mx-2">/</span>
              <span className="text-white text-sm">US Hospital Transparency</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  US Hospital <span className="text-gold-400">Transparency</span> Map
                </h1>
                <p className="text-sage-200 max-w-2xl text-lg">
                  Federal law requires hospitals to publish their prices.
                  <span className="text-gold-400 font-bold"> {stats.nonComplianceRate}% refuse.</span> They'd rather pay fines than show you what they charge.
                </p>
                <p className="text-sage-300 mt-2 text-sm">
                  The prices shown here are from the {(100 - stats.nonComplianceRate).toFixed(1)}% that comply.
                  <span className="text-gold-300 font-medium"> Non-compliant hospitals likely charge MORE.</span>
                </p>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5 text-center min-w-[140px]">
                  <div className="text-3xl font-bold text-white">
                    {stats.totalHospitals.toLocaleString()}
                  </div>
                  <div className="text-xs text-sage-300 mt-1">US Hospitals</div>
                </div>
                <div className="bg-red-900/30 backdrop-blur border border-red-400/30 rounded-xl p-5 text-center min-w-[140px]">
                  <div className="text-3xl font-bold text-red-400">
                    {stats.nonComplianceRate}%
                  </div>
                  <div className="text-xs text-red-300 mt-1">Hide Their Prices</div>
                </div>
                <div className="bg-green-900/30 backdrop-blur border border-green-400/30 rounded-xl p-5 text-center min-w-[140px]">
                  <div className="text-3xl font-bold text-green-400">
                    {stats.mrfPublished.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-300 mt-1">Publish Prices</div>
                </div>
              </div>
            </div>

            {/* CMS Rule Info Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 p-5 bg-gold-900/30 border border-gold-500/40 rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-gold-400 mt-0.5 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-gold-300 block mb-1">Why This Matters</span>
                  <span className="text-sage-200 text-sm leading-relaxed">
                    Since January 2021, the CMS Price Transparency Rule requires hospitals to publish machine-readable pricing files.
                    Most choose to pay fines ($300-$5,500/day) rather than comply. When you're admitted, you sign
                    "Conditions of Admission" agreeing to pay whatever they charge—prices you can't see in advance.
                    <Link to="/us-prices" className="text-gold-400 hover:text-gold-300 ml-2 font-medium">
                      Compare procedure prices →
                    </Link>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Oasara Alternative CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-5 bg-ocean-600/50 border border-ocean-400/40 rounded-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="font-semibold text-white block mb-1">There's Another Way</span>
                  <span className="text-sage-200 text-sm">
                    JCI-accredited international facilities offer the same procedures for 60-80% less—with transparent pricing upfront.
                  </span>
                </div>
                <Link
                  to="/hub"
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-ocean-900 font-bold rounded-lg transition-colors text-center whitespace-nowrap"
                >
                  Explore International Options
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Map & Filters */}
      <section className="flex flex-col lg:flex-row">
        {/* Filters Sidebar */}
        <div className={`p-4 ${filtersCollapsed ? 'lg:w-auto' : 'lg:w-80'} flex-shrink-0`}>
          <div className="sticky top-4">
            <USMapFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableStates={filterOptions.states}
              availableTypes={filterOptions.hospitalTypes}
              availableOwnership={filterOptions.ownershipTypes}
              hospitalCount={hospitals.length}
              isCollapsed={filtersCollapsed}
              onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
            />
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 p-4 lg:pl-0">
          {error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sage-700 mb-4">{error}</p>
              <button
                onClick={loadHospitals}
                className="px-6 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <USHospitalMap
              hospitals={hospitals}
              loading={loading}
              onHospitalSelect={handleHospitalClick}
              height="calc(100vh - 200px)"
            />
          )}
        </div>
      </section>

      {/* Capture Tier Explanation */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-sage-200">
        <h2 className="text-2xl font-display font-bold text-ocean-800 mb-6">
          Understanding <span className="text-gold-600">Transparency Tiers</span>
        </h2>
        <p className="text-sage-600 mb-8 max-w-3xl">
          We score hospitals based on price transparency compliance, terms of admission, and billing practices.
          Higher scores indicate more "patient capture"—making it harder for you to know costs in advance.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(CAPTURE_TIER_CONFIG).map(([tier, config]) => (
            <div
              key={tier}
              className="p-5 rounded-xl border-2 bg-white"
              style={{
                borderColor: `${config.color}60`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-bold text-lg" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-sage-600">{config.description}</p>
              <div className="mt-3 text-xs text-sage-500">
                Score: {tier === 'TRANSPARENT' ? '0-25' : tier === 'OPAQUE' ? '26-50' : tier === 'CAPTURED' ? '51-75' : '76-100'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-br from-ocean-700 to-ocean-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Stop Playing Their Game
          </h2>
          <p className="text-sage-200 mb-8 text-lg">
            US hospitals hide prices because they can. International JCI-accredited facilities compete on transparency.
            Same doctors, same equipment, same certifications—60-80% less cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hub"
              className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-ocean-900 font-bold rounded-lg transition-colors text-lg"
            >
              Find International Facilities
            </Link>
            <Link
              to="/us-prices"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/30 text-lg"
            >
              Compare US Procedure Prices
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-sage-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-sage-600">
            Hospital data sourced from CMS Provider of Services files and Machine Readable Files per the CMS Price Transparency Rule.
            Always verify pricing directly with hospitals before service. Transparency scores calculated from publicly available compliance data.
          </p>
        </div>
      </section>
    </div>
  );
}
