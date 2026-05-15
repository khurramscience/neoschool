// ── Supabase client (optional) ───────────────────────────────────────────────
// If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your env, the
// platform uses Supabase for auth + data. Otherwise it falls back to
// localStorage so the app keeps working in offline/demo mode.
//
// Set these in your hosting provider (Netlify/Vercel/Lovable) as env vars,
// not in code, so secrets stay secret.

let _client = null;
let _enabled = false;

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (url && key) {
  try {
    // Dynamic import so we don't break the bundle when not configured
    const mod = await import("@supabase/supabase-js");
    _client = mod.createClient(url, key);
    _enabled = true;
    console.log("✅ Supabase connected:", url);
  } catch (e) {
    console.warn("Supabase failed to load — falling back to localStorage:", e.message);
  }
}

export const supabase = _client;
export const supabaseEnabled = _enabled;

// ── High-level helpers ────────────────────────────────────────────────────────
export async function signInMagicLink(email) {
  if (!_client) throw new Error("Supabase not configured");
  const { data, error } = await _client.auth.signInWithOtp({ email });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (_client) await _client.auth.signOut();
  // Always clear local fallback too
  localStorage.removeItem("neo_user");
}

export async function getCurrentUser() {
  if (!_client) return null;
  const { data } = await _client.auth.getUser();
  return data?.user || null;
}

// ── Curricula table ──────────────────────────────────────────────────────────
export async function saveCurriculumToCloud(curriculum, studentId) {
  if (!_client) return null;
  const { data, error } = await _client
    .from("curricula")
    .insert({ student_id: studentId, data: curriculum })
    .select()
    .single();
  if (error) console.warn("saveCurriculumToCloud:", error.message);
  return data;
}

export async function listCurriculaForUser() {
  if (!_client) return [];
  const { data, error } = await _client
    .from("curricula")
    .select("*, students(name, grade)")
    .order("created_at", { ascending: false });
  if (error) console.warn("listCurriculaForUser:", error.message);
  return data || [];
}

// ── Applications table ────────────────────────────────────────────────────────
export async function submitApplication(formData) {
  if (!_client) {
    // Fallback: store locally
    const all = JSON.parse(localStorage.getItem("neo_applications") || "[]");
    all.push({ id: Date.now(), submitted_at: new Date().toISOString(), form_data: formData });
    localStorage.setItem("neo_applications", JSON.stringify(all));
    return { local: true };
  }
  const { data, error } = await _client
    .from("applications")
    .insert({ form_data: formData, status: "new" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Waitlist (campus director CRM) ────────────────────────────────────────────
export async function listWaitlist() {
  if (!_client) return [];
  const { data, error } = await _client
    .from("waitlist")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) console.warn("listWaitlist:", error.message);
  return data || [];
}

export async function addToWaitlist(entry) {
  if (!_client) return null;
  const { data, error } = await _client
    .from("waitlist")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}
