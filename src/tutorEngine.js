// ── neoschool Tutor Engine ────────────────────────────────────────────────────
// Config-driven pipeline that assembles the tutor's context from composable
// blocks. Each block can be toggled/edited in the Tutor Studio (graph editor).
//
//   [Sim Events] → [Memory] → [Knowledge Graph] → [Personalization]
//        → [Teacher Guidance] → [Style Rules] → [Model] → response → [Logs]
//
import { LABS } from "./data.js";
import { LAB_TOPIC } from "./labTopicMap.js";
import { loadTaxonomy, prereqPath, masteredTopics, labsForTopic, ageLabel } from "./learningGraph.js";

const PIPE_KEY = "neo_tutor_pipeline";
const GUIDE_KEY = "neo_tutor_guidance";   // { [topicOrLabId]: [{note, by, ts}] }
const LOG_KEY = "neo_tutor_logs";         // [{ts, studentId, labId, q, a, fb, comment}]
const PROFILE_KEY = "neo_student_profile"; // { [studentId]: {style, wins, struggles, analogies} }

// ── Pipeline config (the "blocks graph") ─────────────────────────────────────
export const DEFAULT_PIPELINE = {
  blocks: [
    { id: "events",   label: "Sim Events",        on: true,  desc: "Live stream of every action in the simulation" },
    { id: "memory",   label: "Student Memory",     on: true,  desc: "Cross-session history: wins, struggles, style" },
    { id: "kg",       label: "Knowledge Graph",    on: true,  desc: "Prerequisite detection + smooth transitions" },
    { id: "personal", label: "Personalization",    on: true,  desc: "Adapts tone, analogies & pace to this student" },
    { id: "guidance", label: "Teacher Guidance",   on: true,  desc: "Live notes from teachers per topic" },
    { id: "style",    label: "Plain-Language Science", on: true, desc: "Every formula & term explained simply" },
  ],
  model: "claude-sonnet-4-6",
  models: ["claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-8"],
  maxTokens: 260,
};
export function getPipeline() {
  try { return { ...DEFAULT_PIPELINE, ...JSON.parse(localStorage.getItem(PIPE_KEY) || "{}") }; }
  catch { return DEFAULT_PIPELINE; }
}
export function savePipeline(p) { localStorage.setItem(PIPE_KEY, JSON.stringify(p)); }
const blockOn = (p, id) => p.blocks.find(b => b.id === id)?.on;

