// ── Learning Graph ────────────────────────────────────────────────────────────
// Powered by the Marble Skill Taxonomy (withmarble.com) — CC BY-SA 4.0 / ODbL.
// 1,590 micro-topics wired by 3,221 prerequisite edges. We map neoschool labs
// onto this graph to give every student a personal learning map and to compute
// the optimal path (prerequisite order) toward any goal topic.
import { LAB_TOPIC } from "./labTopicMap.js";
import { LABS } from "./data.js";

let _tax = null, _loading = null;

export function loadTaxonomy() {
  if (_tax) return Promise.resolve(_tax);
  if (_loading) return _loading;
  _loading = fetch("./taxonomy.json")
    .then(r => r.json())
    .then(t => {
      const byId = {};
      t.nodes.forEach(n => { byId[n.id] = { ...n, prereqs: [], unlocks: [] }; });
      t.edges.forEach(e => {
        if (byId[e.t] && byId[e.p]) {
          byId[e.t].prereqs.push({ id: e.p, hard: !!e.h });
          byId[e.p].unlocks.push(e.t);
        }
      });
      _tax = { ...t, byId };
      return _tax;
    });
  return _loading;
}

// labs attached to each topic node
export function labsForTopic(topicId) {
  return LABS.filter(l => LAB_TOPIC[l.id] === topicId && l.url && l.url.startsWith("./labs"));
}

// topics covered by the platform (have at least one lab)
export function coveredTopicIds() {
  return [...new Set(Object.values(LAB_TOPIC))];
}

// mastery: a topic is mastered when any mapped lab reported complete
export function masteredTopics(progress /* {labId:{complete:bool,...}} */) {
  const m = new Set();
  for (const [labId, topicId] of Object.entries(LAB_TOPIC)) {
    if (progress?.[labId]?.complete) m.add(topicId);
  }
  return m;
}

// full prerequisite closure of a goal, topologically ordered (learn-first → goal)
export function prereqPath(tax, goalId, mastered = new Set(), hardOnly = true) {
  const need = [], seen = new Set();
  (function visit(id) {
    if (seen.has(id) || mastered.has(id)) return;
    seen.add(id);
    const node = tax.byId[id];
    if (!node) return;
    for (const p of node.prereqs) {
      if (hardOnly && !p.hard) continue;
      visit(p.id);
    }
    need.push(id);
  })(goalId);
  return need; // already topological: prereqs pushed before dependents
}

// next best topics: unmastered, all hard prereqs mastered, prefer covered + central
export function suggestNext(tax, mastered, limit = 5) {
  const covered = new Set(coveredTopicIds());
  const ready = tax.nodes.filter(n => {
    if (mastered.has(n.id)) return false;
    const node = tax.byId[n.id];
    return node.prereqs.every(p => !p.hard || mastered.has(p.id));
  });
  ready.sort((a, b) =>
    (covered.has(b.id) - covered.has(a.id)) || (b.c - a.c) || (a.a0 - b.a0));
  return ready.slice(0, limit);
}

// age → grade-ish label for display
export function ageLabel(a0, a1) {
  const g = a => a <= 5 ? "K" : "Gr " + Math.min(12, a - 5);
  return g(a0) + (a1 > a0 ? "–" + g(a1).replace("Gr ", "") : "");
}
