import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import JourneyDashboard from '../components/Journey/JourneyDashboard';
import SiteHeader from '../components/Layout/SiteHeader';

const MyJourney: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [allJourneys, setAllJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track selected journey index
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(0);

  // Journey renaming state
  const [isRenamingJourney, setIsRenamingJourney] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');

  // Load user and journeys
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use getSession (cached, instant) not getUser (network call)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/auth', { replace: true });
        return;
      }

      const authUser = session.user;
      setUser(authUser);

      // Get journeys
      const { data: journeys, error: journeyError } = await supabase
        .from('patient_journeys')
        .select('*')
        .eq('user_id', authUser.id)
        .in('status', ['researching', 'comparing', 'decided'])
        .order('created_at', { ascending: false });

      if (journeyError) {
        setError('Failed to load journeys: ' + journeyError.message);
        setLoading(false);
        return;
      }

      // If no journeys, redirect to start
      if (!journeys || journeys.length === 0) {
        navigate('/start', { replace: true });
        return;
      }

      setAllJourneys(journeys);
      setLoading(false);
    } catch (err: any) {
      console.error('MyJourney error:', err);
      setError('Unexpected error: ' + (err.message || 'Unknown'));
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
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

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ocean-700 font-display">Getting everything ready for you...</p>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <JourneyDashboard journey={journey} />
      </div>
    </div>
  );
};

export default MyJourney;
