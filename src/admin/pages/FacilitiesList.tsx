import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getFacilities, Facility } from '../../lib/supabase';

const FacilitiesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const { data: facilities = [], isLoading } = useQuery<Facility[]>({
    queryKey: ['facilities'],
    queryFn: () => getFacilities()
  });

  // Filter facilities
  const filteredFacilities = facilities.filter(facility => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = facility.name.toLowerCase().includes(query);
      const matchesCity = facility.city.toLowerCase().includes(query);
      const matchesCountry = facility.country.toLowerCase().includes(query);
      if (!matchesName && !matchesCity && !matchesCountry) return false;
    }

    if (selectedCountry !== 'all' && facility.country !== selectedCountry) {
      return false;
    }

    return true;
  });

  // Get unique countries
  const countries = Array.from(new Set(facilities.map(f => f.country))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ocean-600 mb-2">Facilities</h1>
          <p className="text-ocean-600/70">
            Manage {filteredFacilities.length} of {facilities.length} JCI-certified facilities
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/facilities/new')}
          className="btn-gold px-6 py-3 font-semibold rounded-lg hover:scale-105 transition-transform"
        >
          + Add Facility
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-sage-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search facilities by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 placeholder-ocean-400/60 focus:outline-none focus:border-ocean-400 transition-colors"
            />
          </div>

          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-ocean-700 focus:outline-none focus:border-ocean-400 transition-colors"
          >
            <option value="all">All Countries ({countries.length})</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 bg-sage-50 p-1 rounded-lg border border-sage-200">
            <button
              onClick={() => setView('cards')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'cards'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white'
                  : 'text-ocean-600/60 hover:text-ocean-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'table'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white'
                  : 'text-ocean-600/60 hover:text-ocean-600'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Facilities List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-sage-200 rounded-xl p-6 shimmer h-48" />
          ))}
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-sage-200 rounded-xl p-6 shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/admin/facilities/${facility.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-ocean-700">{facility.name}</h3>
                {facility.jci_accredited && (
                  <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs rounded border border-gold-200">
                    JCI
                  </span>
                )}
              </div>
              <p className="text-sm text-ocean-600/70 mb-2">
                {facility.city}, {facility.country}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {facility.specialties.slice(0, 2).map(specialty => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded border border-ocean-100"
                  >
                    {specialty}
                  </span>
                ))}
                {facility.specialties.length > 2 && (
                  <span className="px-2 py-1 bg-sage-50 text-ocean-500/60 text-xs rounded">
                    +{facility.specialties.length - 2} more
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-ocean-600/60">
                <span>{facility.google_rating ? `⭐ ${facility.google_rating}` : 'No rating'}</span>
                <span>{facility.accepts_zano ? '🟢 Zano Ready' : '⚪ No Zano'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-sage-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sage-50 border-b border-sage-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Zano
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ocean-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-sage-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ocean-700">{facility.name}</span>
                        {facility.jci_accredited && (
                          <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-xs rounded">
                            JCI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ocean-600/70">
                      {facility.city}, {facility.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-ocean-600/70">
                      {facility.specialties.length} specialties
                    </td>
                    <td className="px-6 py-4 text-sm text-ocean-600/70">
                      {facility.google_rating ? `⭐ ${facility.google_rating}` : 'No rating'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        facility.accepts_zano
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-sage-100 text-ocean-400'
                      }`}>
                        {facility.accepts_zano ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/facilities/${facility.id}`)}
                        className="px-3 py-1 bg-gold-100 text-gold-700 rounded hover:bg-gold-200 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredFacilities.length === 0 && (
        <div className="bg-white border border-sage-200 rounded-xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-ocean-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="font-display text-2xl text-ocean-700 mb-2">No Facilities Found</h3>
          <p className="text-ocean-600/60 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('all');
            }}
            className="btn-gold px-6 py-2 rounded-lg font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FacilitiesList;
