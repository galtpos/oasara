import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalFacilityMap from '../components/Map/GlobalFacilityMap';
import FacilityCard from '../components/Cards/FacilityCard';
import ProcedureSearch from '../components/Search/ProcedureSearch';
import CountryFilter from '../components/Filters/CountryFilter';
import SpecialtyFilter from '../components/Filters/SpecialtyFilter';
import ZanoFilter from '../components/Filters/ZanoFilter';
import { getFacilities, getCountries, getSpecialties, Facility } from '../lib/supabase';

const PublicSite: React.FC = () => {
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
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-warm-clay/20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-5xl text-champagne-gold tracking-wide">OASARA</h1>
              <p className="text-warm-clay text-sm italic mt-2">Your Oasis for Medical Sovereignty</p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/hub"
                className="px-6 py-3 rounded-lg text-base font-semibold text-deep-teal border-2 border-desert-sand hover:border-warm-clay hover:bg-white transition-all"
              >
                Medical Tourism Guide
              </a>
              <div className="text-right">
                <p className="text-sm text-deep-teal font-medium">
                  <span className="font-bold text-champagne-gold text-lg">{filteredFacilities.length}</span> Facilities
                </p>
                <p className="text-sm text-warm-clay">
                  {countries.length} Countries • {facilities.filter(f => f.accepts_zano).length} Zano-Ready
                </p>
              </div>
              <a
                href="/early-access"
                className="gradient-cta px-8 py-3 rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg"
              >
                Early Access
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="mb-6">
          <ProcedureSearch onSearch={setSearchQuery} />
        </div>

        {/* Filters */}
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

          {/* Active Filters */}
          {(selectedCountries.length > 0 || selectedSpecialties.length > 0 || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="ml-auto px-4 py-2 rounded-lg text-sm text-warm-clay hover:text-deep-teal border border-warm-clay/30 hover:border-champagne-gold transition-colors font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(100vh - 320px)' }}>
          {/* Map */}
          <div className="h-full">
            {facilitiesLoading ? (
              <div className="h-full glass-morphism rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="shimmer w-20 h-20 rounded-full mx-auto mb-4"></div>
                  <p className="font-serif text-2xl text-ignition-amber">
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
          <div className="h-full overflow-y-auto space-y-6 pr-2">
            <AnimatePresence mode="popLayout">
              {filteredFacilities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-morphism rounded-2xl p-16 text-center"
                >
                  <h3 className="font-serif text-3xl text-deep-teal mb-3">
                    No Facilities Found
                  </h3>
                  <p className="text-warm-clay mb-6 text-base">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="gradient-cta px-8 py-3 rounded-lg text-white font-medium shadow-lg text-base"
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
      <footer className="mt-16 py-12 border-t border-warm-clay/20 bg-desert-sand/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-warm-clay text-base italic max-w-3xl mx-auto leading-relaxed">
            "In the desert of captured healthcare, Oasara is your oasis — a sanctuary where medical sovereignty flows freely, choices bloom abundantly, and every seeker finds their path to healing."
          </p>
          <p className="text-deep-teal/60 text-sm mt-6">
            Privacy-preserving medical marketplace. No tracking. No cookies. Your sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicSite;
