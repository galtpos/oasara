import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

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

interface SharedJourneyViewProps {
  journeyId: string;
}

const SharedJourneyView: React.FC<SharedJourneyViewProps> = ({ journeyId }) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'notes'>('facilities');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check user's role for this journey
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_journey_role', { p_journey_id: journeyId, p_user_id: user.id });

      if (!error && data) {
        setUserRole(data);
      }
    };

    checkRole();
  }, [journeyId]);

  // Fetch journey details
  const { data: journey, isLoading: journeyLoading } = useQuery({
    queryKey: ['journey', journeyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_journeys')
        .select('*')
        .eq('id', journeyId)
        .single();

      if (error) throw error;

      // Log view access
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_journey_access', {
          p_journey_id: journeyId,
          p_user_id: user.id,
          p_action: 'view'
        });
      }

      return data as Journey;
    }
  });

  // Fetch shortlisted facilities
  const { data: shortlistedFacilities, isLoading: facilitiesLoading } = useQuery({
    queryKey: ['journey-facilities', journeyId],
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
            popular_procedures,
            specialties
          )
        `)
        .eq('journey_id', journeyId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch journey notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['journey-notes', journeyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_notes')
        .select('*')
        .eq('journey_id', journeyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (journeyLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Journey not found or you don't have access.</p>
        </div>
      </div>
    );
  }

  const shortlistCount = shortlistedFacilities?.length || 0;
  const notesCount = notes?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Viewer Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2 bg-sage-100 border border-sage-300 rounded-lg">
          <svg className="w-5 h-5 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium text-sage-800">
            {userRole === 'viewer' ? 'Viewing shared journey' : 'Your journey'}
          </span>
        </div>

        {userRole === 'owner' && (
          <Link
            to="/my-journey"
            className="text-sm text-ocean-600 hover:text-ocean-800 transition-colors"
          >
            Back to My Journey
          </Link>
        )}
      </div>

      {/* Journey Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
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
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <div className="flex border-b border-sage-200">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex-1 px-6 py-4 font-medium transition-all ${
              activeTab === 'facilities'
                ? 'text-ocean-700 border-b-2 border-ocean-600 bg-ocean-50/50'
                : 'text-ocean-600 hover:bg-sage-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Facilities ({shortlistCount})</span>
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
          {activeTab === 'facilities' && (
            <div>
              {facilitiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
                </div>
              ) : shortlistedFacilities && shortlistedFacilities.length > 0 ? (
                <div className="grid gap-4">
                  {shortlistedFacilities.map((item: any) => {
                    const facility = item.facilities;
                    return (
                      <motion.div
                        key={item.id}
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
                            {item.notes && (
                              <div className="mt-3 p-3 bg-sage-50 rounded-lg">
                                <p className="text-sm text-ocean-700">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-sage-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sage-600">No facilities added yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              {notesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note: any) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border-2 border-sage-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          note.note_type === 'question' ? 'bg-yellow-100' :
                          note.note_type === 'concern' ? 'bg-red-100' :
                          note.note_type === 'todo' ? 'bg-blue-100' :
                          'bg-sage-100'
                        }`}>
                          <svg className="w-5 h-5 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-ocean-800 whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-ocean-500 mt-2">
                            {new Date(note.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-sage-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-sage-600">No notes yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedJourneyView;
