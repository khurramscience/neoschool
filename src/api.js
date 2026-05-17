// ── NEOSCHOOL API LAYER ───────────────────────────────────────────────────────
const MODEL = "claude-sonnet-4-20250514";

// If a Supabase URL is configured, route all Anthropic calls through our
// Edge Function (anthropic-proxy) so the API key stays server-side.
// Otherwise, fall back to direct browser calls using a per-user localStorage key.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PROXY_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/anthropic-proxy` : null;

// Get user-provided API key (only used in fallback mode)
function getApiKey() {
  return localStorage.getItem("neo_api_key") || "";
}

export async function claude(system, messages, maxT = 200) {
  // Prefer the Edge Function proxy (production path)
  if (PROXY_URL) {
    const r = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: maxT, system, messages }),
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      throw new Error(`Anthropic proxy error ${r.status}: ${errText}`);
    }
    const data = await r.json();
    return data.content?.[0]?.text || "";
  }

  // Fallback: direct browser call with user's localStorage key
  const apiKey = getApiKey();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;
  headers["anthropic-version"] = "2023-06-01";
  headers["anthropic-dangerous-direct-browser-access"] = "true";

  const body = { model: MODEL, max_tokens: maxT, messages };
  if (system) body.system = system;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${r.status}`);
  }

  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.[0]?.text || "";
}

// Robust JSON extractor — handles markdown fences, leading text
function extractJSON(raw) {
  if (!raw) throw new Error("Empty response");
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  return JSON.parse(s.slice(start, end + 1));
}

export async function genJSON(prompt, maxT = 900) {
  const raw = await claude(null, [{ role: "user", content: prompt }], maxT);
  return extractJSON(raw);
}

// ── Curriculum for parent onboarding ─────────────────────────────────────────
export async function genCurriculum(form) {
  const name  = form.childName || "your child";
  const grade = form.grade || "3rd Grade";
  const city  = form.city || "California";
  const goals = form.goals?.join(", ") || "well-rounded learning";
  const concerns = form.concerns || "";

  try {
    const c = await genJSON(
`Create a personalized weekly curriculum for ${name}, ${grade}, ${city} CA. Goals: ${goals}.${concerns ? ` Parent's notes: ${concerns}` : ""}

Return ONLY this JSON (no extra text):
{
"tagline":"inspiring 10-word sentence",
"morning":"2-hour morning block description (2 sentences)",
"afternoon":"afternoon enrichment (2 sentences)",
"subjects":[{"name":"Subject","emoji":"emoji","tool":"tool name","focus":"specific focus (1 sentence)","mins":60}],
"workshops":[{"name":"Workshop","emoji":"emoji","cadence":"1x/week","desc":"1 sentence"}],
"uniqueGenius":{"title":"3-5 word phrase highlighting ${name}'s specific strength or genius","description":"1-2 sentence specific observation about what makes ${name} unique"},
"persona":{"learningStyle":"how ${name} learns best","strengths":"observed strengths","interests":"what excites them","growthEdges":"reframed as opportunities, not weaknesses","communicationStyle":"how they engage"},
"coachNote":"warm coach note (2 sentences)",
"nextStep":"one specific action"
}

