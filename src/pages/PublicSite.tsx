import { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import SiteHeader from '../components/Layout/SiteHeader';
import ChatHero from '../components/Chat/ChatHero';
import FacilityCard from '../components/Cards/FacilityCard';
import ProcedureSearch from '../components/Search/ProcedureSearch';
import CountryFilter from '../components/Filters/CountryFilter';
import SpecialtyFilter from '../components/Filters/SpecialtyFilter';
import ZanoFilter from '../components/Filters/ZanoFilter';
import AnimatedCounter from '../components/PriceComparison/AnimatedCounter';
import { getFacilities, getCountries, getSpecialties, Facility, supabase } from '../lib/supabase';
import { getUSStats } from '../lib/usHospitalApi';

// LAZY LOAD ALL HEAVY COMPONENTS - fixes Chrome freeze on low-RAM PCs
// Mapbox GL JS is ~700KB, video components have Framer Motion
const GlobalFacilityMap = lazy(() => import('../components/Map/GlobalFacilityMap'));
const ZanoTutorials = lazy(() => import('../components/Zano/ZanoTutorials'));
const MedicalTourismVideos = lazy(() => import('../components/Videos/MedicalTourismVideos'));
const USHealthcareCrisis = lazy(() => import('../components/Videos/USHealthcareCrisis'));
const TestimonialsSection = lazy(() => import('../components/Trust/TestimonialsSection'));
const SuccessMetrics = lazy(() => import('../components/Trust/SuccessMetrics'));
const SavingsCalculator = lazy(() => import('../components/Calculator/SavingsCalculator'));

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
  const [pledgeCounts, setPledgeCounts] = useState<PledgeCounts>({
    medical_trust: 0,
    cancel_insurance: 0,
    try_medical_tourism: 0,
  });
  const [usHospitalCount, setUsHospitalCount] = useState<number>(6000);

  // Mobile detection for performance optimization - uses matchMedia for Lighthouse compatibility
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const checkMobile = (e?: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e ? e.matches : mediaQuery.matches);
    };

    // Initial check
    checkMobile(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', checkMobile);
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, []);

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

  // Fetch US hospital stats (for price comparison feature)
  useEffect(() => {
    const fetchUSStats = async () => {
      try {
        const stats = await getUSStats();
        if (stats?.stats?.hospitals_with_pricing) {
          setUsHospitalCount(stats.stats.hospitals_with_pricing);
        }
      } catch {
        // Keep default value on error
      }
    };
    fetchUSStats();
  }, []);

  // Read URL parameters on mount (from calculator CTA)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specialtyParam = params.get('specialty');
    if (specialtyParam) {
      setSearchQuery(specialtyParam);
      // Scroll to facility list
      setTimeout(() => {
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  // Fetch facilities with error handling
  const { data: facilities = [], isLoading: facilitiesLoading, error: facilitiesError } = useQuery<Facility[]>({
    queryKey: ['facilities'],
    queryFn: async () => {
      const result = await getFacilities();
      return result;
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes - prevents refetches
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Log errors
  useEffect(() => {
    if (facilitiesError) {
      console.error('FACILITIES ERROR:', facilitiesError);
    }
  }, [facilitiesError]);

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 10 * 60 * 1000, // Countries rarely change
  });

  // Fetch specialties
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
    staleTime: 10 * 60 * 1000, // Specialties rarely change
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

      {/* Hero Section - Chatbot First */}
      <ChatHero />

      {/* Stats Bar - Simplified Social Proof */}
      <div className="bg-ocean-600 border-t-4 border-gold-500 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 justify-center md:justify-start">
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={filteredFacilities.length} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Facilities</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={countries.length} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Countries</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={totalPledges} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Total Pledges</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={pledgeCounts.medical_trust} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Medical Trusts</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={pledgeCounts.try_medical_tourism} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Medical Tourists</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <AnimatedCounter end={pledgeCounts.cancel_insurance} className="text-3xl font-display font-bold text-white" />
            <span className="text-xs text-ocean-100 uppercase tracking-wide mt-1">Cancelled Insurance</span>
          </div>
          <div className="flex flex-col items-center px-4 bg-ocean-700/50 rounded-lg py-2">
            <AnimatedCounter end={usHospitalCount} suffix="+" className="text-3xl font-display font-bold text-gold-300" />
            <span className="text-xs text-gold-200 uppercase tracking-wide mt-1">US Hospitals Compared</span>
          </div>
          {/* Pledge CTA */}
          <a 
            href="/action" 
            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full text-white font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-gold-500/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Take The Pledge
          </a>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-medium">JCI Accredited Healthcare</span>
          </div>
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
          {/* Map - DESKTOP ONLY for performance (saves 700KB on mobile) */}
          {!isMobile && (
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
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center bg-sage-50 rounded-lg">
                    <p className="text-ocean-600">Loading map...</p>
                  </div>
                }>
                  <GlobalFacilityMap
                    facilities={filteredFacilities}
                    onFacilitySelect={setSelectedFacility}
                    selectedFacility={selectedFacility}
                  />
                </Suspense>
              </div>
            )}
            </div>
          )}

          {/* Facility Cards */}
          <div className="h-full overflow-y-auto space-y-4 pr-2">
            {filteredFacilities.length === 0 ? (
            <div className="glass-morphism rounded p-16 text-center">
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
            </div>
          ) : (
            filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onClick={() => setSelectedFacility(facility)}
              />
            ))
          )}
          </div>
        </div>
      </main>

      {/* Savings Calculator - Moved from hero, now below facilities */}
      <Suspense fallback={
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-20 text-center text-white">
          <p>Loading calculator...</p>
        </div>
      }>
        <SavingsCalculator />
      </Suspense>

      {/* US Healthcare Crisis - LAZY LOADED - DESKTOP ONLY for performance */}
      {!isMobile && (
        <Suspense fallback={<div className="py-12 bg-red-50/50 text-center"><p className="text-ocean-600">Loading videos...</p></div>}>
          <USHealthcareCrisis />
        </Suspense>
      )}

      {/* Medical Tourism Videos - LAZY LOADED - DESKTOP ONLY for performance */}
      {!isMobile && (
        <Suspense fallback={<div className="py-12 bg-sage-50 text-center"><p className="text-ocean-600">Loading videos...</p></div>}>
          <MedicalTourismVideos />
        </Suspense>
      )}

      {/* Success Metrics - Industry Statistics */}
      <Suspense fallback={<div className="py-12 text-center"><p className="text-ocean-600">Loading metrics...</p></div>}>
        <SuccessMetrics />
      </Suspense>

      {/* Patient Testimonials */}
      <Suspense fallback={<div className="py-12 text-center"><p className="text-ocean-600">Loading testimonials...</p></div>}>
        <TestimonialsSection />
      </Suspense>

      {/* Zano Tutorials Section - Intersection Observer lazy loads videos on demand */}
      <Suspense fallback={<div className="py-12 bg-ocean-50 text-center"><p className="text-ocean-600">Loading tutorials...</p></div>}>
        <ZanoTutorials />
      </Suspense>

      {/* Footer - Comprehensive with moved nav links */}
      <footer className="mt-16 py-16 border-t border-sage-200 bg-sage-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Footer Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Resources */}
            <div>
              <h4 className="font-display text-ocean-700 text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/hub" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Medical Tourism Guide
                  </a>
                </li>
                <li>
                  <a href="/medical-trusts" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Medical Trust Laws
                  </a>
                </li>
                <li>
                  <a href="/price-comparison" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    US Price Comparison
                  </a>
                </li>
                <li>
                  <a href="/us-prices" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Compare US Hospitals
                  </a>
                </li>
              </ul>
            </div>

            {/* Take Action */}
            <div>
              <h4 className="font-display text-ocean-700 text-lg mb-4">Take Action</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/action" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Join the Movement
                  </a>
                </li>
                <li>
                  <a href="/bounty" className="text-sage-600 hover:text-ocean-600 transition-colors flex items-center gap-1">
                    Referral Bounty
                    <span className="text-xs bg-gold-500 text-white px-1.5 py-0.5 rounded-full font-bold">$50</span>
                  </a>
                </li>
                <li>
                  <a href="/auth" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Create Account
                  </a>
                </li>
              </ul>
            </div>

            {/* Payment Privacy */}
            <div>
              <h4 className="font-display text-ocean-700 text-lg mb-4">Payment Privacy</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/why-zano" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Why Zano?
                  </a>
                </li>
                <li>
                  <a href="https://zano.org" target="_blank" rel="noopener noreferrer" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Get Zano Wallet
                  </a>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="font-display text-ocean-700 text-lg mb-4">About Oasara</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/start" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Talk to Our Guide
                  </a>
                </li>
                <li>
                  <a href="/" className="text-sage-600 hover:text-ocean-600 transition-colors">
                    Browse Facilities
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center pt-8 border-t border-sage-200">
            <p className="text-sage-500 text-base italic max-w-3xl mx-auto leading-relaxed">
              "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely, choices bloom abundantly, and every seeker finds their path to healing."
            </p>
            <p className="text-sage-400 text-sm mt-6">
              Privacy-preserving medical marketplace. Your sovereignty. Your choice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSite;
