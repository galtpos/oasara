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

// Ops that bypass JWT verify — the request body itself carries the credential
// (e.g. an unguessable invitation token from an email link).
const PUBLIC_OPS = new Set(["get_invitation_by_token"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

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

  // JWT verify — bypassed for public ops where the request body carries its own
  // authorization (e.g. invitation_token).
  let user: { id: string; email?: string } | null = null;
  if (!PUBLIC_OPS.has(op)) {
    const auth = req.headers.get("Authorization") || "";
    const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!jwt) return json({ error: "missing bearer token" }, 401);
    user = await verifyEcoJwt(jwt);
    if (!user) return json({ error: "invalid ecosystem token" }, 401);
  }

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
      const stamped = rows.map((r) => ({ ...sanitize(r as Record<string, unknown>, allow), user_id: user!.id }));
      const { data: inserted, error } = await admin
        .from(table)
        .insert(Array.isArray(data) ? stamped : stamped[0])
        .select();
      if (error) return json({ error: "insert failed", detail: error.message }, 500);
      return json(Array.isArray(data) ? inserted : inserted?.[0], 201);
    }

    if (op === "select" || op === "list") {
      const cols = body.columns || "*";
      let q = admin.from(table).select(cols).eq("user_id", user!.id);
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
      let q = admin.from(table).update(updates).eq("user_id", user!.id);
      q = applyMatch(q, body.match);
      const { data: updated, error } = await q.select();
      if (error) return json({ error: "update failed", detail: error.message }, 500);
      return json(updated, 200);
    }

    if (op === "delete") {
      let q = admin.from(table).delete().eq("user_id", user!.id);
      q = applyMatch(q, body.match);
      const { data: deleted, error } = await q.select();
      if (error) return json({ error: "delete failed", detail: error.message }, 500);
      return json(deleted, 200);
    }

    if (op === "upsert") {
      const data = body.data ?? body.payload;
      if (!data) return json({ error: "data required" }, 400);
      const row = { ...sanitize(data as Record<string, unknown>, allow), user_id: user!.id };
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

    // ------------------------------------------------------------------
    // journey_collaborators owner-scoped + invitee-by-token ops.
    //
    // The generic insert/update/delete force user_id = JWT.sub which is wrong
    // for journey_collaborators where the journey OWNER manages OTHER users'
    // rows. These ops do per-row ownership verification via patient_journeys
    // (owner == JWT.sub) or token-based authorization (invitation_token holder).
    // ------------------------------------------------------------------
    if (table === "journey_collaborators") {
      const verifyOwnership = async (journeyId: string): Promise<boolean> => {
        const { data, error } = await admin
          .from("patient_journeys").select("id").eq("id", journeyId).eq("user_id", user!.id).maybeSingle();
        return !error && !!data;
      };

      if (op === "list_collaborators") {
        const journeyId = (body as any).journey_id as string;
        if (!journeyId) return json({ error: "journey_id required" }, 400);
        if (!(await verifyOwnership(journeyId))) return json({ error: "not journey owner" }, 403);
        const { data, error } = await admin
          .from("journey_collaborators").select("*")
          .eq("journey_id", journeyId).order("invited_at", { ascending: false });
        if (error) return json({ error: "list failed", detail: error.message }, 500);
        return json(data || [], 200);
      }

      if (op === "invite_collaborator") {
        const { journey_id, email, role } = (body as any);
        if (!journey_id || !email) return json({ error: "journey_id + email required" }, 400);
        if (!(await verifyOwnership(journey_id))) return json({ error: "not journey owner" }, 403);
        const { data, error } = await admin
          .from("journey_collaborators").insert({
            journey_id, email, role: role || "viewer", invited_by: user!.id,
          }).select().single();
        if (error) return json({ error: "invite failed", detail: error.message }, 500);
        return json(data, 201);
      }

      if (op === "update_collaborator") {
        const { collaborator_id, set } = (body as any);
        if (!collaborator_id || !set) return json({ error: "collaborator_id + set required" }, 400);
        const { data: row } = await admin
          .from("journey_collaborators").select("journey_id").eq("id", collaborator_id).maybeSingle();
        if (!row?.journey_id) return json({ error: "collaborator not found" }, 404);
        if (!(await verifyOwnership(row.journey_id))) return json({ error: "not journey owner" }, 403);
        // Owner is allowed to set status / invitation_token / token_expires_at /
        // invited_at / accepted_at / user_id (clearing on revoke).
        const ownerSettable = new Set([
          "status", "invitation_token", "token_expires_at", "invited_at",
          "accepted_at", "user_id", "role",
        ]);
        const updates: Record<string, unknown> = {};
        for (const k of Object.keys(set)) if (ownerSettable.has(k)) updates[k] = (set as any)[k];
        const { data, error } = await admin
          .from("journey_collaborators").update(updates).eq("id", collaborator_id).select().single();
        if (error) return json({ error: "update failed", detail: error.message }, 500);
        return json(data, 200);
      }

      if (op === "delete_collaborators_for_journey") {
        const journeyId = (body as any).journey_id as string;
        if (!journeyId) return json({ error: "journey_id required" }, 400);
        if (!(await verifyOwnership(journeyId))) return json({ error: "not journey owner" }, 403);
        const { data, error } = await admin
          .from("journey_collaborators").delete().eq("journey_id", journeyId).select();
        if (error) return json({ error: "delete failed", detail: error.message }, 500);
        return json(data || [], 200);
      }

      if (op === "get_invitation_by_token") {
        // Invitee pattern: the token IS the credential. Returns invitation +
        // journey context for the accept-invite landing page.
        const token = (body as any).token as string;
        if (!token) return json({ error: "token required" }, 400);
        const { data, error } = await admin
          .from("journey_collaborators")
          .select("*, patient_journeys (id, procedure_type, budget_min, budget_max, timeline)")
          .eq("invitation_token", token).maybeSingle();
        if (error) return json({ error: "lookup failed", detail: error.message }, 500);
        return json(data, 200);
      }

      if (op === "accept_invitation" || op === "decline_invitation") {
        const token = (body as any).token as string;
        if (!token) return json({ error: "token required" }, 400);
        const { data: invite } = await admin
          .from("journey_collaborators").select("id, status, token_expires_at, email")
          .eq("invitation_token", token).maybeSingle();
        if (!invite) return json({ error: "invitation not found" }, 404);
        if (invite.status !== "pending") return json({ error: `already ${invite.status}` }, 400);
        if (invite.token_expires_at && new Date(invite.token_expires_at) < new Date()) {
          return json({ error: "invitation expired" }, 400);
        }
        const set: Record<string, unknown> = op === "accept_invitation"
          ? { status: "accepted", accepted_at: new Date().toISOString(), user_id: user!.id }
          : { status: "declined" };
        const { data, error } = await admin
          .from("journey_collaborators").update(set).eq("id", invite.id).select().single();
        if (error) return json({ error: "update failed", detail: error.message }, 500);
        return json(data, 200);
      }
    }

    return json({ error: `unknown op: ${op}` }, 400);
  } catch (e) {
    return json({ error: "internal error", detail: String(e).slice(0, 300) }, 500);
  }
});
