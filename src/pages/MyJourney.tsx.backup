import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import PatientJourneyWizard from '../components/Journey/PatientJourneyWizard';
import JourneyDashboard from '../components/Journey/JourneyDashboard';

const MyJourney: React.FC = () => {
  const navigate = useNavigate();
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  // Check authentication
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch active journey
  const { data: journey, isLoading: journeyLoading, refetch: refetchJourney } = useQuery({
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

  useEffect(() => {
    if (journey) {
      setActiveJourneyId(journey.id);
    }
  }, [journey]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/my-journey');
    }
  }, [authLoading, user, navigate]);

  const handleWizardComplete = async (journeyId: string) => {
    setActiveJourneyId(journeyId);
    await refetchJourney();
  };

  const handleStartNewJourney = () => {
    setActiveJourneyId(null);
  };

  if (authLoading || journeyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-700 font-display">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-ocean-700">My Journey</h1>
              <p className="text-sm text-ocean-600">Your personal medical tourism planner</p>
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
              {journey && (
                <button
                  onClick={handleStartNewJourney}
                  className="px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors"
                >
                  Start New Journey
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeJourneyId && journey ? (
          <JourneyDashboard journey={journey} />
        ) : (
          <>
            {/* Welcome Section */}
            <div className="max-w-3xl mx-auto px-4 pt-12 pb-6 text-center">
              <h2 className="text-4xl font-display text-ocean-800 mb-4">
                Let's Start Your Journey
              </h2>
              <p className="text-lg text-ocean-600 max-w-2xl mx-auto">
                Answer 3 quick questions to get personalized facility recommendations and start comparing your options.
              </p>
            </div>

            {/* Wizard */}
            <PatientJourneyWizard onComplete={handleWizardComplete} />
          </>
        )}
      </main>
    </div>
  );
};

export default MyJourney;
