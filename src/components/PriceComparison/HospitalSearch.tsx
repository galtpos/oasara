import React, { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { searchHospitals } from '../../lib/hospitalApi';
import { Hospital } from '../../types/hospital';

interface HospitalSearchProps {
  onResults: (hospital: Hospital | null) => void;
}

export default function HospitalSearch({ onResults }: HospitalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search function - waits 300ms after user stops typing
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const hospitals = await searchHospitals(searchQuery, 10);
      setResults(hospitals);
      setShowDropdown(true);
    } catch (error) {
      console.error('Hospital search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelectHospital = (hospital: Hospital) => {
    setQuery(hospital.name);
    setShowDropdown(false);
    onResults(hospital);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Your Local Hospital
        </h2>
        <p className="text-gray-600">
          Find out how much procedures cost at hospitals near you
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by hospital name, city, or ZIP code..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg"
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-gold-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => handleSelectHospital(hospital)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {hospital.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {hospital.city}, {hospital.state} {hospital.zip}
                    </div>
                    {hospital.hospital_type && (
                      <div className="text-xs text-gray-500 mt-1">
                        {hospital.hospital_type}
                        {hospital.bed_count && ` • ${hospital.bed_count} beds`}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-600">
            No hospitals found. Try searching by a different name, city, or ZIP code.
          </div>
        )}
      </div>

      {/* Search Tips */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Try searching: "Mayo Clinic", "Cleveland", or "10001"
      </div>
    </div>
  );
}
