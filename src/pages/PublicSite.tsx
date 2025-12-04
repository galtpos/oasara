import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '../components/Layout/SiteHeader';
import GlobalFacilityMap from '../components/Map/GlobalFacilityMap';
import FacilityCard from '../components/Cards/FacilityCard';
import ProcedureSearch from '../components/Search/ProcedureSearch';
import CountryFilter from '../components/Filters/CountryFilter';
import SpecialtyFilter from '../components/Filters/SpecialtyFilter';
import ZanoFilter from '../components/Filters/ZanoFilter';
import { getFacilities, getCountries, getSpecialties, Facility, supabase } from '../lib/supabase';

interface PledgeCounts {
  medical_trust: number;
  cancel_insurance: number;
  try_medical_tourism: number;
}

type SortOption = 'rating' | 'reviews' | 'name' | 'country';

const PublicSite: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showZanoOnly, setShowZanoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [pledgeCounts, setPledgeCounts] = useState<PledgeCounts>({
    medical_trust: 0,
    cancel_insurance: 0,
    try_medical_tourism: 0,
  });

  // Fetch pledge counts
  useEffect(() => {
    const fetchPledgeCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('pledges')
          .select('pledge_type');

        if (error) throw error;

        const counts: PledgeCounts = {
          medical_trust: 0,
          cancel_insurance: 0,
          try_medical_tourism: 0,
        };

        data?.forEach((pledge: { pledge_type: string }) => {
          if (pledge.pledge_type in counts) {
            counts[pledge.pledge_type as keyof PledgeCounts]++;
          }
        });

        setPledgeCounts(counts);
      } catch (err) {
        console.error('Error fetching pledge counts:', err);
      }
    };

    fetchPledgeCounts();
  }, []);

  // Fetch facilities
  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery<Facility[]>({
    queryKey: ['facilities'],
    queryFn: () => getFacilities()
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries
  });

  // Fetch specialties
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties
  });

  // Filter and sort facilities
  const filteredFacilities = useMemo(() => {
    let result = facilities.filter(facility => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = facility.name.toLowerCase().includes(query);
        const matchesCity = facility.city.toLowerCase().includes(query);
        const matchesCountry = facility.country.toLowerCase().includes(query);
        const matchesProcedure = facility.popular_procedures?.some(
          proc => proc.name.toLowerCase().includes(query)
        );
        const matchesSpecialty = facility.specialties.some(
          spec => spec.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesCity && !matchesCountry && !matchesProcedure && !matchesSpecialty) {
          return false;
        }
      }

      // Country filter
      if (selectedCountries.length > 0 && !selectedCountries.includes(facility.country)) {
        return false;
      }

      // Specialty filter
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = facility.specialties.some(
          spec => selectedSpecialties.includes(spec)
        );
        if (!hasMatchingSpecialty) return false;
      }

      // Zano filter
      if (showZanoOnly && !facility.accepts_zano) {
        return false;
      }

      return true;
    });

    // Sort facilities
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          // Sort by rating, then by review count for ties
          const ratingA = a.google_rating || 0;
          const ratingB = b.google_rating || 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.review_count || 0) - (a.review_count || 0);
        case 'reviews':
          return (b.review_count || 0) - (a.review_count || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'country':
          return a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

    return result;
  }, [facilities, searchQuery, selectedCountries, selectedSpecialties, showZanoOnly, sortBy]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearAllFilters = () => {
    setSelectedCountries([]);
    setSelectedSpecialties([]);
    setSearchQuery('');
    setShowZanoOnly(false);
  };

  const totalPledges = pledgeCounts.medical_trust + pledgeCounts.cancel_insurance + pledgeCounts.try_medical_tourism;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Bounty Program Banner */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4 text-sm">
          <span className="font-semibold">Earn up to $50 fUSD!</span>
          <span>Features, bugs, UX improvements - get paid for accepted contributions.</span>
          <a
            href="/bounty"
            className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full font-medium transition-colors"
          >
            View Bounty Board
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Hero Section - Value Proposition */}
      <section className="bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">
              Save 60-80% on Medical Procedures
            </h2>
            <p className="text-xl text-ocean-100 mb-6 leading-relaxed">
              Compare {facilities.length}+ JCI-accredited facilities across {countries.length} countries.
              Transparent pricing. No middleman fees. Your medical sovereignty.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </button>
              <div className="flex items-center gap-6 text-ocean-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-sm font-medium">JCI Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-medium">Verified Facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Expandable */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-sage-50 border-b-2 border-sage-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-2xl text-ocean-700">How Medical Tourism Works</h3>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="text-sage-500 hover:text-ocean-600 transition-colors"
                  aria-label="Close how it works"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-2xl text-ocean-600">1</span>
                  </div>
                  <h4 className="font-display text-lg text-ocean-700 mb-2">Search</h4>
                  <p className="text-sage-600 text-sm">
                    Find accredited facilities for your procedure. Filter by country, specialty, or ratings.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-2xl text-ocean-600">2</span>
                  </div>
                  <h4 className="font-display text-lg text-ocean-700 mb-2">Compare</h4>
                  <p className="text-sage-600 text-sm">
                    See transparent pricing, real reviews, and facility credentials. No hidden fees.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-2xl text-ocean-600">3</span>
                  </div>
                  <h4 className="font-display text-lg text-ocean-700 mb-2">Connect</h4>
                  <p className="text-sage-600 text-sm">
                    Contact facilities directly. No middleman taking a cut. Ask about Zano payments.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-2xl text-gold-600">4</span>
                  </div>
                  <h4 className="font-display text-lg text-ocean-700 mb-2">Save 60-80%</h4>
                  <p className="text-sage-600 text-sm">
                    Get world-class care at a fraction of US prices. Same quality, real savings.
                  </p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gold-50 border-2 border-gold-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-700 font-bold text-lg">Z</span>
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ocean-700 mb-1">What is Zano?</h4>
                    <p className="text-sage-600 text-sm leading-relaxed">
                      Zano is a privacy-preserving cryptocurrency that protects your financial sovereignty.
                      When you contact a facility, ask if they accept Zano or Freedom Dollar.
                      Your request helps educate providers about alternative payment methods that keep your medical finances private.
                    </p>
                    <a href="/why-zano" className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 text-sm font-semibold mt-2">
                      Learn more about payment privacy
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Stats Bar - Ocean Teal */}
      <div className="stats-bar">
        <div className="stat-pill">
          <span className="stat-number">{filteredFacilities.length}</span>
          <span className="stat-label">Facilities</span>
        </div>
        <div className="stat-pill">
          <span className="stat-number">{countries.length}</span>
          <span className="stat-label">Countries</span>
        </div>
        <div className="stat-pill">
          <span className="stat-number">{totalPledges}</span>
          <span className="stat-label">Total Pledges</span>
        </div>
        <div className="stat-pill">
          <span className="stat-number">{pledgeCounts.medical_trust}</span>
          <span className="stat-label">Medical Trusts</span>
        </div>
        <div className="stat-pill">
          <span className="stat-number">{pledgeCounts.try_medical_tourism}</span>
          <span className="stat-label">Medical Tourists</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-white/80 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="font-medium">JCI Accredited Healthcare</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <ProcedureSearch onSearch={setSearchQuery} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <CountryFilter
            countries={countries}
            selectedCountries={selectedCountries}
            onCountryToggle={handleCountryToggle}
            onClearAll={() => setSelectedCountries([])}
          />
          <SpecialtyFilter
            specialties={specialties}
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            onClearAll={() => setSelectedSpecialties([])}
          />
          <ZanoFilter
            showZanoOnly={showZanoOnly}
            onToggle={() => setShowZanoOnly(!showZanoOnly)}
          />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort-select" className="text-sm text-sage-600 font-medium">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border-2 border-sage-200 bg-white text-ocean-700 text-sm font-medium focus:border-ocean-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
              <option value="country">Country</option>
            </select>
          </div>

          {(selectedCountries.length > 0 || selectedSpecialties.length > 0 || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded text-sm text-sage-600 hover:text-ocean-600 border-2 border-sage-200 hover:border-ocean-400 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8" tabIndex={-1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(100vh - 480px)', minHeight: '500px' }}>
          {/* Map */}
          <div className="h-full">
            {facilitiesLoading ? (
              <div className="h-full glass-morphism rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="shimmer w-20 h-20 rounded-full mx-auto mb-4"></div>
                  <p className="font-display text-2xl text-ocean-600">
                    Loading Your Oasis...
                  </p>
                </div>
              </div>
            ) : (
              <div className="map-container h-full">
                <GlobalFacilityMap
                  facilities={filteredFacilities}
                  onFacilitySelect={setSelectedFacility}
                  selectedFacility={selectedFacility}
                />
              </div>
            )}
          </div>

          {/* Facility Cards */}
          <div className="h-full overflow-y-auto space-y-4 pr-2">
            <AnimatePresence mode="popLayout">
              {filteredFacilities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-morphism rounded p-16 text-center"
                >
                  <h3 className="font-display text-3xl text-sage-700 mb-3">
                    No Facilities Found
                  </h3>
                  <p className="text-sage-500 mb-6 text-base">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="btn-gold"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              ) : (
                filteredFacilities.map((facility) => (
                  <motion.div
                    key={facility.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <FacilityCard
                      facility={facility}
                      onClick={() => setSelectedFacility(facility)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

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
};

export default PublicSite;
