-- ============================================================================
-- OASARA ADMIN SECURITY POLICIES
-- Lock down database with proper role-based access control
-- ============================================================================

-- Drop existing public write policies (scraping convenience, not production-ready)
DROP POLICY IF EXISTS "Allow public updates to facilities" ON facilities;
DROP POLICY IF EXISTS "Allow public inserts to facilities" ON facilities;
DROP POLICY IF EXISTS "Allow inserts to doctors" ON doctors;
DROP POLICY IF EXISTS "Allow inserts to procedure_pricing" ON procedure_pricing;
DROP POLICY IF EXISTS "Allow inserts to facility_packages" ON facility_packages;
DROP POLICY IF EXISTS "Allow inserts to testimonials" ON testimonials;
DROP POLICY IF EXISTS "Allow inserts to success_metrics" ON success_metrics;
DROP POLICY IF EXISTS "Allow inserts to ai_extracted_data" ON ai_extracted_data;

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FACILITIES TABLE - Admin-only write access
-- ============================================================================

-- Public can still read facilities
-- (Already exists from previous migration)

-- Admins can create facilities
CREATE POLICY "Admins can create facilities"
ON facilities FOR INSERT
WITH CHECK (is_admin());

-- Admins can update facilities
CREATE POLICY "Admins can update facilities"
ON facilities FOR UPDATE
USING (is_admin());

-- Admins can delete facilities
CREATE POLICY "Admins can delete facilities"
ON facilities FOR DELETE
USING (is_admin());

-- ============================================================================
-- DOCTORS TABLE - Admin-only write access
-- ============================================================================

-- Public can read doctors
CREATE POLICY "Public can view doctors"
ON doctors FOR SELECT
USING (true);

-- Admins can manage doctors
CREATE POLICY "Admins can insert doctors"
ON doctors FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update doctors"
ON doctors FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete doctors"
ON doctors FOR DELETE
USING (is_admin());

-- ============================================================================
-- PROCEDURE_PRICING TABLE - Admin-only write access
-- ============================================================================

-- Public can read pricing
CREATE POLICY "Public can view pricing"
ON procedure_pricing FOR SELECT
USING (true);

-- Admins can manage pricing
CREATE POLICY "Admins can insert pricing"
ON procedure_pricing FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update pricing"
ON procedure_pricing FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete pricing"
ON procedure_pricing FOR DELETE
USING (is_admin());

-- ============================================================================
-- FACILITY_PACKAGES TABLE - Admin-only write access
-- ============================================================================

-- Public can read packages
CREATE POLICY "Public can view packages"
ON facility_packages FOR SELECT
USING (true);

-- Admins can manage packages
CREATE POLICY "Admins can insert packages"
ON facility_packages FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update packages"
ON facility_packages FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete packages"
ON facility_packages FOR DELETE
USING (is_admin());

-- ============================================================================
-- TESTIMONIALS TABLE - Admin-only write access
-- ============================================================================

-- Public can read verified testimonials only
CREATE POLICY "Public can view verified testimonials"
ON testimonials FOR SELECT
USING (verified = true);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
ON testimonials FOR SELECT
USING (is_admin());

-- Admins can manage testimonials
CREATE POLICY "Admins can insert testimonials"
ON testimonials FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update testimonials"
ON testimonials FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete testimonials"
ON testimonials FOR DELETE
USING (is_admin());

-- ============================================================================
-- SUCCESS_METRICS TABLE - Admin-only write access
-- ============================================================================

-- Public can read verified metrics
CREATE POLICY "Public can view verified metrics"
ON success_metrics FOR SELECT
USING (verified = true);

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
ON success_metrics FOR SELECT
USING (is_admin());

-- Admins can manage metrics
CREATE POLICY "Admins can insert metrics"
ON success_metrics FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update metrics"
ON success_metrics FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete metrics"
ON success_metrics FOR DELETE
USING (is_admin());

