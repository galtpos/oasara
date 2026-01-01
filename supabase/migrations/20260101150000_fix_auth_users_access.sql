-- Fix RLS policies that incorrectly access auth.users (which is not accessible to users)
-- Use auth.jwt() to get email from the JWT token instead

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own contact requests" ON contact_requests;
DROP POLICY IF EXISTS "Users can update own contact requests" ON contact_requests;

-- Recreate SELECT policy using auth.jwt() instead of auth.users
CREATE POLICY "Users can view own contact requests"
  ON contact_requests FOR SELECT
  USING (
    -- View requests linked to user's journeys
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
    OR
    -- View standalone requests where email matches user's JWT email
    (journey_id IS NULL AND user_email = (auth.jwt() ->> 'email'))
  );

-- Recreate UPDATE policy using auth.jwt() instead of auth.users
CREATE POLICY "Users can update own contact requests"
  ON contact_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
    OR
    (journey_id IS NULL AND user_email = (auth.jwt() ->> 'email'))
  );
