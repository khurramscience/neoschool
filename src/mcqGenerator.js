// ── MCQ GENERATOR ───────────────────────────────────────────────────────────
// The tutor can spawn a quick 3-choice MCQ to check the student's understanding
// after explaining a concept. The MCQ is returned as a special <mcq> block
// inside the tutor's response, which is parsed and rendered as an interactive
// quiz card in the chat.

import { claude } from "./api.js";

/** Ask Claude to generate an MCQ for a given concept */
export async function generateMCQ({ labId, topic, concept, gradeLevel, recentExchange }) {
  const systemPrompt = `You generate ONE multiple-choice question to check a student's understanding.

OUTPUT FORMAT (strict JSON only, no prose):
{
  "question": "1-2 sentence question",
  "choices": ["A: ...", "B: ...", "C: ..."],
  "correct": 0,
  "explanation": "1 sentence explaining why the correct answer is right",
  "misconception_hints": {
    "0": null,
    "1": "If picked B: hint at the underlying misconception (without giving the answer)",
    "2": "If picked C: hint at the underlying misconception"
  }
}

RULES:
1. Exactly 3 choices. One unambiguously correct. Two should be PLAUSIBLE wrong answers that reflect common misconceptions.
2. Tied to the simulation/lab the student is working on.
3. Use LaTeX for math: \\\\( F = ma \\\\), \\\\( T = 2\\pi\\sqrt{L/g} \\\\).
4. Grade-appropriate vocabulary for ${gradeLevel || "middle school"}.
5. Misconception hints should be Socratic — point toward thinking, not the answer.
6. The question should help the student GENERALIZE from what they just did, not test memorization.

CONTEXT:
- Lab: ${labId}
- Topic: ${topic}
- Concept just explained: ${concept}
- Recent exchange: ${recentExchange || "(none)"}`;

  try {
    const response = await claude(
      systemPrompt,
      [{ role: "user", content: `Generate one MCQ about: ${concept}` }],
      400
    );
    // Parse JSON (strip any markdown fences)
    const cleaned = response.replace(/```json|```/g, "").trim();
    const mcq = JSON.parse(cleaned);
    return {
      ...mcq,
      id: `mcq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      labId, topic, concept,
      createdAt: Date.now(),
    };
  } catch (err) {
    console.error("MCQ generation failed:", err);
    return null;
  }
}

/** Decide whether to spawn an MCQ based on the conversation */
export function shouldSpawnMCQ(messages, lastMCQAt) {
  if (!messages || messages.length < 4) return false;
  // Don't spawn more than one MCQ every 4 messages
  if (lastMCQAt && Date.now() - lastMCQAt < 60 * 1000) return false;
  // Look at last assistant message — has it explained something?
  const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
  if (!lastAssistant) return false;
  // Heuristic: if the message is over 100 chars AND mentions a key word
  const explanationKeywords = ["because", "when", "the reason", "this means", "happens because", "this is why", "in fact", "actually"];
  const hasExplanation = explanationKeywords.some(kw => lastAssistant.content.toLowerCase().includes(kw));
  const longEnough = lastAssistant.content.length > 100;
  return hasExplanation && longEnough;
}

/** Record MCQ result to knowledge graph + memory */
export function recordMCQResult(mcq, chosenIdx, studentId, labId) {
  const correct = chosenIdx === mcq.correct;
  const log = JSON.parse(localStorage.getItem("neo_mcq_log_v1") || "[]");
  log.push({
    id: mcq.id,
    studentId,
    labId,
    concept: mcq.concept,
    chosen: chosenIdx,
    correct,
    timestamp: Date.now(),
  });
  if (log.length > 500) log.splice(0, log.length - 500);
  localStorage.setItem("neo_mcq_log_v1", JSON.stringify(log));
  return correct;
}

export function getMCQStats(studentId) {
  const log = JSON.parse(localStorage.getItem("neo_mcq_log_v1") || "[]");
  const mine = log.filter(l => l.studentId === studentId);
  const correct = mine.filter(l => l.correct).length;
  return {
    total: mine.length,
    correct,
    accuracy: mine.length > 0 ? correct / mine.length : 0,
    byLab: mine.reduce((acc, l) => {
      acc[l.labId] = acc[l.labId] || { correct: 0, total: 0 };
      acc[l.labId].total++;
      if (l.correct) acc[l.labId].correct++;
      return acc;
    }, {}),
  };
}
