-- Clear test/fake feedback data
-- This migration removes test data and adds proper RLS delete policy

-- Add delete policy for feedback table (allow anyone to delete for now)
DROP POLICY IF EXISTS "feedback_delete" ON feedback;
CREATE POLICY "feedback_delete" ON feedback FOR DELETE USING (true);

-- Truncate the feedback table to remove all test data
TRUNCATE TABLE feedback;
