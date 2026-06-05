// ── USER ANTHROPIC API KEY (BYOK) ────────────────────────────────────────────
// Each user provides their own Anthropic API key after exhausting free demo
// interactions. The key is stored in localStorage only — never sent to our
// servers or database. It's only sent in the X-User-Anthropic-Key header to
// our Edge Function, which proxies it to api.anthropic.com.

const KEY_STORAGE     = "neo_user_anthropic_key";
const DEMO_USES_KEY   = "neo_demo_uses";
const DEMO_BUDGET_KEY = "neo_demo_budget";

// How many free demo interactions before we ask the user to bring their own key.
// The credits system (credits.js, FREE_DEMO_CREDITS) is now the authoritative
// demo gate, so we set this high enough that api.js never pre-empts it. The
// proxy still returns 402 if no platform key is configured, which surfaces the
// BYOK modal as the genuine "we can't serve this" fallback.
export const DEMO_BUDGET_DEFAULT = 100000;

/** Get the user's stored key (if any) */
export function getUserKey() {
  try { return localStorage.getItem(KEY_STORAGE) || null; }
  catch { return null; }
}

/** Save a user-provided API key (after validating format) */
export function setUserKey(key) {
  if (!key || typeof key !== "string") return false;
  const cleaned = key.trim();
  // Basic format check — Anthropic keys look like sk-ant-api03-...
  if (!cleaned.startsWith("sk-ant-")) return false;
  if (cleaned.length < 40) return false;
  try {
    localStorage.setItem(KEY_STORAGE, cleaned);
    return true;
  } catch { return false; }
}

export function clearUserKey() {
  try { localStorage.removeItem(KEY_STORAGE); } catch {}
}

/** Has the user provided their own key? (Unlimited mode) */
export function hasUserKey() {
  return !!getUserKey();
}

/** Get configured demo budget (configurable in case we want to bump it) */
export function getDemoBudget() {
  try {
    const v = parseInt(localStorage.getItem(DEMO_BUDGET_KEY) || "0", 10);
    return v > 0 ? v : DEMO_BUDGET_DEFAULT;
  } catch { return DEMO_BUDGET_DEFAULT; }
}

/** How many demo uses has this device consumed */
export function getDemoUses() {
  try {
    return parseInt(localStorage.getItem(DEMO_USES_KEY) || "0", 10) || 0;
  } catch { return 0; }
}

/** Remaining demo interactions */
export function getDemoUsesLeft() {
  return Math.max(0, getDemoBudget() - getDemoUses());
}

/** Increment the demo counter (call AFTER a successful tutor response) */
export function incrementDemoUse() {
  if (hasUserKey()) return; // BYOK users don't count
  try {
    const n = getDemoUses() + 1;
    localStorage.setItem(DEMO_USES_KEY, String(n));
  } catch {}
}

/** Can the user send another request? */
export function canMakeRequest() {
  if (hasUserKey()) return { ok: true, reason: "user-key" };
  if (getDemoUsesLeft() > 0) return { ok: true, reason: "demo" };
  return { ok: false, reason: "demo-exhausted" };
}

/** Reset demo counter (admin/debug) */
export function resetDemoUses() {
  try { localStorage.removeItem(DEMO_USES_KEY); } catch {}
}

/** Should we show a soft warning (e.g., 2 demo uses left)? */
export function shouldShowDemoWarning() {
  if (hasUserKey()) return false;
  const left = getDemoUsesLeft();
  return left > 0 && left <= 3;
}
