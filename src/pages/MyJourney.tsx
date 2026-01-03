import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import JourneyDashboard from '../components/Journey/JourneyDashboard';
import SiteHeader from '../components/Layout/SiteHeader';

interface UserPledges {
  medical_trust: boolean;
  cancel_insurance: boolean;
  try_medical_tourism: boolean;
}

const MyJourney: React.FC = () => {
  const navigate = useNavigate();
  const [allJourneys, setAllJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track selected journey index
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(0);

  // Journey renaming state
  const [isRenamingJourney, setIsRenamingJourney] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');

  // User's pledge status
  const [userPledges, setUserPledges] = useState<UserPledges>({
    medical_trust: false,
    cancel_insurance: false,
    try_medical_tourism: false,
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load user and journeys
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingTimeout(false);
      setError(null);

      console.log('[MyJourney] Starting loadData...');

      // Use getSession (cached, instant) not getUser (network call)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('[MyJourney] Session result:', session ? 'has session' : 'no session', sessionError ? `error: ${sessionError.message}` : '');

      if (sessionError) {
        console.error('[MyJourney] Session error:', sessionError);
        setError('Authentication error: ' + sessionError.message);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        console.log('[MyJourney] No session, redirecting to auth');
        setLoading(false);
        navigate('/auth', { replace: true });
        return;
      }

      const authUser = session.user;
      console.log('[MyJourney] User authenticated:', authUser.id);
      setUserEmail(authUser.email || null);

      // Get user's pledges
      if (authUser.email) {
        const { data: pledges } = await supabase
          .from('pledges')
          .select('pledge_type')
          .eq('email', authUser.email.toLowerCase());

        if (pledges) {
          const pledgeStatus: UserPledges = {
            medical_trust: false,
            cancel_insurance: false,
            try_medical_tourism: false,
          };
          pledges.forEach((p: { pledge_type: string }) => {
            if (p.pledge_type in pledgeStatus) {
              pledgeStatus[p.pledge_type as keyof UserPledges] = true;
            }
          });
          setUserPledges(pledgeStatus);
        }
      }

      // Get journeys
      const { data: journeys, error: journeyError } = await supabase
        .from('patient_journeys')
        .select('*')
        .eq('user_id', authUser.id)
        .in('status', ['researching', 'comparing', 'decided'])
        .order('created_at', { ascending: false });

      console.log('[MyJourney] Journeys result:', journeys?.length || 0, 'journeys', journeyError ? `error: ${journeyError.message}` : '');

      if (journeyError) {
        setError('Failed to load journeys: ' + journeyError.message);
        setLoading(false);
        return;
      }

      // If no journeys, redirect to start
      if (!journeys || journeys.length === 0) {
        console.log('[MyJourney] No journeys, redirecting to start');
        setLoading(false);
        navigate('/start', { replace: true });
        return;
      }

      setAllJourneys(journeys);
      setLoading(false);
      console.log('[MyJourney] Loaded successfully with', journeys.length, 'journeys');
    } catch (err: any) {
      console.error('[MyJourney] Unexpected error:', err);
      setError('Unexpected error: ' + (err.message || 'Unknown'));
      setLoading(false);
    }
  }, [navigate]);

  // Timeout for loading - show helpful message after 5 seconds
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Listen for auth state changes (magic link might take a moment)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[MyJourney] Auth state change:', event, session ? 'has session' : 'no session');
      if (event === 'SIGNED_IN' && session) {
        loadData();
      }
    });

    // Initial load
    loadData();

    return () => subscription.unsubscribe();
  }, [loadData]);

  // Get currently selected journey
  const journey = allJourneys?.[selectedJourneyIndex] || allJourneys?.[0] || null;

  // Handle journey rename
  const handleRenameJourney = async () => {
    if (!journey || !newJourneyName.trim()) return;

    const { error } = await supabase
      .from('patient_journeys')
      .update({ name: newJourneyName.trim() })
      .eq('id', journey.id);

    if (error) {
      console.error('Error renaming journey:', error);
      return;
    }

    setIsRenamingJourney(false);
    loadData(); // Refresh
  };

  const handleStartNewJourney = () => {
    navigate('/my-journey/chat?new=true');
  };

  // Handle journey deletion
  const handleDeleteJourney = async () => {
    if (!journey) return;

    const journeyName = journey.name || journey.procedure_type || 'this journey';

    if (!window.confirm(`Are you sure you want to delete "${journeyName}"?\n\nThis will permanently remove:\n• All shortlisted facilities\n• All personal notes\n• All journey data\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting journey:', journey.id);

      // Delete related data first - CHECK ERRORS!
      const { error: facError } = await supabase
        .from('journey_facilities')
        .delete()
        .eq('journey_id', journey.id);
      if (facError) console.error('Error deleting facilities:', facError);

      const { error: notesError } = await supabase
        .from('journey_notes')
        .delete()
        .eq('journey_id', journey.id);
      if (notesError) console.error('Error deleting notes:', notesError);

      const { error: collabError } = await supabase
        .from('journey_collaborators')
        .delete()
        .eq('journey_id', journey.id);
      if (collabError) console.error('Error deleting collaborators:', collabError);

      // Delete the journey itself
      const { error } = await supabase
        .from('patient_journeys')
        .delete()
        .eq('id', journey.id);

      if (error) {
        console.error('Error deleting journey:', error);
        alert('Failed to delete journey: ' + error.message);
        return;
      }

      console.log('Journey deleted successfully');

      // If this was the last journey, redirect to start
      if (allJourneys.length === 1) {
        navigate('/start', { replace: true });
        return;
      }

      // Reset to first journey and reload
      setSelectedJourneyIndex(0);
      loadData();
    } catch (err: any) {
      console.error('Delete journey error:', err);
      alert('Failed to delete journey: ' + (err.message || 'Unknown error'));
    }
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-700 font-display">Getting everything ready for you...</p>
          {loadingTimeout && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-ocean-500">Taking longer than expected...</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => loadData()}
                  className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/auth', { replace: true })}
                  className="px-4 py-2 bg-sage-200 text-ocean-700 rounded-lg hover:bg-sage-300 transition-colors text-sm"
                >
                  Sign In Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-display text-ocean-700 mb-2">Something went wrong</h2>
          <p className="text-ocean-600 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no journey (shouldn't happen, but just in case)
  if (!journey) {
    navigate('/start', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30">
      {/* Site-wide Header */}
      <SiteHeader />

      {/* Journey Controls Sub-header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-sage-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-ocean-700">
                My Journey
              </h1>
              <p className="text-sm text-ocean-600">
                Your personal healthcare companion
              </p>
              {/* Journey selector and rename */}
              {allJourneys && allJourneys.length > 0 && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {isRenamingJourney ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newJourneyName}
                        onChange={(e) => setNewJourneyName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameJourney()}
                        placeholder="Enter journey name..."
                        autoFocus
                        className="text-sm px-3 py-1.5 border border-ocean-400 rounded-lg bg-white text-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 w-48"
                      />
                      <button
                        onClick={handleRenameJourney}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsRenamingJourney(false)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      {allJourneys.length > 1 ? (
                        <>
                          <label className="text-xs text-ocean-500">Journey:</label>
                          <select
                            value={selectedJourneyIndex}
                            onChange={(e) => setSelectedJourneyIndex(Number(e.target.value))}
                            className="text-sm px-3 py-1.5 border border-sage-300 rounded-lg bg-white text-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                          >
                            {allJourneys.map((j, idx) => (
                              <option key={j.id} value={idx}>
                                {j.name || j.procedure_category || 'Healthcare Journey'} ({new Date(j.created_at).toLocaleDateString()})
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <span className="text-sm text-ocean-600 font-medium">
                          {journey?.name || journey?.procedure_category || 'Healthcare Journey'}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setNewJourneyName(journey?.name || journey?.procedure_category || '');
                          setIsRenamingJourney(true);
                        }}
                        className="p-1.5 text-ocean-500 hover:bg-sage-100 rounded-lg transition-colors"
                        title="Rename journey"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleDeleteJourney}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete journey"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {allJourneys.length > 1 && (
                        <span className="text-xs text-ocean-400">
                          ({allJourneys.length} journeys)
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartNewJourney}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-sage-50 rounded-lg transition-colors border-2 border-sage-200 hover:border-ocean-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Journey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pledge Status Banner */}
      {(!userPledges.medical_trust || !userPledges.cancel_insurance || !userPledges.try_medical_tourism) && (
        <div className="bg-gradient-to-r from-gold-50 to-ocean-50 border-b border-gold-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <p className="text-ocean-700 font-medium">Your Healthcare Sovereignty Pledges</p>
                  <div className="flex items-center gap-4 text-sm mt-1">
                    <span className={userPledges.medical_trust ? 'text-green-600' : 'text-ocean-400'}>
                      {userPledges.medical_trust ? '✓' : '○'} Medical Trust
                    </span>
                    <span className={userPledges.cancel_insurance ? 'text-green-600' : 'text-ocean-400'}>
                      {userPledges.cancel_insurance ? '✓' : '○'} Cancel Insurance
                    </span>
                    <span className={userPledges.try_medical_tourism ? 'text-green-600' : 'text-ocean-400'}>
                      {userPledges.try_medical_tourism ? '✓' : '○'} Medical Tourism
                    </span>
                  </div>
                </div>
              </div>
              <a
                href="/action"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                Complete Your Pledges
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* All Pledges Complete - Celebration */}
      {userPledges.medical_trust && userPledges.cancel_insurance && userPledges.try_medical_tourism && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">
                🎉 You've taken all three Healthcare Sovereignty pledges! You're leading the revolution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <JourneyDashboard journey={journey} />
      </div>
    </div>
  );
};

export default MyJourney;
