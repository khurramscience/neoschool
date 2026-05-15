// ── STUDENT MEMORY SYSTEM ────────────────────────────────────────────────────
// Cross-subject memory: tracks all lab sessions, builds student model,
// generates recommendations, feeds tutor improvement loop

const STORAGE_KEY = "neo_student_memory";

export function getMemory(studentId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return all[studentId] || createMemory(studentId);
}

function createMemory(studentId) {
  return {
    studentId, createdAt: Date.now(),
    sessions: [],        // {lab, events, score, duration, tutorMsgs, rating, timestamp}
    topicStats: {},      // {topic: {attempts, avgScore, totalMins, lastSeen, trend}}
    labStats: {},        // {labId: {attempts, bestScore, totalMins, masteryPct}}
    crossInsights: [],   // AI-generated insights across subjects
    recommendations: [], // [{lab, reason, priority}]
    weakAreas: [],
    strongAreas: [],
    learningVelocity: "steady", // accelerating | steady | plateauing | stalling
    totalMins: 0,
    streak: 0, lastActiveDay: null,
    tutorFeedback: [],   // {lab, msgIdx, rating, coachNote, timestamp}
  };
}

export function saveSession(studentId, session) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const mem = all[studentId] || createMemory(studentId);
  mem.sessions.push({ ...session, timestamp: Date.now() });
  // Update lab stats
  if (!mem.labStats[session.lab]) mem.labStats[session.lab] = { attempts: 0, bestScore: 0, totalMins: 0, masteryPct: 0 };
  const ls = mem.labStats[session.lab];
  ls.attempts++;
  ls.bestScore = Math.max(ls.bestScore, session.score || 0);
  ls.totalMins += session.duration / 60000;
  ls.masteryPct = Math.min(100, ls.bestScore);
  // Update topic stats
  if (session.topic) {
    if (!mem.topicStats[session.topic]) mem.topicStats[session.topic] = { attempts: 0, avgScore: 0, totalMins: 0, lastSeen: null, trend: "new" };
    const ts = mem.topicStats[session.topic];
    ts.avgScore = (ts.avgScore * ts.attempts + (session.score || 0)) / (ts.attempts + 1);
    ts.attempts++;
    ts.totalMins += session.duration / 60000;
    ts.lastSeen = Date.now();
  }
  mem.totalMins = (mem.sessions.reduce((a, s) => a + (s.duration || 0), 0)) / 60000;
  // Streak
  const today = new Date().toDateString();
  if (mem.lastActiveDay !== today) { mem.streak = mem.lastActiveDay === new Date(Date.now() - 86400000).toDateString() ? mem.streak + 1 : 1; mem.lastActiveDay = today; }
  // Compute weak/strong areas
  const topicArr = Object.entries(mem.topicStats);
  mem.strongAreas = topicArr.filter(([, v]) => v.avgScore >= 70).map(([k]) => k);
  mem.weakAreas = topicArr.filter(([, v]) => v.avgScore < 50 && v.attempts >= 2).map(([k]) => k);
  // Velocity from recent sessions
  const recent = mem.sessions.slice(-5).map(s => s.score || 0);
  if (recent.length >= 3) {
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = recent.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const last = recent.slice(-2).reduce((a, b) => a + b, 0) / 2;
    mem.learningVelocity = last - first > 15 ? "accelerating" : last - first < -10 ? "stalling" : avg > 60 ? "steady" : "plateauing";
  }
  all[studentId] = mem;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return mem;
}

export function saveTutorFeedback(studentId, fb) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const mem = all[studentId] || createMemory(studentId);
  mem.tutorFeedback.push({ ...fb, timestamp: Date.now() });
  all[studentId] = mem;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function buildRecommendations(mem, allLabs) {
  const recs = [];
  // Weak areas first
  for (const topic of mem.weakAreas) {
    const labs = allLabs.filter(l => l.topic.toLowerCase().includes(topic.toLowerCase()) && (mem.labStats[l.id]?.masteryPct || 0) < 80);
    labs.forEach(l => recs.push({ lab: l, reason: `You struggled with ${topic} — let's strengthen it`, priority: "high" }));
  }
  // Advance strong learners
  for (const topic of mem.strongAreas) {
    const nextLabs = allLabs.filter(l => l.topic.toLowerCase().includes(topic.toLowerCase()) && !(mem.labStats[l.id]?.attempts > 0));
    nextLabs.slice(0, 1).forEach(l => recs.push({ lab: l, reason: `You're great at ${topic}! Ready for the next challenge`, priority: "medium" }));
  }
  // Never-tried labs
  const untried = allLabs.filter(l => !mem.labStats[l.id]?.attempts);
  untried.slice(0, 2).forEach(l => recs.push({ lab: l, reason: "New lab — explore it!", priority: "low" }));
  return recs.slice(0, 5);
}

export function buildCrossContext(mem) {
  // Build a rich context string for tutors about this student
  const topTopics = Object.entries(mem.topicStats)
    .sort((a, b) => b[1].totalMins - a[1].totalMins)
    .slice(0, 4);
  const lines = [
    `Student velocity: ${mem.learningVelocity}`,
    `Total time: ${Math.round(mem.totalMins)} minutes`,
    `Strong in: ${mem.strongAreas.join(", ") || "building up"}`,
    `Needs work: ${mem.weakAreas.join(", ") || "none identified yet"}`,
    `Lab history: ${mem.sessions.length} sessions across ${new Set(mem.sessions.map(s => s.lab)).size} labs`,
    topTopics.length > 0 ? `Most time spent on: ${topTopics.map(([k]) => k).join(", ")}` : "",
    mem.streak > 1 ? `On a ${mem.streak}-day learning streak 🔥` : "",
  ].filter(Boolean);
  return lines.join(". ");
}

export function getAllStudentMemories() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}
