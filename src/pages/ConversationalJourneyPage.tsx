import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationalJourney from '../components/Journey/ConversationalJourney';
import { supabase } from '../lib/supabase';
import { getGuestJourney } from '../lib/guestJourney';

const ConversationalJourneyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [journeyId, setJourneyId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkJourney = async () => {
      try {
        // Check if user wants to start a NEW journey (don't load existing)
        const isNewJourney = searchParams.get('new') === 'true';

        // Get journey ID from URL params first
        const paramJourneyId = searchParams.get('id');

        if (paramJourneyId) {
          console.log('[Journey] Using journey from URL:', paramJourneyId);
          setJourneyId(paramJourneyId);
          setLoading(false);
          return;
        }

        // If starting a new journey, skip loading existing
        if (isNewJourney) {
          console.log('[Journey] Starting fresh journey (new=true)');
          setLoading(false);
          return;
        }

        // Check if user has valid session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('[Auth] Valid session found:', session.user.email);

          // Check if user has an active journey (any active status)
          const { data: journeys, error: journeyError } = await supabase
            .from('patient_journeys')
            .select('id')
            .eq('user_id', session.user.id)
            .in('status', ['researching', 'comparing', 'decided'])
            .order('created_at', { ascending: false })
            .limit(1);

          if (journeyError) {
            console.error('[Journey] Error fetching journey:', journeyError);
          }

          if (journeys && journeys.length > 0) {
            console.log('[Journey] Found existing journey:', journeys[0].id);
            setJourneyId(journeys[0].id);
          } else {
            console.log('[Journey] No existing journey found, starting fresh');
          }
        } else {
          // Guest user - check localStorage for guest journey
          console.log('[Auth] No session, checking guest journey');
          const guestJourney = getGuestJourney();
          if (guestJourney?.id) {
            console.log('[Journey] Found guest journey:', guestJourney.id);
            setJourneyId(guestJourney.id);
          } else {
            console.log('[Journey] No guest journey, starting fresh onboarding');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('[Journey] Unexpected error:', error);
        setLoading(false);
      }
    };

    checkJourney();
  }, [searchParams]);

  // Don't render anything while checking - prevents flash of content
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sage-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-700 font-display">Loading your journey...</p>
        </div>
      </div>
    );
  }

  // Works for both authenticated users and guests
  return <ConversationalJourney journeyId={journeyId} />;
};

export default ConversationalJourneyPage;
