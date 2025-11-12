import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase, Doctor } from '../../lib/supabase';

interface DoctorWithFacility extends Doctor {
  facility?: {
    name: string;
    city: string;
    country: string;
  };
}

const getDoctors = async (): Promise<DoctorWithFacility[]> => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      facility:facilities!facility_id(
        name,
        city,
        country
      )
    `)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

const DoctorsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const { data: doctors = [], isLoading } = useQuery<DoctorWithFacility[]>({
    queryKey: ['doctors'],
    queryFn: getDoctors
  });

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = doctor.name.toLowerCase().includes(query);
      const matchesFacility = doctor.facility?.name.toLowerCase().includes(query) || false;
      const matchesSpecialty = doctor.specialty?.toLowerCase().includes(query) || false;
      if (!matchesName && !matchesFacility && !matchesSpecialty) return false;
    }

    if (selectedSpecialty !== 'all' && doctor.specialty !== selectedSpecialty) {
      return false;
    }

    return true;
  });

  // Get unique specialties
  const specialties = Array.from(
    new Set(doctors.map(d => d.specialty).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-deep-teal mb-2">Doctor Profiles</h1>
          <p className="text-deep-teal/70">
            Manage {filteredDoctors.length} of {doctors.length} doctor profiles across all facilities
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/doctors/new')}
          className="px-6 py-3 bg-gradient-to-r from-ignition-amber to-champagne-gold text-white font-semibold rounded-lg hover:scale-105 hover:shadow-lg transition-all"
        >
          + Add Doctor
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-warm-clay/20 shadow-sm rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search doctors by name, facility, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-cream/50 border border-warm-clay/20 rounded-lg text-deep-teal placeholder-deep-teal/40 focus:outline-none focus:border-ignition-amber focus:ring-2 focus:ring-ignition-amber/20 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-teal/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-2 bg-cream/50 border border-warm-clay/20 rounded-lg text-deep-teal focus:outline-none focus:border-ignition-amber focus:ring-2 focus:ring-ignition-amber/20 transition-all"
          >
            <option value="all">All Specialties ({specialties.length})</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 bg-cream/50 p-1 rounded-lg border border-warm-clay/20">
            <button
              onClick={() => setView('cards')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'cards'
                  ? 'bg-gradient-to-r from-ignition-amber to-champagne-gold text-white shadow-md'
                  : 'text-deep-teal/60 hover:text-deep-teal'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'table'
                  ? 'bg-gradient-to-r from-ignition-amber to-champagne-gold text-white shadow-md'
                  : 'text-deep-teal/60 hover:text-deep-teal'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-ignition-amber border-t-transparent rounded-full animate-spin"></div>
            <p className="text-deep-teal/60">Loading doctor profiles...</p>
          </div>
        </div>
      )}

      {/* Cards View */}
      {!isLoading && view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-warm-clay/20 rounded-xl shadow-sm hover:shadow-lg transition-all group cursor-pointer overflow-hidden"
              onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
            >
              {/* Doctor Avatar/Image */}
              <div className="h-32 bg-gradient-to-br from-ignition-amber/20 to-champagne-gold/20 flex items-center justify-center">
                {doctor.image_url ? (
                  <img
                    src={doctor.image_url}
                    alt={doctor.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-ignition-amber to-champagne-gold flex items-center justify-center border-4 border-white shadow-md">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="p-5">
                <h3 className="font-serif text-lg text-deep-teal mb-1 group-hover:text-ignition-amber transition-colors">
                  {doctor.name}
                </h3>

                {doctor.title && (
                  <p className="text-sm text-deep-teal/60 mb-2">{doctor.title}</p>
                )}

                {doctor.specialty && (
                  <div className="inline-block px-3 py-1 mb-3 bg-ignition-amber/10 border border-ignition-amber/20 rounded-full">
                    <span className="text-xs font-medium text-ignition-amber">{doctor.specialty}</span>
                  </div>
                )}

                {doctor.facility && (
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-4 h-4 text-deep-teal/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <div className="text-sm text-deep-teal/70">
                      <p className="font-medium">{doctor.facility.name}</p>
                      <p className="text-xs text-deep-teal/50">{doctor.facility.city}, {doctor.facility.country}</p>
                    </div>
                  </div>
                )}

                {doctor.qualifications && (
                  <p className="text-xs text-deep-teal/60 line-clamp-2 mb-3">{doctor.qualifications}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-warm-clay/10">
                  <div className="flex items-center gap-4 text-xs text-deep-teal/50">
                    {doctor.years_experience && (
                      <span>{doctor.years_experience}+ yrs exp</span>
                    )}
                    {doctor.procedures_performed && (
                      <span>{doctor.procedures_performed}+ procedures</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/doctors/${doctor.id}`);
                    }}
                    className="text-ignition-amber hover:text-champagne-gold text-sm font-medium transition-colors"
                  >
                    Edit →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!isLoading && view === 'table' && (
        <div className="bg-white border border-warm-clay/20 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream/50 border-b border-warm-clay/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-deep-teal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-clay/10">
                {filteredDoctors.map(doctor => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-cream/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ignition-amber to-champagne-gold flex items-center justify-center text-white text-sm font-bold">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-deep-teal">{doctor.name}</p>
                          {doctor.title && (
                            <p className="text-xs text-deep-teal/50">{doctor.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doctor.specialty && (
                        <span className="inline-block px-2 py-1 bg-ignition-amber/10 border border-ignition-amber/20 rounded text-xs text-ignition-amber">
                          {doctor.specialty}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-deep-teal">{doctor.facility?.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-deep-teal/70">
                        {doctor.facility ? `${doctor.facility.city}, ${doctor.facility.country}` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-deep-teal/70">
                        {doctor.years_experience ? `${doctor.years_experience}+ years` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/doctors/${doctor.id}`);
                        }}
                        className="text-ignition-amber hover:text-champagne-gold text-sm font-medium transition-colors"
                      >
                        Edit →
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
      {!isLoading && filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-warm-clay/20 rounded-xl">
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-ignition-amber/20 to-champagne-gold/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-deep-teal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-serif text-xl text-deep-teal mb-2">No doctors found</h3>
          <p className="text-deep-teal/60 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('all');
            }}
            className="px-6 py-2 bg-gradient-to-r from-ignition-amber to-champagne-gold text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
