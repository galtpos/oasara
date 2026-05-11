-- Path 1 enrichment data model.
-- Holds per-facility intelligence produced by the weekly enrichment pipeline:
-- Comet Deep Research -> Hermes-4-14B structured extraction -> Hermes brief +
-- draft outreach. Written exclusively by service-role; readable by public via
-- the admin dashboard surface.
--
-- Spec: _standards/OASARA_FACILITY_ENRICHMENT_PLAN.md (Phase 1).
-- Locked: Aaron 2026-05-10.

CREATE TABLE IF NOT EXISTS oasara_facility_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL UNIQUE REFERENCES facilities(id) ON DELETE CASCADE,
  coordinator_name TEXT,
  coordinator_email TEXT,
  coordinator_role TEXT,
  whatsapp TEXT,
  languages TEXT[] DEFAULT '{}'::text[],
  international_program_summary TEXT,
  published_pricing TEXT[] DEFAULT '{}'::text[],
  response_signal TEXT,
  outreach_draft TEXT,
  intel_quality_score INT CHECK (intel_quality_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oasara_facility_intel_facility_id
  ON oasara_facility_intel(facility_id);
CREATE INDEX IF NOT EXISTS idx_oasara_facility_intel_quality_score
  ON oasara_facility_intel(intel_quality_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_oasara_facility_intel_updated_at
  ON oasara_facility_intel(updated_at DESC);

CREATE OR REPLACE FUNCTION update_oasara_facility_intel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS oasara_facility_intel_timestamp ON oasara_facility_intel;

CREATE TRIGGER oasara_facility_intel_timestamp
  BEFORE UPDATE ON oasara_facility_intel
  FOR EACH ROW
  EXECUTE FUNCTION update_oasara_facility_intel_updated_at();

ALTER TABLE oasara_facility_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read facility intel"
  ON oasara_facility_intel FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON oasara_facility_intel TO anon, authenticated;

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS intel_refreshed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_facilities_intel_refreshed_at
  ON facilities(intel_refreshed_at NULLS FIRST);

COMMENT ON TABLE oasara_facility_intel IS
  'Per-facility intel produced by the weekly enrichment pipeline (Comet Deep Research + Hermes-4-14B). One row per facility. Written by service-role only; public-read via admin dashboard.';
COMMENT ON COLUMN facilities.intel_refreshed_at IS
  'Last successful enrichment pass timestamp. NULL = never enriched. Used by the orchestrator queue and the HEARTBEAT staleness check (<8d).';