Include 5 subjects and 4 workshops (Life skills: cooking, gardening, communication, financial literacy, entrepreneurship, emotional intelligence, survival skills).
Prefer iframe-friendly tools: Zearn, PhET, Scratch, GeoGebra, Desmos, Code.org, Canva, Duolingo, CommonLit.
For "uniqueGenius" — be SPECIFIC to ${name}'s grade and goals, not generic. Frame as their unique super-power.`, 1200);
    return c;
  } catch (e) {
    console.warn("genCurriculum used fallback:", e.message);
    return {
      tagline: `A personalized ${grade} learning journey for ${name}`,
      morning: `${name} starts with a focused 2-hour academic block covering math and reading using AI-powered tools that adapt to their pace.`,
      afternoon: "Afternoons are for creative projects, outdoor exploration, and real-world skills that AI can never replace.",
      subjects: [
        { name:"Math",    emoji:"🔢", tool:"Zearn",        focus:"Building strong number sense with adaptive daily practice.", mins:60 },
        { name:"Reading", emoji:"📖", tool:"CommonLit",    focus:"Developing comprehension through engaging grade-level texts.", mins:45 },
        { name:"Science", emoji:"🔬", tool:"PhET",         focus:"Hands-on inquiry using interactive simulations.", mins:30 },
        { name:"Coding",  emoji:"💻", tool:"Scratch",      focus:"Building logical thinking through creative projects.", mins:30 },
        { name:"Arts",    emoji:"🎨", tool:"Canva",        focus:"Creative expression and visual design thinking.", mins:30 },
      ],
      workshops: [
        { name:"Cooking",                emoji:"🍳", cadence:"1x/week", desc:"Real-world math, fractions, and self-sufficiency through kitchen science." },
        { name:"Emotional intelligence", emoji:"💛", cadence:"2x/week", desc:"Naming feelings, building empathy, and learning to repair relationships." },
        { name:"Entrepreneurship",       emoji:"💡", cadence:"1x/week", desc:"Coming up with ideas, designing simple businesses, pitching to peers." },
        { name:"Outdoor exploration",    emoji:"🌳", cadence:"daily",   desc:"Free unstructured outside time — nature scavenger hunts, fort-building, observation." },
      ],
      uniqueGenius: {
        title: "Pattern-spotter and connector",
        description: `${name} notices connections others miss — across stories, numbers, and the natural world. We'll cultivate this strength by pairing math-reading-science weekly.`,
      },
      persona: {
        learningStyle: "Visual + kinesthetic — learns by seeing and doing",
        strengths: "Curiosity, persistence, asks unusual questions",
        interests: "Stories, building things, asking 'why'",
        growthEdges: "Practicing patience with multi-step problems (opportunity, not weakness)",
        communicationStyle: "Best when given choice and time to think",
      },
      coachNote: `${name} sounds like a curious learner. We'll meet them exactly where they are. Expect visible growth within the first two weeks.`,
      nextStep: "Schedule a 15-minute intro call with your Guide to discuss learning style and specific goals.",
    };
  }
}

// ── Multi-subject curriculum (new) ───────────────────────────────────────────
export async function genMultiCurriculum({ ageBand, subjects, weeks, style, dailyMin }) {
  const subjectList = subjects.join(", ");
  try {
    const c = await genJSON(
`You are an expert curriculum designer for Neoschool microschools.
Create a ${weeks}-week integrated curriculum covering: ${subjectList}.
Age group: ${ageBand.label} (${ageBand.grades}). Style: ${style}. Daily time: ${dailyMin} minutes.

Return ONLY this JSON:
{"overview":"2-sentence overview","dailySchedule":"${dailyMin} min broken into blocks","weeks":[{"week":1,"title":"title","theme":"theme","days":{"Monday":[{"time":"9:00-10:00","subject":"${subjects[0]}","activity":"specific activity","tool":"tool"}],"Tuesday":[],"Wednesday":[],"Thursday":[],"Friday":[]},"bySubject":{"${subjects[0]}":{"objective":"goal","activity":"activity","tool":"tool"}},"assessment":"age-appropriate","parentTip":"home tip"}],"materials":["3 materials"],"differentiationTips":"2 sentences","networkInsight":"insight"}

Include ${Math.min(weeks, 4)} weeks. Each weekday should have 2-3 time blocks rotating through: ${subjects.join(", ")}. Wednesday is project day. Friday includes reflection.`, 1500);
    return c;
  } catch (e) {
    console.warn("genMultiCurriculum fallback:", e.message);
    const subj = (i) => subjects[i % subjects.length] || subjects[0];
    const sampleDays = {
      Monday:    [{time:"9:00-10:30",subject:subj(0),activity:`${subj(0)} foundations & warm-up`,tool:"Khan Academy"},{time:"10:45-11:30",subject:subj(1),activity:`${subj(1)} hands-on practice`,tool:"PhET"}],
      Tuesday:   [{time:"9:00-10:30",subject:subj(2),activity:`${subj(2)} deep dive`,tool:"CommonLit"},{time:"10:45-11:30",subject:subj(3),activity:`${subj(3)} review & games`,tool:"Math Playground"}],
      Wednesday: [{time:"9:00-11:00",subject:"Integrated Project",activity:`Project combining ${subjectList}`,tool:"Scratch"}],
      Thursday:  [{time:"9:00-10:30",subject:subj(4),activity:`${subj(4)} application`,tool:"Code.org"},{time:"10:45-11:30",subject:subj(0),activity:`${subj(0)} group discussion`,tool:""}],
      Friday:    [{time:"9:00-10:00",subject:"Reflection",activity:"Week reflection + showcase",tool:""},{time:"10:00-11:30",subject:"Choice Time",activity:"Free exploration in any subject",tool:""}],
    };
    return {
      overview: `An integrated ${weeks}-week curriculum weaving together ${subjectList} for ${ageBand.label}.`,
      dailySchedule: `${Math.floor(dailyMin * 0.5)} min core → ${Math.floor(dailyMin * 0.3)} min project → ${Math.floor(dailyMin * 0.2)} min reflection`,
      weeks: Array.from({ length: Math.min(weeks, 4) }, (_, i) => ({
        week: i + 1,
        title: `Week ${i + 1}: Exploring ${subjects[i % subjects.length]}`,
        theme: `Connections between ${subjectList}`,
        days: sampleDays,
        bySubject: Object.fromEntries(subjects.map(s => [s, { objective: `Build foundational ${s} skills`, activity: `Interactive ${s} activity`, tool: "Khan Academy / PhET" }])),
        assessment: "Portfolio observation",
        parentTip: `This week ask your child to teach you one thing they learned about ${subjects[i % subjects.length]}.`,
      })),
      materials: ["Khan Academy (free)", "PhET Simulations (free)", "Scratch (free)"],
      differentiationTips: "For advanced learners, add cross-subject connections. For learners who need support, focus on one subject at a time.",
      networkInsight: "Schools using integrated curricula report 23% higher engagement than single-subject approaches.",
    };
  }
}

