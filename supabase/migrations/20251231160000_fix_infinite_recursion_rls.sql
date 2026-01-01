-- Fix infinite recursion in RLS policies
-- The previous migration created a circular dependency between patient_journeys and journey_collaborators

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Anyone can view journey info for pending invitations" ON patient_journeys;

-- Create a SECURITY DEFINER function to check if a journey has a pending invitation
-- This bypasses RLS and avoids the circular dependency
CREATE OR REPLACE FUNCTION journey_has_pending_invitation(journey_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM journey_collaborators
    WHERE journey_id = journey_uuid
    AND status = 'pending'
    AND invitation_token IS NOT NULL
  );
$$;

-- Grant execute to anon (unauthenticated) and authenticated users
GRANT EXECUTE ON FUNCTION journey_has_pending_invitation(UUID) TO anon;
GRANT EXECUTE ON FUNCTION journey_has_pending_invitation(UUID) TO authenticated;

-- Recreate the policy using the function instead of direct table reference
CREATE POLICY "Anyone can view journey info for pending invitations"
  ON patient_journeys FOR SELECT
  USING (
    journey_has_pending_invitation(id)
  );
