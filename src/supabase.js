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
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    _enabled = true;
  } catch (e) {
    console.warn("Supabase init failed — using localStorage fallback:", e?.message);
  }
}

export const supabase = _client;
export const supabaseEnabled = () => _enabled;
export const supabaseReady = () => Promise.resolve(_client); // instant, kept for API compatibility

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
