import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  jci_accredited: boolean;
  google_rating?: number;
  specialties?: string[];
}

interface ShortlistedFacility {
  id: string;
  journey_id: string;
  facility_id: string;
  notes: string | null;
  rating: number | null;
  added_at: string;
  facilities: Facility;
}

interface FacilityShortlistProps {
  journeyId: string;
  shortlistedFacilities: ShortlistedFacility[];
  recommendedFacilities: Facility[];
  onUpdate: () => void;
  onOpenChatbot?: () => void;
}

const FacilityShortlist: React.FC<FacilityShortlistProps> = ({
  journeyId,
  shortlistedFacilities,
  recommendedFacilities,
  onUpdate,
  onOpenChatbot
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleRemove = async (journeyFacilityId: string) => {
    setRemovingId(journeyFacilityId);
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .delete()
        .eq('id', journeyFacilityId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error removing facility:', error);
      alert('Failed to remove facility');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAdd = async (facilityId: string) => {
    setAddingId(facilityId);
    try {
      const { error } = await supabase
        .from('journey_facilities')
        .insert({
          journey_id: journeyId,
          facility_id: facilityId
        });

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error adding facility:', error);
      alert('Failed to add facility. It may already be in your shortlist.');
    } finally {
      setAddingId(null);
    }
  };

  const shortlistedIds = shortlistedFacilities.map(sf => sf.facility_id);
  const availableRecommendations = recommendedFacilities.filter(
    rf => !shortlistedIds.includes(rf.id)
  );

  return (
    <div className="space-y-8">
      {/* Current Shortlist */}
      <div>
        <h3 className="text-xl font-display text-ocean-800 mb-4">
          Your Shortlist ({shortlistedFacilities.length})
        </h3>

        {shortlistedFacilities.length === 0 ? (
          <div className="text-center py-8 bg-sage-50 rounded-xl">
            <p className="text-ocean-600">
              Your shortlist is empty. Add facilities below to compare them.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {shortlistedFacilities.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-2 border-sage-200 rounded-xl p-6 hover:border-ocean-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Link
                            to={`/facilities/${item.facilities.id}`}
                            className="text-xl font-display text-ocean-800 hover:text-ocean-600 transition-colors"
                          >
                            {item.facilities.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2 text-sm text-ocean-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {item.facilities.city}, {item.facilities.country}
                            </span>
                            {item.facilities.jci_accredited && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                JCI
                              </span>
                            )}
                            {item.facilities.google_rating && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {item.facilities.google_rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <div className="mt-3 p-3 bg-sage-50 rounded-lg">
                              <p className="text-sm text-ocean-700">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from shortlist"
                    >
                      {removingId === item.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Recommended Facilities */}
      {availableRecommendations.length > 0 && (
        <div>
          <h3 className="text-xl font-display text-ocean-800 mb-4">
            Recommended for You
          </h3>
          <p className="text-sm text-ocean-600 mb-4">
            Based on your procedure type and preferences
          </p>

          <div className="grid gap-4">
            {availableRecommendations.slice(0, 5).map((facility) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-sage-200 rounded-xl p-6 hover:border-ocean-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/facilities/${facility.id}`}
                      className="text-xl font-display text-ocean-800 hover:text-ocean-600 transition-colors"
                    >
                      {facility.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-2 text-sm text-ocean-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {facility.city}, {facility.country}
                      </span>
                      {facility.jci_accredited && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          JCI
                        </span>
                      )}
                      {facility.google_rating && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {facility.google_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {facility.specialties && facility.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {facility.specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-ocean-50 text-ocean-700 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(facility.id)}
                    disabled={addingId === facility.id}
                    className="ml-4 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                  >
                    {addingId === facility.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onOpenChatbot}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Ask AI for Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityShortlist;
