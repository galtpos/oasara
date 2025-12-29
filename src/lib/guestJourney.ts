// Guest Journey Management - localStorage-based journey system
// Allows users to browse and use the platform without authentication

export interface GuestJourney {
  id: string;
  procedure_type: string;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  status: string;
  created_at: string;
  shortlisted_facilities: string[]; // Array of facility IDs
  notes: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
}

const GUEST_JOURNEY_KEY = 'oasara-guest-journey';
const GUEST_SESSION_KEY = 'oasara-guest-session';

// Generate a unique guest session ID
export const getGuestSessionId = (): string => {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Create a new guest journey
export const createGuestJourney = (journeyData: {
  procedure: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
}): GuestJourney => {
  const journey: GuestJourney = {
    id: `guest-journey-${Date.now()}`,
    procedure_type: journeyData.procedure,
    budget_min: journeyData.budgetMin,
    budget_max: journeyData.budgetMax,
    timeline: journeyData.timeline,
    status: 'active',
    created_at: new Date().toISOString(),
    shortlisted_facilities: [],
    notes: []
  };

  localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(journey));
  return journey;
};

// Get the current guest journey
export const getGuestJourney = (): GuestJourney | null => {
  const journeyData = localStorage.getItem(GUEST_JOURNEY_KEY);
  if (!journeyData) return null;

  try {
    return JSON.parse(journeyData);
  } catch (error) {
    console.error('Error parsing guest journey:', error);
    return null;
  }
};

// Update guest journey
export const updateGuestJourney = (updates: Partial<GuestJourney>): void => {
  const currentJourney = getGuestJourney();
  if (!currentJourney) return;

  const updatedJourney = {
    ...currentJourney,
    ...updates
  };

  localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(updatedJourney));
};

// Add facility to guest shortlist
export const addGuestFacility = (facilityId: string): void => {
  const journey = getGuestJourney();
  if (!journey) return;

  if (!journey.shortlisted_facilities.includes(facilityId)) {
    journey.shortlisted_facilities.push(facilityId);
    localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(journey));
  }
};

// Remove facility from guest shortlist
export const removeGuestFacility = (facilityId: string): void => {
  const journey = getGuestJourney();
  if (!journey) return;

  journey.shortlisted_facilities = journey.shortlisted_facilities.filter(
    id => id !== facilityId
  );
  localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(journey));
};

// Add note to guest journey
export const addGuestNote = (content: string): void => {
  const journey = getGuestJourney();
  if (!journey) return;

  const note = {
    id: `note-${Date.now()}`,
    content,
    created_at: new Date().toISOString()
  };

  journey.notes.push(note);
  localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(journey));
};

// Delete note from guest journey
export const deleteGuestNote = (noteId: string): void => {
  const journey = getGuestJourney();
  if (!journey) return;

  journey.notes = journey.notes.filter(note => note.id !== noteId);
  localStorage.setItem(GUEST_JOURNEY_KEY, JSON.stringify(journey));
};

// Check if user has an active guest journey
export const hasGuestJourney = (): boolean => {
  return localStorage.getItem(GUEST_JOURNEY_KEY) !== null;
};

// Clear guest journey (when user creates account or wants fresh start)
export const clearGuestJourney = (): void => {
  localStorage.removeItem(GUEST_JOURNEY_KEY);
};

// Check if user should be prompted to save (based on engagement)
export const shouldPromptToSave = (): boolean => {
  const journey = getGuestJourney();
  if (!journey) return false;

  // Prompt if they have:
  // - 2+ facilities shortlisted
  // - OR 1+ notes
  // - OR journey is older than 5 minutes
  const hasEngagement =
    journey.shortlisted_facilities.length >= 2 ||
    journey.notes.length >= 1;

  const journeyAge = Date.now() - new Date(journey.created_at).getTime();
  const isMature = journeyAge > 5 * 60 * 1000; // 5 minutes

  return hasEngagement || isMature;
};

// Get engagement metrics for display
export const getGuestEngagementMetrics = () => {
  const journey = getGuestJourney();
  if (!journey) return null;

  return {
    facilitiesCount: journey.shortlisted_facilities.length,
    notesCount: journey.notes.length,
    daysSinceCreated: Math.floor(
      (Date.now() - new Date(journey.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
  };
};
