-- Fix RLS policies to allow standalone contact requests (null journey_id)

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create contact requests in own journeys" ON contact_requests;

-- New policy: Allow inserts for authenticated users
-- Either with their own journey OR standalone (null journey_id)
CREATE POLICY "Users can create contact requests"
  ON contact_requests FOR INSERT
  WITH CHECK (
    -- Allow standalone requests (null journey_id) for any authenticated user
    (journey_id IS NULL AND auth.uid() IS NOT NULL)
    OR
    -- Allow requests linked to user's own journeys
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Update SELECT policy to also allow viewing standalone requests by email
DROP POLICY IF EXISTS "Users can view own contact requests" ON contact_requests;

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
    -- View standalone requests where email matches user
    (journey_id IS NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Update UPDATE policy similarly
DROP POLICY IF EXISTS "Users can update own contact requests" ON contact_requests;

CREATE POLICY "Users can update own contact requests"
  ON contact_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
    OR
    (journey_id IS NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