-- ============================================================================
-- AI_EXTRACTED_DATA TABLE - Admin-only write access
-- ============================================================================

-- Public can read verified AI data
CREATE POLICY "Public can view verified AI data"
ON ai_extracted_data FOR SELECT
USING (verified = true);

-- Admins can view all AI data
CREATE POLICY "Admins can view all AI data"
ON ai_extracted_data FOR SELECT
USING (is_admin());

-- Admins can manage AI data
CREATE POLICY "Admins can insert AI data"
ON ai_extracted_data FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update AI data"
ON ai_extracted_data FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete AI data"
ON ai_extracted_data FOR DELETE
USING (is_admin());

-- ============================================================================
-- USER_PROFILES TABLE - Admin overrides
-- ============================================================================

-- Admins can view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON user_profiles FOR SELECT
USING (is_admin());

-- Admins can update user profiles (for role changes)
CREATE POLICY "Admins can update user profiles"
ON user_profiles FOR UPDATE
USING (is_admin());

-- ============================================================================
-- ADMIN AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  entity_type TEXT NOT NULL, -- 'facility', 'doctor', 'claim', 'user', etc.
  entity_id UUID,
  changes JSONB, -- Store before/after values
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- RLS: Admins can view all audit logs
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON admin_actions FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert audit logs"
ON admin_actions FOR INSERT
WITH CHECK (true); -- Allow system inserts (via triggers)

-- ============================================================================
-- ADMIN TASKS TABLE (for manual review queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL, -- 'review_facility', 'verify_pricing', 'moderate_testimonial', etc.
  entity_type TEXT NOT NULL, -- 'facility', 'doctor', 'testimonial', etc.
  entity_id UUID,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT, -- Admin notes
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for task queries
CREATE INDEX IF NOT EXISTS idx_admin_tasks_assigned_to ON admin_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_status ON admin_tasks(status);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_priority ON admin_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due_date ON admin_tasks(due_date);

-- RLS: Admins can manage tasks
ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tasks"
ON admin_tasks FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can create tasks"
ON admin_tasks FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update tasks"
ON admin_tasks FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete tasks"
ON admin_tasks FOR DELETE
USING (is_admin());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_task_updated_at
BEFORE UPDATE ON admin_tasks
FOR EACH ROW
EXECUTE FUNCTION update_admin_task_updated_at();

-- ============================================================================
-- SAVED ADMIN SEARCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query JSONB NOT NULL, -- Store filter state
  entity_type TEXT NOT NULL, -- 'facility', 'doctor', 'testimonial', etc.
  is_shared BOOLEAN DEFAULT false, -- Share with other admins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying saved searches
CREATE INDEX IF NOT EXISTS idx_admin_saved_searches_admin_id ON admin_saved_searches(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_saved_searches_entity_type ON admin_saved_searches(entity_type);

-- RLS: Users can manage their own saved searches
ALTER TABLE admin_saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches"
ON admin_saved_searches FOR SELECT
USING (admin_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can create saved searches"
ON admin_saved_searches FOR INSERT
WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update their own saved searches"
ON admin_saved_searches FOR UPDATE
USING (admin_id = auth.uid());

CREATE POLICY "Users can delete their own saved searches"
ON admin_saved_searches FOR DELETE
USING (admin_id = auth.uid());

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission on helper function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user has admin role';
COMMENT ON TABLE admin_actions IS 'Audit log of all admin actions for compliance and debugging';
COMMENT ON TABLE admin_tasks IS 'Task queue for manual review and data quality management';
COMMENT ON TABLE admin_saved_searches IS 'User-saved search filters for quick access';

-- ============================================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================================

-- Verify all tables have RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN
-- ('facilities', 'doctors', 'procedure_pricing', 'testimonials', 'admin_actions');

-- Verify admin policies exist:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('facilities', 'doctors', 'procedure_pricing');
