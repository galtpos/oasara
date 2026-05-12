/**
 * federated-data-proxy — canonical Edge Function body
 *
 * Per Unified Auth Board Session 2 (2026-05-12) Option C + Ecosystem Player
 * Board Session 2026-05-12. Mirrors the TADS Netlify Function bridge:
 *
 *   POST /functions/v1/federated-data-proxy
 *   Authorization: Bearer <FreedomForge eco JWT>
 *   { table, op, ...payload }
 *
 * Ops:
 *   insert   { data: {...} | [{...}] }       -> stamps user_id from JWT
 *   select   { match?, single?, columns? }   -> always scoped to user_id from JWT
 *   update   { set, match? }                 -> always scoped to user_id from JWT
 *   delete   { match? }                      -> always scoped to user_id from JWT
 *   upsert   { data: {...} }                 -> stamps user_id (kept for back-compat)
 *   list     { limit? }                      -> back-compat alias for select w/ order
 *
 * The {
  "journey_access_log": new Set(["journey_id", "action", "details", "timestamp"]),
  "journey_collaborators": new Set(["journey_id", "email", "role", "invited_by", "invited_at", "accepted_at", "invitation_token", "token_expires_at", "status"]),
  "patient_journeys": new Set(["procedure_type", "budget_min", "budget_max", "timeline", "priority_factors", "concerns", "wizard_responses", "status", "budget_preference", "name"]),
  "wallet_education_progress": new Set(["video_id", "completed", "watched_seconds", "total_seconds", "completed_at"]),
} marker below is replaced per-site at write time.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ECO_SUPABASE_URL = "https://uefznzzkrzqxgxxwslox.supabase.co";
const ECO_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZnpuenprcnpxeGd4eHdzbG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDIzODQsImV4cCI6MjA3MTgxODM4NH0.YmwwuEhG7Siv8zyL9XFjthNuqJrST3C4hs3qESb-grM";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function verifyEcoJwt(jwt: string): Promise<{ id: string; email?: string } | null> {
  try {
    const r = await fetch(`${ECO_SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ECO_ANON_KEY, Authorization: `Bearer ${jwt}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u?.id) return null;
    return { id: u.id, email: u.email };
  } catch {
    return null;
  }
}

// Per-site table allowlists. Keys = whitelisted tables. Values = columns the
// frontend may set on insert/update; anything else is silently dropped.
const ALLOWED: Record<string, Set<string>> = {
  "journey_access_log": new Set(["journey_id", "action", "details", "timestamp"]),
  "journey_collaborators": new Set(["journey_id", "email", "role", "invited_by", "invited_at", "accepted_at", "invitation_token", "token_expires_at", "status"]),
  "patient_journeys": new Set(["procedure_type", "budget_min", "budget_max", "timeline", "priority_factors", "concerns", "wizard_responses", "status", "budget_preference", "name"]),
  "wallet_education_progress": new Set(["video_id", "completed", "watched_seconds", "total_seconds", "completed_at"]),
};

const VALID_TABLES = new Set(Object.keys(ALLOWED));

function sanitize(payload: Record<string, unknown>, allow: Set<string>) {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(payload || {})) {
    if (allow.has(k)) out[k] = payload[k];
  }
  return out;
}

// deno-lint-ignore no-explicit-any
function applyMatch(query: any, match: Record<string, unknown> | undefined) {
  if (!match || typeof match !== "object") return query;
  for (const [k, v] of Object.entries(match)) {
    query = query.eq(k, v);
  }
  return query;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return json({ error: "missing bearer token" }, 401);

  const user = await verifyEcoJwt(jwt);
  if (!user) return json({ error: "invalid ecosystem token" }, 401);

  let body: {
    op?: string;
    table?: string;
    data?: Record<string, unknown> | Record<string, unknown>[];
    set?: Record<string, unknown>;
    match?: Record<string, unknown>;
    single?: boolean;
    columns?: string;
    limit?: number;
    payload?: Record<string, unknown>;
  } = {};
  try { body = await req.json(); } catch { return json({ error: "invalid JSON body" }, 400); }

  const op = body.op || "list";
  const table = body.table || "";
  if (!VALID_TABLES.has(table)) return json({ error: `table not whitelisted: ${table}` }, 400);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "edge function misconfigured" }, 500);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const allow = ALLOWED[table];

  try {
    if (op === "insert") {
      const data = body.data ?? body.payload;
      if (!data) return json({ error: "data required" }, 400);
      const rows = Array.isArray(data) ? data : [data];
      const stamped = rows.map((r) => ({ ...sanitize(r as Record<string, unknown>, allow), user_id: user.id }));
      const { data: inserted, error } = await admin
        .from(table)
        .insert(Array.isArray(data) ? stamped : stamped[0])
        .select();
      if (error) return json({ error: "insert failed", detail: error.message }, 500);
      return json(Array.isArray(data) ? inserted : inserted?.[0], 201);
    }

    if (op === "select" || op === "list") {
      const cols = body.columns || "*";
      let q = admin.from(table).select(cols).eq("user_id", user.id);
      q = applyMatch(q, body.match);
      if (op === "list") {
        const limit = Math.min(Number(body.limit) || 50, 200);
        q = q.order("created_at", { ascending: false }).limit(limit);
      }
      const result = body.single ? await q.maybeSingle() : await q;
      if (result.error) return json({ error: "select failed", detail: result.error.message }, 500);
      return json(result.data ?? (body.single ? null : []), 200);
    }

    if (op === "update") {
      const set = body.set ?? body.payload;
      if (!set || typeof set !== "object") return json({ error: "set required" }, 400);
      const updates = sanitize(set as Record<string, unknown>, allow);
      // Always stamp updated_at when the table presumably has one; harmless if it doesn't.
      updates.updated_at = new Date().toISOString();
      let q = admin.from(table).update(updates).eq("user_id", user.id);
      q = applyMatch(q, body.match);
      const { data: updated, error } = await q.select();
      if (error) return json({ error: "update failed", detail: error.message }, 500);
      return json(updated, 200);
    }

    if (op === "delete") {
      let q = admin.from(table).delete().eq("user_id", user.id);
      q = applyMatch(q, body.match);
      const { data: deleted, error } = await q.select();
      if (error) return json({ error: "delete failed", detail: error.message }, 500);
      return json(deleted, 200);
    }

    if (op === "upsert") {
      const data = body.data ?? body.payload;
      if (!data) return json({ error: "data required" }, 400);
      const row = { ...sanitize(data as Record<string, unknown>, allow), user_id: user.id };
      // Caller may pass onConflict (e.g. "user_id,video_id") for composite keys.
      const onConflict = (body as any).onConflict || "user_id";
      const { data: out, error } = await admin
        .from(table)
        .upsert(row, { onConflict })
        .select()
        .single();
      if (error) return json({ error: "upsert failed", detail: error.message }, 500);
      return json(out, 200);
    }

    return json({ error: `unknown op: ${op}` }, 400);
  } catch (e) {
    return json({ error: "internal error", detail: String(e).slice(0, 300) }, 500);
  }
});
