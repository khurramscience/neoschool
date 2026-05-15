// Resolve a curriculum tool name (string like "Khan Academy") into a TOOLS entry
// suitable for SimViewer. Falls back to a synthetic entry that opens the tool's site.
import { TOOLS } from "./data.js";

const KNOWN_PROVIDERS = {
  // ⚠ NON-EMBEDDABLE (X-Frame-Options blocks them — show "Open full" fallback)
  "khan academy":   { url:"https://www.khanacademy.org",     emoji:"📐", cat:"Khan Academy",   grades:"K–12",   subject:"Math + more",       desc:"World-class free curriculum, K-12. Khanmigo AI tutor inside.", embed: false },
  "khan kids":      { url:"https://learn.khanacademy.org/khan-academy-kids/", emoji:"🐻", cat:"Khan Kids",   grades:"PreK–2", subject:"Math + Reading", desc:"Free for ages 2-8. Adaptive math, reading, social-emotional.", embed: false },
  "ixl":            { url:"https://www.ixl.com",             emoji:"📚", cat:"IXL",            grades:"PreK–12",subject:"All subjects",      desc:"17K+ skills with strong diagnostics.", embed: false },
  "dreambox":       { url:"https://www.dreambox.com",        emoji:"🔢", cat:"DreamBox Math",  grades:"K–8",    subject:"Math",              desc:"Adaptive math, ESSA Strong rating.", embed: false },
  "amira learning": { url:"https://www.amiralearning.com",   emoji:"📖", cat:"Amira",          grades:"K–5",    subject:"Reading",           desc:"AI 1:1 reading tutor — 10 min/day.", embed: false },
  "duolingo":       { url:"https://www.duolingo.com",        emoji:"🦉", cat:"Duolingo",       grades:"K–12",   subject:"Language",          desc:"40+ languages, gamified.", embed: false },
  "newsela":        { url:"https://newsela.com",             emoji:"📰", cat:"Newsela",        grades:"Gr 2–12",subject:"Reading",           desc:"Adaptive current-events reading.", embed: false },
  "synthesis":      { url:"https://www.synthesis.com/tutor", emoji:"🧠", cat:"Synthesis Tutor",grades:"K–5",    subject:"Math + Logic",      desc:"Conversational AI math tutor — kids don't realize it's AI.", embed: false },

  // ✓ EMBED-FRIENDLY (allow iframe)
  "scratch":        { url:"https://scratch.mit.edu/projects/editor/?tutorial=getStarted", emoji:"🐱", cat:"Scratch", grades:"Gr 2–8", subject:"Coding", desc:"Build animations + games visually.", embed: true },
  "scratch jr":     { url:"https://www.scratchjr.org",       emoji:"🐱", cat:"ScratchJr",      grades:"K–2",    subject:"Coding",            desc:"Coding for ages 5-7.", embed: false },
  "phet":           { url:"https://phet.colorado.edu/sims/html/build-a-fraction/latest/build-a-fraction_en.html", emoji:"⚛️", cat:"PhET", grades:"K–12", subject:"Science + Math", desc:"Interactive STEM simulations from U. of Colorado.", embed: true },
  "code.org":       { url:"https://studio.code.org/courses",  emoji:"💻", cat:"Code.org",       grades:"K–12",   subject:"Coding",            desc:"Free K-12 CS curriculum.", embed: false },
  "commonlit":      { url:"https://www.commonlit.org",        emoji:"📖", cat:"CommonLit",      grades:"Gr 3–12",subject:"Reading",           desc:"Free reading passages and lessons.", embed: false },
  "ck-12":          { url:"https://www.ck12.org",             emoji:"📚", cat:"CK-12",          grades:"K–12",   subject:"All subjects",      desc:"Free interactive digital textbooks.", embed: false },
  "zearn":          { url:"https://www.zearn.org",            emoji:"🔢", cat:"Zearn",          grades:"K–8",    subject:"Math",              desc:"Free full math curriculum, ESSA Tier 1.", embed: false },
  "canva":          { url:"https://www.canva.com",            emoji:"🎨", cat:"Canva",          grades:"Gr 3–12",subject:"Arts",              desc:"Design, digital media, AI tools.", embed: false },
  "happy numbers":  { url:"https://happynumbers.com",         emoji:"🔢", cat:"Happy Numbers",  grades:"K–5",    subject:"Math",              desc:"Adaptive math K-5, designed for microschools.", embed: false },
  "math playground":{ url:"https://www.mathplayground.com",   emoji:"🎮", cat:"Math Playground",grades:"K–6",    subject:"Math",              desc:"Math games and puzzles.", embed: false },
  "geogebra":       { url:"https://www.geogebra.org/calculator", emoji:"📐", cat:"GeoGebra",    grades:"Gr 4–12",subject:"Math",              desc:"Free dynamic geometry, algebra, calculus.", embed: true },
  "desmos":         { url:"https://www.desmos.com/calculator", emoji:"📊", cat:"Desmos",        grades:"Gr 6–12",subject:"Math",              desc:"World-class graphing calculator.", embed: true },
  "mystery science":{ url:"https://mysteryscience.com",        emoji:"🔬", cat:"Mystery Science",grades:"K–5",    subject:"Science",           desc:"Hands-on science lessons for K-5.", embed: false },
  "starfall":       { url:"https://www.starfall.com",          emoji:"⭐", cat:"Starfall",       grades:"PreK–2", subject:"Reading + Math",    desc:"Phonics-based reading + early math.", embed: false },
  "abcmouse":       { url:"https://www.abcmouse.com",          emoji:"🐭", cat:"ABCmouse",       grades:"PreK–2", subject:"All subjects",      desc:"Full curriculum for ages 2-8.", embed: false },
  "pbs kids":       { url:"https://pbskids.org/games",         emoji:"📺", cat:"PBS Kids",       grades:"PreK–3", subject:"All subjects",      desc:"Educational games from PBS shows.", embed: false },
  "epic":           { url:"https://www.getepic.com",           emoji:"📚", cat:"Epic Books",     grades:"PreK–6", subject:"Reading",           desc:"40K+ books, videos, quizzes.", embed: false },
  "tinkercad":      { url:"https://www.tinkercad.com",         emoji:"🔧", cat:"Tinkercad",      grades:"Gr 3–12",subject:"3D + Coding",       desc:"3D design + Arduino + Codeblocks.", embed: false },
  "prodigy":        { url:"https://www.prodigygame.com",       emoji:"🎮", cat:"Prodigy Math",   grades:"1–8",    subject:"Math",              desc:"Math RPG game.", embed: false },
};

export function resolveTool(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();

  // 1) Exact match in TOOLS catalog (by cat)
  let match = TOOLS.find(t => t.cat?.toLowerCase() === n);
  if (match) return match;

  // 2) Substring match against TOOLS
  match = TOOLS.find(t => n.includes(t.cat?.toLowerCase()) || (t.cat && t.cat.toLowerCase().includes(n.split(/[\s+,]/)[0])));
  if (match) return match;

  // 3) Known external providers (with proper embed flag)
  for (const [key, val] of Object.entries(KNOWN_PROVIDERS)) {
    if (n.includes(key) || key.includes(n)) {
      return { id: key.replace(/\s/g,"-"), label: name, ...val };
    }
  }

  // 4) Fall back to Google search
  return {
    id: n.replace(/\s/g,"-"),
    label: name,
    cat: name,
    emoji: "🔗",
    grades: "All",
    subject: "Various",
    url: `https://www.google.com/search?q=${encodeURIComponent(name + " for kids learning")}`,
    embed: false,
  };
}
