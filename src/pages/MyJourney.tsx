import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getGuestJourney, shouldPromptToSave, getGuestEngagementMetrics, clearGuestJourney } from '../lib/guestJourney';
import PatientJourneyWizard from '../components/Journey/PatientJourneyWizard';
import JourneyDashboard from '../components/Journey/JourneyDashboard';

const MyJourney: React.FC = () => {
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Check authentication
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch authenticated user's journey
  const { data: authJourney, isLoading: journeyLoading, refetch: refetchJourney } = useQuery({
    queryKey: ['active-journey', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('patient_journeys')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['researching', 'comparing', 'decided'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching journey:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  // Get guest journey from localStorage
  const guestJourney = getGuestJourney();

  // Determine which journey to use
  useEffect(() => {
    if (user && authJourney) {
      // Authenticated user with journey
      setActiveJourneyId(authJourney.id);
      setIsGuest(false);
    } else if (guestJourney) {
      // Guest user with localStorage journey
      setActiveJourneyId(guestJourney.id);
      setIsGuest(true);

      // Check if we should prompt to save
      if (shouldPromptToSave() && !user) {
        setTimeout(() => setShowSavePrompt(true), 3000); // Show after 3 seconds
      }
    }
  }, [user, authJourney, guestJourney]);

  const handleWizardComplete = async (journeyId: string) => {
    setActiveJourneyId(journeyId);
    if (!isGuest) {
      await refetchJourney();
    }
  };

  const handleStartNewJourney = () => {
    setActiveJourneyId(null);
    if (isGuest) {
      clearGuestJourney();
    }
  };

  const handleSaveJourney = async () => {
    // Navigate to signup with return URL
    window.location.href = '/signup?save-journey=true';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-700 font-display">Loading your journey...</p>
        </div>
      </div>
    );
  }

  // Render journey or wizard
  const journey = user ? authJourney : guestJourney;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-ocean-700 flex items-center gap-2">
                My Journey
                {isGuest && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-normal">
                    Guest Mode
                  </span>
                )}
              </h1>
              <p className="text-sm text-ocean-600">
                {isGuest ? 'Browsing as guest - save your progress anytime' : 'Your personal medical tourism planner'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/guide"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors border-2 border-sage-200 hover:border-ocean-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View Guide
              </Link>
              {isGuest && (
                <button
                  onClick={handleSaveJourney}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Journey
                </button>
              )}
              {journey && (
                <button
                  onClick={handleStartNewJourney}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors border-2 border-sage-200 hover:border-ocean-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Journey
                </button>
              )}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Save Journey Prompt */}
      <AnimatePresence>
        {showSavePrompt && isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border-2 border-ocean-200 p-6"
          >
            <button
              onClick={() => setShowSavePrompt(false)}
              className="absolute top-2 right-2 p-1 text-ocean-400 hover:text-ocean-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ocean-800 mb-1">
                  Love what you're seeing?
                </h3>
                <p className="text-sm text-ocean-600 mb-4">
                  Save your journey progress and access it from any device. Takes 30 seconds.
                </p>
                {getGuestEngagementMetrics() && (
                  <div className="bg-sage-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-ocean-700 space-y-1">
                      <div>✓ {getGuestEngagementMetrics()!.facilitiesCount} facilities saved</div>
                      <div>✓ {getGuestEngagementMetrics()!.notesCount} notes created</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveJourney}
                    className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors font-medium text-sm"
                  >
                    Save My Journey
                  </button>
                  <button
                    onClick={() => setShowSavePrompt(false)}
                    className="px-4 py-2 text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors text-sm"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!journey ? (
          <PatientJourneyWizard onComplete={handleWizardComplete} />
        ) : (
          <JourneyDashboard journey={journey} />
        )}
      </div>
    </div>
  );
};

export default MyJourney;
