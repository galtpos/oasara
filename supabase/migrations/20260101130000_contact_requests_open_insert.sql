-- Simplify: Allow any authenticated user to create contact requests
-- The Netlify function handles email sending, we just need to track

-- Drop all existing insert policies
DROP POLICY IF EXISTS "Users can create contact requests" ON contact_requests;
DROP POLICY IF EXISTS "Users can create contact requests in own journeys" ON contact_requests;

-- Simple policy: Any authenticated user can insert
CREATE POLICY "Authenticated users can create contact requests"
  ON contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anon users (for non-logged-in contact forms)
CREATE POLICY "Anyone can create contact requests"
  ON contact_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant to anon as well
GRANT INSERT ON contact_requests TO anon;
