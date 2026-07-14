// Resolve a curriculum tool name into a first-party neoschool Labs entry.
// Every subject maps to one of our own interactive labs — no external providers.
import { TOOLS, LABS } from "./data.js";

const SUBJECT_LAB = {
  math:     "sim-fraction-builder",
  algebra:  "sim-algebra-scale",
  science:  "sim-climate-lab",
  physics:  "sim-forces-motion",
  chemistry:"sim-states-matter",
  biology:  "sim-genetics-lab",
  space:    "sim-gravity-orbits",
  coding:   "sim-ai-trainer",
  cs:       "sim-ai-trainer",
  economics:"sim-market-lab",
  social:   "sim-market-lab",
  electricity:"sim-circuit-lab",
};

function labEntry(lab) {
  return { id:"nl-"+lab.id, cat:"neoschool Labs", emoji:lab.emoji, label:lab.title,
    grades:lab.grades, subject:lab.subject, color:"#4a7c6a", desc:lab.desc, url:lab.url, embed:true, free:true };
}

export function resolveTool(name) {
  const q = String(name || "").toLowerCase();
  // direct match in our TOOLS catalog
  const t = TOOLS.find(t => t.label.toLowerCase() === q || q.includes(t.label.toLowerCase()));
  if (t) return t;
  // subject keyword → flagship lab
  for (const [kw, labId] of Object.entries(SUBJECT_LAB)) {
    if (q.includes(kw)) { const lab = LABS.find(l => l.id === labId); if (lab) return labEntry(lab); }
  }
  // any lab whose title appears in the string
  const byTitle = LABS.find(l => q.includes(l.title.toLowerCase()));
  if (byTitle) return labEntry(byTitle);
  // default: our math flagship
  const fallback = LABS.find(l => l.id === "sim-fraction-builder") || LABS[0];
  return labEntry(fallback);
}
