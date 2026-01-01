-- Allow anyone to view a pending invitation by its token
-- This is needed for the accept-invite page to work for unauthenticated users
CREATE POLICY "Anyone can view pending invitations by token"
  ON journey_collaborators FOR SELECT
  USING (
    status = 'pending' AND invitation_token IS NOT NULL
  );

-- Also allow anyone to read journey details for pending invitations
-- (so AcceptInvite page can show procedure type, etc.)
CREATE POLICY "Anyone can view journey info for pending invitations"
  ON patient_journeys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journey_collaborators
      WHERE journey_collaborators.journey_id = patient_journeys.id
      AND journey_collaborators.status = 'pending'
    )
  );
