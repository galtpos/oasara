import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalFacilityMap from '../components/Map/GlobalFacilityMap';
import FacilityCard from '../components/Cards/FacilityCard';
import ProcedureSearch from '../components/Search/ProcedureSearch';
import CountryFilter from '../components/Filters/CountryFilter';
import SpecialtyFilter from '../components/Filters/SpecialtyFilter';
import ZanoFilter from '../components/Filters/ZanoFilter';
import PledgeCampaigns from '../components/Campaigns/PledgeCampaigns';
import VideoTestimonials from '../components/Testimonials/VideoTestimonials';
import { getFacilities, getCountries, getSpecialties, Facility } from '../lib/supabase';
import MedicalTrustsTab from '../components/TrustMap/MedicalTrustsTab';

type TabType = 'facilities' | 'trusts';

const PublicSite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('facilities');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showZanoOnly, setShowZanoOnly] = useState(false);

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

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
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
  }, [facilities, searchQuery, selectedCountries, selectedSpecialties, showZanoOnly]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-[3px] border-ocean-400">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div>
              <h1 className="logo-gradient text-4xl">OASARA</h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <a href="/why-zano" className="nav-link">
                Why Zano?
              </a>
              <a href="/action" className="nav-link">
                Take Action
              </a>
              <a href="/hub" className="nav-link">
                Guide
              </a>
              <a href="/feedback" className="nav-link">
                Feedback
              </a>
              <a href="/early-access" className="btn-gold">
                Join
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 border-b border-ocean-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`
                relative px-6 py-4 text-sm font-semibold transition-all duration-200
                ${activeTab === 'facilities'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white/90'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Medical Facilities</span>
              </div>
              {activeTab === 'facilities' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gold-400 rounded-t-full"
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('trusts')}
              className={`
                relative px-6 py-4 text-sm font-semibold transition-all duration-200
                ${activeTab === 'trusts'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white/90'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Medical Trust Laws</span>
                <span className="bg-gold-400 text-ocean-900 text-xs font-bold px-1.5 py-0.5 rounded">NEW</span>
              </div>
              {activeTab === 'trusts' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gold-400 rounded-t-full"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'facilities' ? (
          <motion.div
            key="facilities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
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
              
              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-white/20 mx-2" />
              
              {/* Pledge Campaigns */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-white/50 text-xs uppercase tracking-wide mr-1">Pledges:</span>
                <PledgeCampaigns variant="compact" />
              </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="mb-6">
                <ProcedureSearch onSearch={setSearchQuery} />
              </div>

              <div className="flex items-center gap-4">
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

                {(selectedCountries.length > 0 || selectedSpecialties.length > 0 || searchQuery) && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-auto px-4 py-2 rounded text-sm text-sage-600 hover:text-ocean-600 border-2 border-sage-200 hover:border-ocean-400 transition-colors font-semibold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(100vh - 420px)' }}>
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
          </motion.div>
        ) : (
          <motion.div
            key="trusts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MedicalTrustsTab />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Testimonials Section */}
      <VideoTestimonials />

      {/* Footer */}
      <footer className="py-12 border-t border-sage-200 bg-sage-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sage-500 text-base italic max-w-3xl mx-auto leading-relaxed">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely, choices bloom abundantly, and every seeker finds their path to healing."
          </p>
          <p className="text-sage-400 text-sm mt-6">
            Privacy-preserving medical marketplace. No tracking. No cookies. Your sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicSite;
