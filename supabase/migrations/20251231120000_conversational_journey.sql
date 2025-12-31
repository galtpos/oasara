-- Conversational Journey System Migration
-- Enables full conversational AI interface for journey management
-- Tables: conversation_history, tool_call_audit, journey_exports

-- Conversation History Table
-- Stores complete conversation history for each journey
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Additional context (facilities shown, tool calls, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_conversation_history_journey_id ON conversation_history(journey_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);

-- Tool Call Audit Table
-- Logs all function tool calls for security, debugging, and analytics
CREATE TABLE IF NOT EXISTS tool_call_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  parameters JSONB NOT NULL,
  result JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for analytics and debugging
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_user_id ON tool_call_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_journey_id ON tool_call_audit(journey_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_tool_name ON tool_call_audit(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_created_at ON tool_call_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_success ON tool_call_audit(success);

-- Journey Exports Table
-- Tracks PDF exports and other journey exports
CREATE TABLE IF NOT EXISTS journey_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'json', 'csv')),
  file_url TEXT,
  file_size_bytes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journey_exports_journey_id ON journey_exports(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_exports_user_id ON journey_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_exports_status ON journey_exports(status);
CREATE INDEX IF NOT EXISTS idx_journey_exports_created_at ON journey_exports(created_at DESC);

-- Helper Functions

-- Get conversation history for a journey
CREATE OR REPLACE FUNCTION get_conversation_history(p_journey_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, role, content, metadata, created_at
  FROM conversation_history
  WHERE journey_id = p_journey_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- Log a conversation message
CREATE OR REPLACE FUNCTION log_conversation(
  p_journey_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO conversation_history (journey_id, user_id, role, content, metadata)
  VALUES (p_journey_id, p_user_id, p_role, p_content, p_metadata)
  RETURNING id;
$$;

-- Log a tool call
CREATE OR REPLACE FUNCTION log_tool_call(
  p_user_id UUID,
  p_journey_id UUID,
  p_tool_name TEXT,
  p_parameters JSONB,
  p_result JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO tool_call_audit (
    user_id, journey_id, tool_name, parameters, result, success, error_message, execution_time_ms
  )
  VALUES (
    p_user_id, p_journey_id, p_tool_name, p_parameters, p_result, p_success, p_error_message, p_execution_time_ms
  )
  RETURNING id;
$$;

-- RLS Policies for conversation_history

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Users can view conversations for their own journeys
-- Note: Collaborator access will be added in Phase 3 after journey_sharing_system migration
CREATE POLICY "Users can view own conversation history"
  ON conversation_history FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = conversation_history.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Users can insert messages for their own journeys
CREATE POLICY "Users can insert conversation messages"
  ON conversation_history FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = conversation_history.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- System can insert assistant messages (via service role)
CREATE POLICY "System can insert assistant messages"
  ON conversation_history FOR INSERT
  WITH CHECK (role IN ('assistant', 'system'));

-- RLS Policies for tool_call_audit

ALTER TABLE tool_call_audit ENABLE ROW LEVEL SECURITY;

-- Journey owners can view tool call audit logs
CREATE POLICY "Users can view own tool call logs"
  ON tool_call_audit FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = tool_call_audit.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- System can insert tool call logs (via service role)
CREATE POLICY "System can insert tool call logs"
  ON tool_call_audit FOR INSERT
  WITH CHECK (true);

-- RLS Policies for journey_exports

ALTER TABLE journey_exports ENABLE ROW LEVEL SECURITY;

-- Users can view their own exports
CREATE POLICY "Users can view own exports"
  ON journey_exports FOR SELECT
  USING (user_id = auth.uid());

-- Users can create exports for their journeys
CREATE POLICY "Users can create exports"
  ON journey_exports FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_exports.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- System can update export status (via service role)
CREATE POLICY "System can update exports"
  ON journey_exports FOR UPDATE
  USING (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON conversation_history TO authenticated;
GRANT SELECT ON tool_call_audit TO authenticated;
GRANT SELECT, INSERT ON journey_exports TO authenticated;

GRANT EXECUTE ON FUNCTION get_conversation_history(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_conversation(UUID, UUID, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION log_tool_call(UUID, UUID, TEXT, JSONB, JSONB, BOOLEAN, TEXT, INTEGER) TO authenticated;

-- Table comments for documentation
COMMENT ON TABLE conversation_history IS 'Stores complete conversation history for conversational journey interface';
COMMENT ON TABLE tool_call_audit IS 'Security and analytics log of all AI tool function calls';
COMMENT ON TABLE journey_exports IS 'Tracks PDF/JSON exports of journey data';

COMMENT ON FUNCTION get_conversation_history(UUID, INTEGER) IS 'Retrieves conversation history for a journey (most recent first)';
COMMENT ON FUNCTION log_conversation(UUID, UUID, TEXT, TEXT, JSONB) IS 'Logs a conversation message to history';
COMMENT ON FUNCTION log_tool_call(UUID, UUID, TEXT, JSONB, JSONB, BOOLEAN, TEXT, INTEGER) IS 'Logs a tool call for audit trail';
