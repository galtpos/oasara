-- Fix RLS policies that reference auth.users directly
-- The auth.users table cannot be queried directly from RLS policies

-- First, create a helper function to get current user's email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_email() TO authenticated;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their pending invitations" ON journey_collaborators;
DROP POLICY IF EXISTS "Users can accept/decline invitations" ON journey_collaborators;

-- Recreate with fixed policies using the helper function
CREATE POLICY "Users can view their pending invitations"
  ON journey_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    (email = get_current_user_email() AND status = 'pending')
  );

CREATE POLICY "Users can accept/decline invitations"
  ON journey_collaborators FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (email = get_current_user_email() AND status = 'pending')
  )
  WITH CHECK (
    user_id = auth.uid() OR
    email = get_current_user_email()
  );
