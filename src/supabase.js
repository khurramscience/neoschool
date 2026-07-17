// ── Supabase client ───────────────────────────────────────────────────────────
// Statically imported so auth is available the instant the app loads — no lazy
// chunk to stall on. Falls back to localStorage if env vars are absent.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _client = null;
let _enabled = false;

if (url && key) {
  try {
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
      global: { fetch: (...a) => fetch(...a) },
    });
    _enabled = true;
  } catch (e) {
    console.warn("Supabase init failed — using localStorage fallback:", e?.message);
  }
}

export const supabase = _client;
export const supabaseEnabled = () => _enabled;
export const supabaseReady = () => Promise.resolve(_client); // instant, kept for API compatibility

// ── Direct GoTrue REST auth ───────────────────────────────────────────────────
// The supabase-js auth client serializes calls through a browser lock and can
// hang for many seconds (or forever with multiple tabs). Password sign-in and
// sign-up are simple POSTs — call them directly: fast, and real error codes
// instead of everything collapsing into a timeout.
async function authPost(path, body, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  } finally { clearTimeout(t); }
}
export function restSignIn(email, password, ms) {
  return authPost("/auth/v1/token?grant_type=password", { email, password }, ms);
}
export function restSignUp(email, password, data, ms) {
  return authPost("/auth/v1/signup", { email, password, data }, ms);
}
// Hand the REST session to the supabase-js client (fire-and-forget) so any code
// relying on sb.auth keeps working — but never block the UI on it.
export function adoptSession(s) {
  try { if (_client && s?.access_token) _client.auth.setSession({ access_token: s.access_token, refresh_token: s.refresh_token }); } catch {}
}

// ── High-level helpers ────────────────────────────────────────────────────────
export async function signOut() {
  try { if (_client) await _client.auth.signOut(); } catch {}
  localStorage.removeItem("neo_user");
  localStorage.removeItem("neo_current");
}

export async function getCurrentUser() {
  if (!_client) return null;
  try { const { data } = await _client.auth.getUser(); return data?.user || null; } catch { return null; }
}

export async function submitApplication(formData) {
  if (!_client) {
    const all = JSON.parse(localStorage.getItem("neo_applications") || "[]");
    all.push({ id: Date.now(), submitted_at: new Date().toISOString(), form_data: formData });
    localStorage.setItem("neo_applications", JSON.stringify(all));
    return { local: true };
  }
  const { data, error } = await _client.from("applications").insert({ form_data: formData, status: "new" }).select().single();
  if (error) throw error;
  return data;
}
