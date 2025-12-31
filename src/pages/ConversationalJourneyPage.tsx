import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationalJourney from '../components/Journey/ConversationalJourney';
import { supabase } from '../lib/supabase';

const ConversationalJourneyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [journeyId, setJourneyId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkJourney = async () => {
      try {
        // Check if user has valid session (not just cached user data)
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session || !session.user) {
          // Redirect to login with return URL
          console.log('[Auth] No valid session found, redirecting to login');
          navigate('/login?redirect=/my-journey/chat', { replace: true });
          return;
        }

        const user = session.user;
        console.log('[Auth] Valid session found:', user.email);

        // Get journey ID from URL params or check if user has existing journey
        const paramJourneyId = searchParams.get('id');

        if (paramJourneyId) {
          console.log('[Journey] Using journey from URL:', paramJourneyId);
          setJourneyId(paramJourneyId);
          setLoading(false);
          return;
        }

        // Check if user has an active journey
        const { data: journeys, error: journeyError } = await supabase
          .from('patient_journeys')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'researching')
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

        setLoading(false);
      } catch (error) {
        console.error('[Journey] Unexpected error:', error);
        setLoading(false);
      }
    };

    checkJourney();
  }, [searchParams, navigate]);

  // Don't render anything while checking auth - prevents flash of content
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

  // This component should only be reachable if authenticated
  return <ConversationalJourney journeyId={journeyId} />;
};

export default ConversationalJourneyPage;
