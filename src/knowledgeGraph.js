// ── KNOWLEDGE GRAPH ─────────────────────────────────────────────────────────
// Each student has a per-lab graph: nodes = labs, edges = prerequisite/unlock chains.
// Stored client-side for now; syncs to Supabase once SQL endpoint is restored.

const KG_KEY = "neo_knowledge_graph_v1";

function readGraph() {
  try { return JSON.parse(localStorage.getItem(KG_KEY) || "{}"); }
  catch { return {}; }
}

function writeGraph(g) {
  localStorage.setItem(KG_KEY, JSON.stringify(g));
}

/** Per-student graph shape:
 *  {
 *    [studentId]: {
 *      labs: {
 *        [labId]: {
 *          attempts: number,
 *          completions: number,
 *          firstAttempt: timestamp,
 *          lastAttempt: timestamp,
 *          bestScore: number,
 *          totalTimeMs: number,
 *          mastery: 0–1,   // computed
 *          struggles: [{topic, count}],
 *          breakthroughs: [{topic, timestamp}],
 *        }
 *      },
 *      edges: [{from: labId, to: labId, weight: 0–1, type: "prereq"|"discovered"|"recommended"}],
 *      currentPath: [labId, ...],   // ordered visit sequence
 *      skillsLearned: [{skill, level: 0–1, evidence: [labId]}],
 *      updatedAt: timestamp,
 *    }
 *  }
 */

export function getStudentGraph(studentId) {
  const g = readGraph();
  if (!g[studentId]) {
    g[studentId] = {
      labs: {},
      edges: [],
      currentPath: [],
      skillsLearned: [],
      updatedAt: Date.now(),
    };
    writeGraph(g);
  }
  return g[studentId];
}

/** Record a lab visit (entry) */
export function recordLabVisit(studentId, labId, labMeta = {}) {
  const g = readGraph();
  g[studentId] = g[studentId] || { labs: {}, edges: [], currentPath: [], skillsLearned: [], updatedAt: Date.now() };
  const node = g[studentId].labs[labId] || {
    attempts: 0, completions: 0,
    firstAttempt: Date.now(), lastAttempt: Date.now(),
    bestScore: 0, totalTimeMs: 0,
    mastery: 0, struggles: [], breakthroughs: [],
  };
  node.attempts += 1;
  node.lastAttempt = Date.now();
  g[studentId].labs[labId] = node;

  // Add to current path
  const path = g[studentId].currentPath || [];
  if (path[path.length - 1] !== labId) {
    path.push(labId);
    g[studentId].currentPath = path.slice(-50); // keep last 50
  }

  // Add edges from previous lab to this one (discovered transitions)
  if (path.length >= 2) {
    const from = path[path.length - 2];
    const existing = g[studentId].edges.find(e => e.from === from && e.to === labId);
    if (existing) {
      existing.weight = Math.min(1, existing.weight + 0.1);
    } else {
      g[studentId].edges.push({ from, to: labId, weight: 0.2, type: "discovered" });
    }
  }

  // Add prereq edges from lab metadata
  if (labMeta.prereq) {
    labMeta.prereq.forEach(p => {
      if (!g[studentId].edges.find(e => e.from === p && e.to === labId && e.type === "prereq")) {
        g[studentId].edges.push({ from: p, to: labId, weight: 1, type: "prereq" });
      }
    });
  }
  if (labMeta.unlocks) {
    labMeta.unlocks.forEach(u => {
      if (!g[studentId].edges.find(e => e.from === labId && e.to === u && e.type === "prereq")) {
        g[studentId].edges.push({ from: labId, to: u, weight: 1, type: "prereq" });
      }
    });
  }

  g[studentId].updatedAt = Date.now();
  writeGraph(g);
  return node;
}