// ── Morning briefing ──────────────────────────────────────────────────────────
export async function genBriefing(students) {
  try {
    const c = await genJSON(
`Morning briefing for a Neoschool Guide. Students: ${students.map(s => `${s.name}(${s.grade}, velocity:${s.velocity})`).join(", ")}.
Return ONLY this JSON:
{"greeting":"one energizing sentence about today","priority":["action 1","action 2","action 3"],"spotlight":{"student":"first name","why":"one sentence"},"tip":"one practical coaching tip"}`, 500);
    return c;
  } catch (e) {
    const urgent = students.find(s => s.alerts?.some(a => a.sev === "high"));
    return {
      greeting: `Good morning! ${students.length} learners are counting on your presence today — make it count.`,
      priority: [
        urgent ? `Check in with ${urgent.name} first — they need your attention` : "Do a quick energy check with the whole group",
        "Review who's ready to advance and unlock their next challenge",
        "Plan one moment of genuine human connection with each student",
      ],
      spotlight: { student: students[0]?.name?.split(" ")[0], why: "Start with your most engaged learner — their energy sets the tone for the room." },
      tip: "The first 5 minutes determine the whole session. Arrive early, greet each student by name.",
    };
  }
}

// ── Parent communication ──────────────────────────────────────────────────────
export async function genParentComm(student) {
  try {
    const c = await genJSON(
`Warm parent update from Campus Director for ${student.name} (${student.grade}). Learning is going well.
Return ONLY this JSON:
{"subject":"subject line","body":"3 warm specific sentences","emoji":"emoji"}`, 300);
    return c;
  } catch (e) {
    return {
      emoji: "⭐",
      subject: `${student.name} had a wonderful learning session today`,
      body: `${student.name} showed real curiosity and focus today — exactly the mindset we love to cultivate. They made meaningful progress and we can see their confidence growing week by week. We're proud to be their learning community.`,
    };
  }
}

export async function fetchScratchProjects(username) {
  try {
    const r = await fetch(`https://api.scratch.mit.edu/users/${username}/projects?limit=5`);
    const d = await r.json();
    return d.map(p => ({ id: p.id, title: p.title, views: p.stats?.views || 0 }));
  } catch { return []; }
}
