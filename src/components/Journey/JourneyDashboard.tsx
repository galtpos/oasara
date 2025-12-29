import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ComparisonTable from './ComparisonTable';
import FacilityShortlist from './FacilityShortlist';
import PersonalNotes from './PersonalNotes';
import { Link } from 'react-router-dom';
import JourneyChatbot from './JourneyChatbot';

interface Journey {
  id: string;
  user_id: string;
  procedure_type: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  status: string;
  created_at: string;
}

interface JourneyDashboardProps {
  journey: Journey;
}

const JourneyDashboard: React.FC<JourneyDashboardProps> = ({ journey }) => {
  const [activeTab, setActiveTab] = useState<'compare' | 'shortlist' | 'notes'>('compare');

  // Fetch shortlisted facilities
  const { data: shortlistedFacilities, isLoading: facilitiesLoading, refetch: refetchShortlist } = useQuery({
    queryKey: ['journey-facilities', journey.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_facilities')
        .select(`
          *,
          facilities (
            id,
            name,
            city,
            country,
            jci_accredited,
            google_rating,
            popular_procedures
          )
        `)
        .eq('journey_id', journey.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch journey notes
  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ['journey-notes', journey.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_notes')
        .select('*')
        .eq('journey_id', journey.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch recommended facilities based on journey criteria
  const { data: recommendedFacilities } = useQuery({
    queryKey: ['recommended-facilities', journey.procedure_type],
    queryFn: async () => {
      let query = supabase
        .from('facilities')
        .select('*')
        .eq('jci_accredited', true)
        .limit(20);

      // Filter by procedure type if available
      if (journey.procedure_type) {
        // Use ilike for case-insensitive partial match
        query = query.ilike('specialties', `%${journey.procedure_type.split(' ')[0]}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  const shortlistCount = shortlistedFacilities?.length || 0;
  const notesCount = notes?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Journey Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-display text-ocean-800 mb-2">
              {journey.procedure_type}
            </h2>
            <div className="flex items-center gap-4 text-sm text-ocean-600">
              {journey.budget_min && journey.budget_max && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${journey.budget_min.toLocaleString()} - ${journey.budget_max.toLocaleString()}
                </span>
              )}
              {journey.timeline && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {journey.timeline.charAt(0).toUpperCase() + journey.timeline.slice(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {shortlistCount} facilities saved
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              // Trigger chatbot to open
              const chatButton = document.querySelector('[data-chatbot-toggle]') as HTMLButtonElement;
              if (chatButton && !chatButton.getAttribute('data-is-open')) {
                chatButton.click();
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask AI for Recommendations
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <div className="flex border-b border-sage-200">
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'compare'
                ? 'text-ocean-700 border-b-2 border-ocean-600 bg-ocean-50/50'
                : 'text-ocean-600 hover:bg-sage-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Compare ({shortlistCount})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('shortlist')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'shortlist'
                ? 'text-ocean-700 border-b-2 border-ocean-600 bg-ocean-50/50'
                : 'text-ocean-600 hover:bg-sage-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>My Shortlist</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'notes'
                ? 'text-ocean-700 border-b-2 border-ocean-600 bg-ocean-50/50'
                : 'text-ocean-600 hover:bg-sage-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Notes ({notesCount})</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'compare' && (
            <>
              <ComparisonTable
                journeyId={journey.id}
                shortlistedFacilities={shortlistedFacilities || []}
                isLoading={facilitiesLoading}
              />

              {/* Recommendations Section - Show when shortlist is small */}
              {recommendedFacilities && recommendedFacilities.length > 0 && shortlistCount < 5 && (
                <div className="mt-8 border-t-2 border-sage-200 pt-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-display text-ocean-800 mb-2">
                      Recommended for {journey.procedure_type}
                    </h3>
                    <p className="text-sm text-ocean-600">
                      Based on your budget of ${journey.budget_min?.toLocaleString()} - ${journey.budget_max?.toLocaleString()} and preferences
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {recommendedFacilities.slice(0, 5).map((facility: any) => {
                      const isInShortlist = shortlistedFacilities?.some(sf => sf.facility_id === facility.id);
                      if (isInShortlist) return null;

                      return (
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
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('journey_facilities')
                                    .insert({ journey_id: journey.id, facility_id: facility.id });
                                  if (error) throw error;
                                  refetchShortlist();
                                } catch (error) {
                                  console.error('Error adding facility:', error);
                                }
                              }}
                              className="ml-4 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add to Compare
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        const chatButton = document.querySelector('[data-chatbot-toggle]') as HTMLButtonElement;
                        if (chatButton && !chatButton.getAttribute('data-is-open')) {
                          chatButton.click();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-xl transition-all font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Ask AI About More Facilities
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'shortlist' && (
            <FacilityShortlist
              journeyId={journey.id}
              shortlistedFacilities={shortlistedFacilities || []}
              recommendedFacilities={recommendedFacilities || []}
              onUpdate={refetchShortlist}
            />
          )}

          {activeTab === 'notes' && (
            <PersonalNotes
              journeyId={journey.id}
              notes={notes || []}
              onUpdate={refetchNotes}
            />
          )}
        </div>
      </div>

      {/* AI Chatbot - Fixed position */}
      <JourneyChatbot
        journey={journey}
        shortlistedFacilities={shortlistedFacilities || []}
      />
    </div>
  );
};

export default JourneyDashboard;