/** Update lab progress with event (score, struggle, breakthrough) */
export function recordLabEvent(studentId, labId, event) {
  const g = readGraph();
  if (!g[studentId] || !g[studentId].labs[labId]) return;
  const node = g[studentId].labs[labId];

  switch (event.type) {
    case "score":
      if (event.score > node.bestScore) node.bestScore = event.score;
      node.mastery = Math.min(1, Math.max(node.mastery, event.score / 100));
      break;
    case "struggle":
      const st = node.struggles.find(s => s.topic === event.topic);
      if (st) st.count += 1;
      else node.struggles.push({ topic: event.topic, count: 1 });
      break;
    case "breakthrough":
      node.breakthroughs.push({ topic: event.topic, timestamp: Date.now() });
      node.mastery = Math.min(1, node.mastery + 0.15);
      break;
    case "completed":
      node.completions += 1;
      node.mastery = Math.min(1, node.mastery + 0.2);
      break;
    case "timeSpent":
      node.totalTimeMs += event.ms || 0;
      break;
  }

  g[studentId].updatedAt = Date.now();
  writeGraph(g);
  return node;
}

/** Recommend next labs based on graph traversal */
export function getRecommendations(studentId, allLabs, n = 5) {
  const studentGraph = getStudentGraph(studentId);
  const labs = studentGraph.labs || {};
  const visited = new Set(Object.keys(labs));
  const completed = new Set(Object.keys(labs).filter(id => labs[id].mastery >= 0.6));

  const scored = allLabs.map(lab => {
    let score = 0;
    let reason = "new exploration";

    // Skip what they've mastered
    if (completed.has(lab.id)) return null;

    // Repeat low-mastery lab to build fluency
    if (visited.has(lab.id) && labs[lab.id].mastery < 0.6) {
      score += 30 + (1 - labs[lab.id].mastery) * 40;
      reason = "build mastery";
    }

    // Prereq satisfied (unlocks)
    if (lab.prereq && lab.prereq.every(p => completed.has(p))) {
      score += 60;
      reason = "prereqs complete · ready to unlock";
    }
    // Has unmet prereq
    if (lab.prereq && lab.prereq.some(p => !visited.has(p))) {
      score -= 100;
    }

    // Topic affinity — boost if student has done similar topics
    const topicHistory = Object.keys(labs).filter(id => {
      const l = allLabs.find(x => x.id === id);
      return l && l.topic === lab.topic;
    });
    if (topicHistory.length > 0 && !visited.has(lab.id)) {
      score += 20;
      reason = `continues ${lab.topic} thread`;
    }

    // Fresh topic to broaden horizons
    if (topicHistory.length === 0 && !visited.has(lab.id) && completed.size > 2) {
      score += 15;
      reason = `new topic · ${lab.topic}`;
    }

    if (score <= 0) return null;
    return { ...lab, score, reason };
  }).filter(Boolean);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

/** Compute skills learned summary */
export function getSkillsSummary(studentId, allLabs) {
  const g = getStudentGraph(studentId);
  const skills = {};
  Object.entries(g.labs).forEach(([labId, node]) => {
    const lab = allLabs.find(l => l.id === labId);
    if (!lab) return;
    (lab.skills || []).forEach(skill => {
      skills[skill] = skills[skill] || { level: 0, evidence: [], topic: lab.topic };
      skills[skill].level = Math.min(1, skills[skill].level + node.mastery * 0.5);
      if (!skills[skill].evidence.includes(labId)) skills[skill].evidence.push(labId);
    });
  });
  return Object.entries(skills).map(([skill, data]) => ({ skill, ...data }))
    .sort((a, b) => b.level - a.level);
}

/** Get the path the student has taken */
export function getStudentPath(studentId) {
  return getStudentGraph(studentId).currentPath || [];
}

/** Get full graph for visualization */
export function getGraphData(studentId, allLabs) {
  const g = getStudentGraph(studentId);
  const nodes = allLabs.map(lab => {
    const data = g.labs[lab.id];
    return {
      id: lab.id, label: lab.title, emoji: lab.emoji, topic: lab.topic,
      visited: !!data, mastery: data?.mastery || 0,
      attempts: data?.attempts || 0,
    };
  });
  return { nodes, edges: g.edges || [] };
}

export function resetGraph(studentId) {
  const g = readGraph();
  delete g[studentId];
  writeGraph(g);
}
