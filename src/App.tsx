import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalFacilityMap from './components/Map/GlobalFacilityMap';
import FacilityCard from './components/Cards/FacilityCard';
import ProcedureSearch from './components/Search/ProcedureSearch';
import CountryFilter from './components/Filters/CountryFilter';
import SpecialtyFilter from './components/Filters/SpecialtyFilter';
import ZanoFilter from './components/Filters/ZanoFilter';
import MainNav from './components/Navigation/MainNav';
import MedicalTourismHub from './pages/MedicalTourismHub';
import { getFacilities, getCountries, getSpecialties, Facility } from './lib/supabase';

const queryClient = new QueryClient();

function AppContent() {
  const [currentView, setCurrentView] = useState<'map' | 'hub'>('map');
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

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Navigation */}
      <MainNav
        currentView={currentView}
        onViewChange={setCurrentView}
        facilitiesCount={filteredFacilities.length}
        countriesCount={countries.length}
        zanoCount={facilities.filter(f => f.accepts_zano).length}
      />

      {/* Conditional View Rendering */}
      {currentView === 'hub' ? (
        <MedicalTourismHub />
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-6 py-4">

          {/* Search */}
          <div className="mb-4">
            <ProcedureSearch onSearch={setSearchQuery} />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
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

            {/* Active Filters */}
            {(selectedCountries.length > 0 || selectedSpecialties.length > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCountries([]);
                  setSelectedSpecialties([]);
                  setSearchQuery('');
                  setShowZanoOnly(false);
                }}
                className="ml-auto px-3 py-2 rounded-lg text-xs text-cream/70 hover:text-cream border border-cream/20 hover:border-cream/40 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
          </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Map */}
          <div className="h-full">
            {facilitiesLoading ? (
              <div className="h-full glass-morphism rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="shimmer w-20 h-20 rounded-full mx-auto mb-4"></div>
                  <p className="font-serif text-xl text-ignition-amber">
                    Loading Your Oasis...
                  </p>
                </div>
              </div>
            ) : (
              <GlobalFacilityMap
                facilities={filteredFacilities}
                onFacilitySelect={setSelectedFacility}
                selectedFacility={selectedFacility}
              />
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
                  className="glass-morphism rounded-xl p-12 text-center"
                >
                  <svg className="w-16 h-16 text-cream/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="font-serif text-2xl text-cream mb-2">
                    No Facilities Found
                  </h3>
                  <p className="text-cream/60 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCountries([]);
                      setSelectedSpecialties([]);
                      setSearchQuery('');
                      setShowZanoOnly(false);
                    }}
                    className="gradient-cta px-6 py-2 rounded-lg text-dark-base font-medium"
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
      <footer className="mt-12 py-8 border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-cream/60 text-sm italic">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely, choices bloom abundantly, and every seeker finds their path to healing."
          </p>
          <p className="text-cream/40 text-xs mt-4">
            Privacy-preserving medical marketplace. No tracking. No cookies. Your sovereignty.
          </p>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
