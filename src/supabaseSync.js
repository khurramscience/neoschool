// ── SUPABASE SYNC ───────────────────────────────────────────────────────────
// Syncs knowledge graph + MCQ logs from localStorage to Supabase when
// available. Falls back gracefully — local-first is always the source of truth
// during failures (intermittent network, SQL endpoint down, offline).

import { supabase as sb, supabaseEnabled, supabaseReady } from "./supabase.js";

const SYNC_KEY = "neo_last_sync_v1";
const PENDING_KEY = "neo_pending_sync_v1";

/** Queue an event for sync (always succeeds, no network needed) */
export function queueSync(event) {
  if (!event || !event.type) return;
  try {
    const queue = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    queue.push({ ...event, queuedAt: Date.now() });
    if (queue.length > 1000) queue.splice(0, queue.length - 1000);
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
  } catch (e) {}
}

/** Try to flush pending events. Resolves with {synced, failed, queueSize}. */
export async function flushSync() {
  // Wait briefly for supabase client to initialize
  await supabaseReady();
  if (!supabaseEnabled() || !sb || typeof sb.from !== "function") {
    return { synced: 0, failed: 0, queueSize: 0, reason: "supabase-not-ready" };
  }
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]"); }
  catch { return { synced: 0, failed: 0, queueSize: 0, reason: "queue-parse-error" }; }
  if (queue.length === 0) return { synced: 0, failed: 0, queueSize: 0 };

  // Group by event type
  const groups = {};
  queue.forEach(e => {
    groups[e.type] = groups[e.type] || [];
    groups[e.type].push(e);
  });

  const remaining = [];
  let synced = 0, failed = 0;

  for (const [type, events] of Object.entries(groups)) {
    const table = TABLE_FOR_TYPE[type];
    if (!table) {
      // Unknown type — drop it
      continue;
    }
    try {
      const rows = events.map(e => mapEventToRow(e));
      const { error } = await sb.from(table).insert(rows);
      if (error) {
        failed += events.length;
        remaining.push(...events);
      } else {
        synced += events.length;
      }
    } catch (err) {
      failed += events.length;
      remaining.push(...events);
    }
  }

  localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  localStorage.setItem(SYNC_KEY, Date.now().toString());

  return { synced, failed, queueSize: remaining.length };
}

const TABLE_FOR_TYPE = {
  lab_visit: "kg_lab_visits",
  lab_event: "kg_lab_events",
  mcq_result: "kg_mcq_results",
  edge: "kg_edges",
  tutor_turn: "tutor_turns",
};

function mapEventToRow(event) {
  const base = {
    student_id: event.studentId || "demo",
    created_at: new Date(event.queuedAt || Date.now()).toISOString(),
  };
  switch (event.type) {
    case "lab_visit": return { ...base, lab_id: event.labId, lab_topic: event.topic };
    case "lab_event": return { ...base, lab_id: event.labId, event_type: event.eventType, payload: event.payload || {} };
    case "mcq_result": return { ...base, lab_id: event.labId, mcq_id: event.mcqId, chosen: event.chosen, correct: event.correct, concept: event.concept };
    case "edge": return { ...base, from_lab: event.from, to_lab: event.to, edge_type: event.edgeType, weight: event.weight };
    case "tutor_turn": return { ...base, lab_id: event.labId, role: event.role, content: event.content };
    default: return base;
  }
}

/** Schedule periodic background flush */
let flushTimer = null;
export function startSyncLoop(intervalMs = 30000) {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flushSync().catch(() => { /* swallow — keeps queue intact */ });
  }, intervalMs);
  // Also try once immediately
  setTimeout(() => flushSync().catch(() => {}), 5000);
}

export function stopSyncLoop() {
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
}

export function getSyncStatus() {
  let queueSize = 0;
  try { queueSize = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]").length; }
  catch {}
  const lastSync = parseInt(localStorage.getItem(SYNC_KEY) || "0");
  return { queueSize, lastSync, ago: lastSync ? Date.now() - lastSync : null };
}