// ── Student profile / personalization ────────────────────────────────────────
export function getProfile(studentId) {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  return all[studentId] || { style: "warm coach", analogies: [], struggles: [], wins: [], sessions: 0 };
}
export function updateProfile(studentId, patch) {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  all[studentId] = { ...getProfile(studentId), ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
}

// ── Teacher guidance (real-time tutor improvement) ───────────────────────────
export function getGuidance(key) {
  const all = JSON.parse(localStorage.getItem(GUIDE_KEY) || "{}");
  return all[key] || [];
}
export function addGuidance(key, note, by = "Teacher") {
  const all = JSON.parse(localStorage.getItem(GUIDE_KEY) || "{}");
  (all[key] = all[key] || []).push({ note, by, ts: Date.now() });
  localStorage.setItem(GUIDE_KEY, JSON.stringify(all));
}
export function allGuidance() { return JSON.parse(localStorage.getItem(GUIDE_KEY) || "{}"); }

// ── Exchange logs (continuous learning + teacher review) ─────────────────────
export function logExchange(entry) {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  logs.push({ ts: Date.now(), ...entry });
  if (logs.length > 500) logs.splice(0, logs.length - 500);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  return logs.length - 1;
}
export function rateExchange(index, fb, comment = "") {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  if (logs[index]) { logs[index].fb = fb; if (comment) logs[index].comment = comment;
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    // negative feedback with a comment becomes instant guidance for that lab
    if (fb === -1 && comment) addGuidance(logs[index].labId, comment, "Teacher (from log)");
  }
}
export function getLogs(labId = null) {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  return labId ? logs.filter(l => l.labId === labId) : logs;
}

// ── Knowledge-graph struggle analysis ─────────────────────────────────────────
export async function struggleContext(studentId, labId) {
  try {
    const tax = await loadTaxonomy();
    const topicId = LAB_TOPIC[labId];
    if (!topicId || !tax.byId[topicId]) return null;
    const node = tax.byId[topicId];
    const mastered = masteredTopics(studentId, tax);
    const missing = prereqPath(tax, topicId, mastered).filter(id => id !== topicId).slice(0, 3);
    return {
      topic: node.n,
      age: ageLabel(node.a0, node.a1),
      missingPrereqs: missing.map(id => ({
        name: tax.byId[id].n,
        lab: labsForTopic(id)[0]?.title || null,
      })),
    };
  } catch { return null; }
}

// ── Context assembly (the heart) ─────────────────────────────────────────────
export async function buildTutorSystem({ lab, studentId, studentName, events = [], simState = null, baseSystem = "" }) {
  const p = getPipeline();
  const parts = [baseSystem.trim()];

  parts.push(`\nYOU ARE THIS STUDENT'S PERSONAL COACH. Mission: help them climb, never carry them. Give hints as footholds — the student must place every step themself. If they ask for the answer directly, warmly decline and offer the next-smallest hint instead.`);

  if (blockOn(p, "events") && events.length) {
    parts.push(`\nLIVE SIM EVENTS (newest last — you can see everything happening):\n${events.slice(-8).map(e => `· ${e}`).join("\n")}`);
  }
  if (blockOn(p, "events") && simState) {
    const st = Object.entries(simState).filter(([k]) => k !== "raw").map(([k, v]) => `${k}=${v}`).join(", ");
    if (st) parts.push(`CURRENT SIM STATE: ${st}`);
  }

  if (blockOn(p, "memory")) {
    const prof = getProfile(studentId);
    const bits = [];
    if (prof.sessions) bits.push(`${prof.sessions} past sessions together`);
    if (prof.wins?.length) bits.push(`recent wins: ${prof.wins.slice(-3).join("; ")}`);
    if (prof.struggles?.length) bits.push(`known struggle areas: ${prof.struggles.slice(-3).join("; ")}`);
    if (bits.length) parts.push(`\nSTUDENT MEMORY (${studentName || "student"}): ${bits.join(" · ")}. Reference shared history naturally, like a coach who remembers.`);
  }

  if (blockOn(p, "kg")) {
    const fails = events.filter(e => /✗|not quite|too |wrong|missed/i.test(e)).length;
    if (fails >= 2) {
      const kg = await struggleContext(studentId, lab.id);
      if (kg?.missingPrereqs?.length) {
        parts.push(`\nKNOWLEDGE GRAPH ALERT: the student is struggling with "${kg.topic}". Unmastered prerequisites: ${kg.missingPrereqs.map(m => m.name + (m.lab ? ` (our lab: ${m.lab})` : "")).join("; ")}. If struggle continues, gently bridge: "this connects to ${kg.missingPrereqs[0].name} — want to strengthen that first?" Make the transition feel like a natural step, never a demotion.`);
      }
    }
  }

  if (blockOn(p, "personal")) {
    const prof = getProfile(studentId);
    parts.push(`\nPERSONALIZATION: speak in the style that works for this student: ${prof.style}. ${prof.analogies?.length ? `Analogies that landed before: ${prof.analogies.slice(-3).join(", ")}.` : "Discover which analogies land (sports, cooking, games, building, music) and reuse them."} Match their energy; celebrate effort specifically, not generically.`);
  }

  if (blockOn(p, "guidance")) {
    const notes = [...getGuidance(lab.id), ...getGuidance(LAB_TOPIC[lab.id] || "")].slice(-5);
    if (notes.length) parts.push(`\nTEACHER GUIDANCE for this topic (follow strictly — written by this student's real teachers):\n${notes.map(n => `· ${n.note}`).join("\n")}`);
  }

  if (blockOn(p, "style")) {
    parts.push(`\nPLAIN-LANGUAGE SCIENCE: every formula or scientific term must arrive with an everyday translation in the same breath. Pattern: "\\\\( Q = C \\\\times V \\\\) — think of C as the size of the bucket and V as how hard you pour." Never let a term float past unexplained.`);
  }

  return parts.filter(Boolean).join("\n");
}

// ── Session close: update memory + profile ────────────────────────────────────
export function closeTutorSession(studentId, labId, { solved = 0, fails = 0, topics = [] } = {}) {
  const prof = getProfile(studentId);
  const labTitle = LABS.find(l => l.id === labId)?.title || labId;
  const patch = { sessions: (prof.sessions || 0) + 1 };
  if (solved > fails) patch.wins = [...(prof.wins || []), `${labTitle} (${solved} solved)`].slice(-10);
  if (fails >= 3) patch.struggles = [...(prof.struggles || []), labTitle].slice(-10);
  updateProfile(studentId, patch);
}
