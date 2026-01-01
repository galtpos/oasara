-- Grant anon (unauthenticated) users access to read invitations and journeys
-- This is required for the AcceptInvite page to work before the user logs in

-- Grant SELECT on journey_collaborators to anon
-- (RLS policy "Anyone can view pending invitations by token" controls what they can actually see)
GRANT SELECT ON journey_collaborators TO anon;

-- Grant SELECT on patient_journeys to anon
-- (RLS policy "Anyone can view journey info for pending invitations" controls what they can actually see)
GRANT SELECT ON patient_journeys TO anon;

-- Also grant access to the helper function
GRANT EXECUTE ON FUNCTION journey_has_pending_invitation(UUID) TO anon;
