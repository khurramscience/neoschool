import { useState, useEffect, useRef, useCallback } from "react";
import { LABS, TUTORS, TOOLS, CONTENT_PROVIDERS, DEMO_STUDENTS, CA_CITIES, GRADES, SITUS, GOALS } from "./data.js";
import { resolveTool } from "./toolResolver.js";
import { claude, genJSON, genCurriculum, genMultiCurriculum, genBriefing, genParentComm } from "./api.js";
import { getMemory, saveSession, saveTutorFeedback, buildRecommendations, buildCrossContext } from "./memory.js";
import { getCredits, useCredits, addCredits, PLANS, COSTS } from "./credits.js";
import { getTutorConfig, saveTutorConfig } from "./tutorConfig.js";

// ── SHARED ────────────────────────────────────────────────────────────────────
const Logo = ({ l, sz = 16 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: sz + 14, height: sz + 14, borderRadius: 8, background: l ? "rgba(255,255,255,.15)" : "var(--nv)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.8" fill="white" /><path d="M10 2C10 2 14 5 14 10C14 15 10 18 10 18" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M10 2C10 2 6 5 6 10C6 15 10 18 10 18" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M2 10H18" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>
    </div>
    <span style={{ fontFamily: "'Fraunces',serif", fontSize: sz, fontWeight: 500, color: l ? "#fff" : "var(--nv)", letterSpacing: "-.01em" }}>neoschool</span>
  </div>
);
const Spn = ({ dark }) => <div className={`spn${dark ? " spnd" : ""}`} />;
const PBar = ({ v, c = "var(--nv)", h = 4 }) => <div className="pb" style={{ height: h }}><div className="pf" style={{ width: `${Math.min(v, 100)}%`, background: c, height: h }} /></div>;

// ── CREDITS WIDGET + PAYMENT MODAL ───────────────────────────────────────────
function CreditsWidget({ userId, onBuyMore }) {
  const bal = getCredits(userId || "demo").balance;
  const pct = Math.min((bal / 30) * 100, 100);
  return (
    <div onClick={onBuyMore} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.12)", borderRadius:99, padding:"5px 12px", cursor:"pointer" }}>
      <span>⚡</span>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color: bal < 5 ? "#ffb347" : "#fff" }}>{bal} cr</div>
        <div style={{ width:48, height:3, borderRadius:99, background:"rgba(255,255,255,.2)" }}>
          <div style={{ width:`${pct}%`, height:"100%", borderRadius:99, background: bal < 5 ? "#ffb347" : "var(--sg2)" }}/>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ userId, onClose }) {
  const [sel, setSel] = useState("family");
  const [loading, setLoading] = useState(false);
  const simulatePurchase = (plan) => {
    setLoading(true);
    setTimeout(() => {
      addCredits(userId, plan.credits, plan.id);
      setLoading(false);
      alert(`✅ ${plan.credits} credits added!\n\nDemo mode — connect Stripe at dashboard.stripe.com for real payments.`);
      onClose();
    }, 1400);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="card pi" style={{ maxWidth:520, width:"100%", padding:"28px 24px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div><h2 className="h2">Get more credits</h2><p className="mu" style={{ fontSize:12 }}>Balance: <strong>{getCredits(userId).balance} credits</strong></p></div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--mu)" }}>×</button>
        </div>
        <div style={{ background:"var(--p)", borderRadius:10, padding:"9px 13px", marginBottom:16 }}>
          <p style={{ fontSize:12, color:"var(--mu)" }}>💡 Costs: Tutor msg=1 · Curriculum=5 · Briefing=3 · Parent update=2</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {PLANS.map(plan => (
            <div key={plan.id} onClick={() => setSel(plan.id)} style={{ border:`2px solid ${sel===plan.id?plan.color:"var(--p2)"}`, borderRadius:13, padding:"13px", cursor:"pointer", background:sel===plan.id?`${plan.color}14`:"#fff", position:"relative", transition:"all .2s" }}>
              {plan.popular && <div style={{ position:"absolute", top:-9, right:10, background:plan.color, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99 }}>POPULAR</div>}
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:500, marginBottom:2 }}>{plan.name}</div>
              <div style={{ fontSize:17, fontWeight:700, color:plan.color, marginBottom:2 }}>{plan.price===0?"Free":`$${plan.price}/mo`}</div>
              <div style={{ fontSize:11, fontWeight:700, marginBottom:2 }}>⚡ {plan.credits} credits</div>
              <div style={{ fontSize:10, color:"var(--mu)" }}>{plan.desc}</div>
            </div>
          ))}
        </div>
        {(() => {
          const plan = PLANS.find(p => p.id === sel);
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button className="btn bn fw" onClick={() => simulatePurchase(plan)} disabled={loading}>
                {loading ? "Adding credits…" : plan.price===0 ? `✦ Add ${plan.credits} free credits` : `⚡ Demo: ${plan.credits} credits ($${plan.price})`}
              </button>
              {plan.price > 0 && <a href={plan.stripe||"#"} target="_blank" rel="noopener noreferrer" className="btn bo fw" style={{ textDecoration:"none" }}>💳 Real Stripe checkout →</a>}
            </div>
          );
        })()}
        <p style={{ textAlign:"center", fontSize:11, color:"var(--mu)", marginTop:10 }}>Powered by Stripe · Schools: enterprise@neoschool.me</p>
      </div>
    </div>
  );
}

// ── MARKETING LANDING ─────────────────────────────────────────────────────────
function Marketing({ onStart }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const tracks = [
    { id:"parent",   icon:"👩‍👧", headline:"For Families.",    sub:"Find a neoschool campus, or use the platform at home. Personalized AI curriculum + a community of families.", cta:"For parents", color:"#d9622b" },
    { id:"guide",    icon:"🏕️", headline:"For Guides.",       sub:"Facilitate, don't lecture. The platform handles data, comms, and adaptation — you focus 100% on the humans.", cta:"For Guides", color:"#4a7c6a" },
    { id:"director", icon:"🏛️", headline:"Launch a campus.",  sub:"Open a neoschool campus in your community. Curriculum, tools, comms, enrollment — all in one box.", cta:"For Directors", color:"#2d6ea8" },
  ];
  const stats = ["The OS for microschools","19 AI tutors","14 interactive labs","38 embedded tools","Renaissance-style trajectories","COPPA & FERPA compliant","Curriculum builder for any age","Founding campuses opening 2026"];
  const values = [
    { v:"Curiosity",            emoji:"🔬" },
    { v:"Collaboration",        emoji:"🤝" },
    { v:"Love of learning",     emoji:"💛" },
    { v:"Intrinsic motivation", emoji:"⚡" },
    { v:"Resilience",           emoji:"🌱" },
    { v:"Self-awareness",       emoji:"🪞" },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--cr)" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,244,237,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--p2)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo sz={16} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--mu)", fontWeight: 500 }}>The OS for microschools</span>
          <button className="btn bn sm" onClick={() => onStart("parent")}>Get started →</button>
        </div>
      </nav>

      {/* HERO — refined editorial pitch */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "100px 32px 60px", textAlign: "center" }}>
        <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", border:"1px solid var(--p2)", borderRadius: 99, padding: "7px 16px", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sg)", animation: "pu 2s infinite" }} />
          <span className="eyebrow" style={{ color: "var(--tx2)", fontSize:10.5 }}>Now enrolling · Founding families</span>
        </div>
        <h1 className="fu d1" style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(44px, 7vw, 78px)", fontWeight: 400, lineHeight: 1.02, letterSpacing:"-.025em", marginBottom: 24, color: "var(--nv)" }}>
          Any parent.<br/>
          Any teacher.<br/>
          <em style={{ color: "var(--or)", fontWeight:300, fontStyle:"italic" }}>Launch a school.</em>
        </h1>
        <p className="fu d2" style={{ fontFamily:"'Newsreader',serif", fontSize: 19, color: "var(--tx2)", lineHeight: 1.55, maxWidth: 600, margin: "0 auto 36px", fontWeight:300 }}>
          The operating system for microschools — personalized curriculum, AI tutors, real growth tracking. Built by parents, for parents.
        </p>
        <div className="fu d3" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn bo" style={{ fontSize: 15.5, padding: "15px 30px" }} onClick={() => onStart("director")}>Launch a campus →</button>
          <button className="btn bg" style={{ fontSize: 15.5, padding: "15px 30px" }} onClick={() => onStart("parent")}>For parents</button>
        </div>
      </section>

      {/* Ticker */}
      <div style={{ overflow: "hidden", borderTop: "1px solid var(--nv2)", borderBottom: "1px solid var(--nv2)", padding: "14px 0", background: "var(--nv)", marginBottom: 80 }}>
        <div style={{ display: "flex", gap: 48, animation: "marquee 28s linear infinite", whiteSpace: "nowrap" }}>
          {[...stats, ...stats].map((s, i) => (
            <span key={i} style={{ fontFamily:"'Geist Mono',monospace", fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,.55)", flexShrink: 0, letterSpacing:".06em", textTransform:"uppercase" }}>✦ {s}</span>
          ))}
        </div>
      </div>

      {/* FOUNDING CAMPUSES — first cohort */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "10px 24px 60px" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, textAlign:"center" }}>Founding campuses · opening 2026</p>
        <h2 className="fu" style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 500, textAlign: "center", marginBottom: 8 }}>Where neoschool is opening first.</h2>
        <p className="fu d1 mu" style={{ textAlign:"center", fontSize:14, marginBottom:32, lineHeight:1.65, maxWidth:540, margin:"0 auto 32px" }}>
          The first cohort of neoschool campuses. Each runs the same model — built for how kids actually learn.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:14 }}>
          {[
            {
              name: "Missoula",
              region: "Montana",
              status: "Now enrolling",
              date: "Sept 2026",
              grades: "K + 1st",
              action: "apply",
              flagship: true,
            },
            {
              name: "Palo Alto",
              region: "California",
              status: "Waitlist open",
              date: "Jan 2027",
              grades: "K + 1st",
              action: "waitlist",
              flagship: false,
            },
            {
              name: "Berkeley",
              region: "California",
              status: "Waitlist open",
              date: "Jan 2027",
              grades: "K + 1st",
              action: "waitlist",
              flagship: false,
            },
            {
              name: "San Francisco",
              region: "California",
              status: "Waitlist open",
              date: "Jan 2027",
              grades: "K + 1st",
              action: "waitlist",
              flagship: false,
            },
          ].map((c,i) => {
            const onCardClick = () => onStart("parent");
            return (
              <div key={i} className={`card fu d${i+1}`} onClick={onCardClick} style={{
                textDecoration: "none", color: "inherit",
                padding: "20px 18px",
                borderTop: c.flagship ? "3px solid var(--or)" : "1px solid var(--p2)",
                background: c.flagship ? "linear-gradient(135deg,#fff8f0,#fff)" : "#fff",
                cursor: "pointer",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99,
                                 color: c.flagship ? "var(--sg)" : "var(--mu)",
                                 background: c.flagship ? "#dff2ea" : "var(--p)" }}>
                    {c.flagship ? "✦ " : ""}{c.status}
                  </span>
                  {c.flagship && <span style={{ fontSize:9, color:"var(--or)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Flagship</span>}
                </div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:500, marginBottom:2 }}>{c.name}</h3>
                <p style={{ fontSize:11.5, color:"var(--mu)", marginBottom:10 }}>{c.region}</p>
                <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:10.5, background:"var(--p)", color:"var(--mu)", padding:"2px 7px", borderRadius:6, fontWeight:600 }}>📅 {c.date}</span>
                  <span style={{ fontSize:10.5, background:"var(--p)", color:"var(--mu)", padding:"2px 7px", borderRadius:6, fontWeight:600 }}>🎓 {c.grades}</span>
                </div>
                {c.action === "apply" ? (
                  <span style={{ fontSize:12.5, fontWeight:600, color:"var(--or)" }}>Apply now →</span>
                ) : (
                  <span style={{ fontSize:12.5, fontWeight:600, color:"var(--mu)" }}>Join waitlist →</span>
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"var(--mu)" }}>
          Don't see your city? <button onClick={() => setShowInterestForm(true)} style={{ background:"none", border:"none", color:"var(--or)", fontWeight:600, cursor:"pointer", textDecoration:"underline", fontSize:13 }}>Launch a campus in your community →</button>
        </p>
      </section>

      {/* THE neoschool MODEL — what every campus runs */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "30px 24px 60px" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, textAlign:"center" }}>The neoschool model</p>
        <h2 className="fu" style={{ fontFamily:"'Fraunces',serif", fontSize:30, fontWeight:500, textAlign:"center", marginBottom:14 }}>Four pillars. One day that works.</h2>
        <p className="fu d1 mu" style={{ textAlign:"center", fontSize:14, marginBottom:32, lineHeight:1.7, maxWidth:560, margin:"0 auto 32px" }}>The neoschool model — built for how kids actually learn.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16 }}>
          {[
            { emoji:"🧠", title:"Smart Academics",       desc:"Two focused hours of instructor-led and AI-adaptive core learning each day, personalized to each child's pace. Brain breaks between subjects keep energy high." },
            { emoji:"🛠️", title:"Real-World Projects",    desc:"Hands-on projects that connect classroom learning to the world outside. Make, build, present, defend." },
            { emoji:"🍳", title:"Life Skills Workshops", desc:"Conscious communication, emotional intelligence, entrepreneurship, financial literacy, cooking, gardening, and survival skills. Skills traditional school skips." },
            { emoji:"🌳", title:"Free Outdoor Play",     desc:"Unstructured time outside every day. Because rest, movement, and boredom are part of learning." },
          ].map((p,i) => (
            <div key={i} className={`card fu d${i+1}`} style={{ padding:"22px" }}>
              <div style={{ fontSize:30, marginBottom:10 }}>{p.emoji}</div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:19, fontWeight:500, marginBottom:8 }}>{p.title}</h3>
              <p style={{ fontSize:13, color:"var(--mu)", lineHeight:1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12 CORE COMPETENCIES (replaces 6 values) */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "10px 24px 60px" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, textAlign:"center" }}>What neoschool builds in students</p>
        <h2 className="fu" style={{ fontFamily:"'Fraunces',serif", fontSize:30, fontWeight:500, marginBottom:8, textAlign:"center" }}>The next generation of conscious leaders.</h2>
        <p className="fu d1 mu" style={{ textAlign:"center", fontSize:14, marginBottom:32, lineHeight:1.65, maxWidth:560, margin:"0 auto 32px" }}>12 core competencies organized in 3 dimensions. Measured by growth over time — not grades.</p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          {[
            {
              dim: "Who I am",
              color: "#7c4a9a", bg: "#f3eaf6",
              items: [
                { emoji:"🪞", v:"Self-awareness",        sub:"Feelings & strengths" },
                { emoji:"⚡", v:"Intrinsic motivation",  sub:"Drive from within" },
                { emoji:"🌱", v:"Resilience",            sub:"Bounce back, try again" },
                { emoji:"🧭", v:"Agency",                sub:"Make decisions, own outcomes" },
              ],
            },
            {
              dim: "How I learn",
              color: "#4a7c6a", bg: "#dff2ea",
              items: [
                { emoji:"🔬", v:"Curiosity",             sub:"Ask questions, wonder" },
                { emoji:"💛", v:"Love of learning",      sub:"Find joy in discovery" },
                { emoji:"✏️", v:"Creative problem solving", sub:"New ways through challenges" },
                { emoji:"💬", v:"Communication",         sub:"Express ideas, listen well" },
              ],
            },
            {
              dim: "How I show up",
              color: "#c8940e", bg: "#fdf3d0",
              items: [
                { emoji:"🤝", v:"Collaboration",          sub:"Work toward shared goals" },
                { emoji:"🫂", v:"Empathy",                sub:"See others' perspectives" },
                { emoji:"🚀", v:"Initiative & follow-through", sub:"Start things, finish things" },
                { emoji:"🔄", v:"Adaptability",           sub:"Flex when plans change" },
              ],
            },
          ].map((col, ci) => (
            <div key={ci}>
              <p style={{ textAlign:"center", fontSize:12, fontWeight:700, color:col.color, marginBottom:11, textTransform:"none" }}>{col.dim}</p>
              {col.items.map((it, i) => (
                <div key={i} className={`fu d${ci*4+i+1}`} style={{ background:col.bg, borderRadius:12, padding:"12px 14px", marginBottom:8, borderLeft:`3px solid ${col.color}` }}>
                  <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                    <span style={{ fontSize:18 }}>{it.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:col.color, marginBottom:2 }}>{it.v}</div>
                      <div style={{ fontSize:11, color:"var(--tx)", lineHeight:1.4 }}>{it.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Measured how? */}
        <div style={{ marginTop:32, paddingTop:28, borderTop:"1px solid var(--p2)" }}>
          <p style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>Measured how?</p>
          <h3 className="fu" style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:500, marginBottom:20, textAlign:"center" }}>Growth over time — not grades.</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:20 }}>
            {[
              { color:"#7c4a9a", bg:"#f3eaf6", t:"Guide observations", d:"Weekly narrative check-ins" },
              { color:"#4a7c6a", bg:"#dff2ea", t:"Student reflection",  d:"Self-rating + examples" },
              { color:"#c8940e", bg:"#fdf3d0", t:"Portfolio evidence",  d:"Projects, peer feedback" },
            ].map((m,i) => (
              <div key={i} className={`fu d${i+1}`} style={{ background:m.bg, borderRadius:12, padding:"16px 18px", textAlign:"center", borderLeft:`3px solid ${m.color}` }}>
                <div style={{ fontSize:14, fontWeight:700, color:m.color, marginBottom:5 }}>{m.t}</div>
                <div style={{ fontSize:12, color:"var(--mu)" }}>{m.d}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"var(--p)", borderRadius:12, padding:"14px 18px", textAlign:"center" }}>
            <div style={{ fontSize:12.5, fontWeight:700, marginBottom:5 }}>Progress report: growth over time, not grades</div>
            <div style={{ fontSize:12, color:"var(--mu)" }}>With support  →  Sometimes  →  Often  →  Consistently</div>
          </div>
        </div>
      </section>

      {/* THE SCIENCE — moved BEFORE platform per parent feedback */}
      <section style={{ background:"var(--p)", padding:"70px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, textAlign:"center" }}>The science behind the model</p>
          <h2 className="fu" style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:500, textAlign:"center", marginBottom:12 }}>What the research actually says.</h2>
          <p className="fu d1 mu" style={{ textAlign:"center", fontSize:14, marginBottom:34, lineHeight:1.7, maxWidth:620, margin:"0 auto 34px" }}>
            What the research really tells us about young learners.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
            {[
              { stat:"10–15 min", desc:"natural focus window for ages 5–7. Our 2-hour block uses short cycles with brain breaks, never 2 hours at a desk.", source:"Attention Span Development in Early Years" },
              { stat:"Learn by doing", desc:"Children ages 5–7 are natural constructors of knowledge. PBL matches how they actually learn.", source:"Buck Institute · Ferrero et al., 2021" },
              { stat:"AAP endorsed", desc:"Daily unstructured outdoor play is a developmental non-negotiable. Core to learning, not a break from it.", source:"NAEYC · Bento & Dias, 2017" },
            ].map((s,i) => (
              <div key={i} className={`fu d${i+1}`} style={{ background:"#fff", borderRadius:13, padding:"20px 18px" }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:500, color:"var(--or)", marginBottom:9 }}>{s.stat}</div>
                <p style={{ fontSize:13, color:"var(--tx)", lineHeight:1.65, marginBottom:10 }}>{s.desc}</p>
                <p style={{ fontSize:10, color:"var(--mu)", fontStyle:"italic" }}>Source: {s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PLATFORM — what makes it possible (moved BELOW science) */}
      <section style={{ background:"var(--nv)", padding:"70px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8, textAlign:"center" }}>The neoschool platform</p>
          <h2 className="fu" style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 500, color: "#fff", textAlign: "center", marginBottom: 36 }}>
            Everything to run a school. In one box.
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:14 }}>
            {[
              { i:"📚", t:"Curriculum Builder", d:"AI-generated curricula for any age, any subject. Day-by-day Mon–Fri schedules." },
              { i:"🤖", t:"19 AI Tutors",        d:"Subject-specific tutors using Socratic method. Adapt to each child's grade." },
              { i:"🔬", t:"38 Interactive Tools",d:"PhET, GeoGebra, Desmos, Khan Academy, Scratch — embedded directly." },
              { i:"📈", t:"Student Trajectories",d:"Renaissance-style growth tracking. Percentile, grade equiv, exam readiness." },
              { i:"💌", t:"Parent Comms",        d:"Personalized weekly updates. NPS surveys. Google Drive photos in newsletters." },
              { i:"🎯", t:"Live Insights",       d:"Real-time growth opportunities when a student needs support. Cross-subject memory across activities." },
            ].map((f,i) => (
              <div key={i} className={`fu d${i+1}`} style={{ background:"rgba(255,255,255,.07)", borderRadius:13, padding:"20px 18px" }}>
                <div style={{ fontSize:26, marginBottom:8 }}>{f.i}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, color:"#fff", marginBottom:6 }}>{f.t}</div>
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.68)", lineHeight:1.65 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE TRACKS */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "70px 24px 70px" }}>
        <h2 className="fu" style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 500, textAlign: "center", marginBottom: 30 }}>Three paths into neoschool.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {tracks.map((t, i) => (
            <div key={t.id} className={`card fu d${i + 1}`}
              style={{ cursor: "pointer", padding: "28px 24px", transition: "transform .2s,box-shadow .2s", transform: hoveredCard === t.id ? "translateY(-6px)" : "", boxShadow: hoveredCard === t.id ? "0 16px 40px rgba(0,0,0,.12)" : "" }}
              onMouseEnter={() => setHoveredCard(t.id)} onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onStart(t.id)}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{t.icon}</div>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, marginBottom: 9, color: t.color }}>{t.headline}</h3>
              <p style={{ fontSize: 13, color: "var(--mu)", lineHeight: 1.65, marginBottom: 18 }}>{t.sub}</p>
              <button className="btn bn sm" style={{ background: t.color }}>{t.cta} →</button>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "10px 32px 70px", textAlign: "center" }}>
        <h2 className="fu" style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 500, marginBottom: 16 }}>Ready to launch?</h2>
        <p className="fu d1 mu" style={{ fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>Whether you're a parent looking for a campus, a Guide wanting to facilitate, or a founder ready to open one — the platform's ready.</p>
        <div className="fu d2" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap:"wrap" }}>
          <button className="btn bo" style={{ fontSize: 15, padding: "14px 28px" }} onClick={() => onStart("parent")}>Get started →</button>
        </div>
        <p style={{ fontSize: 12, color: "var(--mu)", marginTop: 18 }}>Questions? <strong>admissions@neoschool.me</strong> · neoschool.me</p>
      </section>

      {showInterestForm && <CampusInterestForm onClose={() => setShowInterestForm(false)} />}
    </div>
  );
}

// ── CAMPUS INTEREST FORM ─────────────────────────────────────────────────────
// For people who want to launch a neoschool campus in their community
function CampusInterestForm({ onClose }) {
  const [form, setForm] = useState({
    name:"", email:"", phone:"", city:"", state:"",
    role:"", grades:"", timing:"",
    background:"", motivation:"",
  });
  const [submitted, setSubmitted] = useState(false);
  const up = (k,v) => setForm(f => ({...f,[k]:v}));
  const canSubmit = form.name && form.email && form.city && form.role && form.motivation;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.5)", backdropFilter:"blur(4px)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"var(--cr)", borderRadius:18, maxWidth:520, width:"100%",
        maxHeight:"92vh", overflowY:"auto", padding:"26px 26px 22px",
      }}>
        {submitted ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
            <h2 className="h2" style={{ marginBottom:8 }}>Thanks, {form.name.split(" ")[0]}!</h2>
            <p className="mu" style={{ fontSize:13, lineHeight:1.65, marginBottom:18 }}>
              We'll review your interest in launching a campus in {form.city || "your community"} and reach out within 5 business days. Founders in our network typically open within 6–12 months of first contact.
            </p>
            <button className="btn bo" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <button onClick={onClose} style={{
              position:"absolute", top:18, right:22, background:"none", border:"none",
              fontSize:22, color:"var(--mu)", cursor:"pointer",
            }}>×</button>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:6 }}>Launch a campus</p>
            <h2 className="h2" style={{ marginBottom:6 }}>Bring neoschool to your community.</h2>
            <p className="mu" style={{ fontSize:13, lineHeight:1.6, marginBottom:18 }}>
              Tell us about you. We'll set up a 30-min call to discuss what it takes to open a campus where you live.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="fg"><label className="lbl">Your name *</label><input className="inp" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">Email *</label><input className="inp" type="email" value={form.email} onChange={e=>up("email",e.target.value)}/></div>
                <div className="fg"><label className="lbl">Phone</label><input className="inp" placeholder="optional" value={form.phone} onChange={e=>up("phone",e.target.value)}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">City *</label><input className="inp" placeholder="e.g. Seattle" value={form.city} onChange={e=>up("city",e.target.value)}/></div>
                <div className="fg"><label className="lbl">State / Region</label><input className="inp" value={form.state} onChange={e=>up("state",e.target.value)}/></div>
              </div>
              <div className="fg">
                <label className="lbl">I am a... *</label>
                <select className="sel inp" value={form.role} onChange={e=>up("role",e.target.value)}>
                  <option value="">Select</option>
                  {["Parent who wants a school for my kids","Teacher / educator","Microschool founder","Entrepreneur","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div className="fg">
                  <label className="lbl">Grades I'd like to serve</label>
                  <select className="sel inp" value={form.grades} onChange={e=>up("grades",e.target.value)}>
                    <option value="">Select</option>
                    {["K + 1st only","K through 2nd","K through 5th","K through 8th","Not sure yet"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="lbl">Target opening</label>
                  <select className="sel inp" value={form.timing} onChange={e=>up("timing",e.target.value)}>
                    <option value="">Select</option>
                    {["Sept 2026","Jan 2027","Sept 2027","Later / exploring"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg">
                <label className="lbl">Why this matters to you *</label>
                <textarea className="ta inp" rows={3} placeholder="What's driving you to open a school in your community?" value={form.motivation} onChange={e=>up("motivation",e.target.value)}/>
              </div>
              <div className="fg">
                <label className="lbl">Relevant background</label>
                <textarea className="ta inp" rows={2} placeholder="Teaching, business, parenting experience, community ties, etc." value={form.background} onChange={e=>up("background",e.target.value)}/>
              </div>
              <button className="btn bo fw" onClick={() => setSubmitted(true)} disabled={!canSubmit}>
                Submit interest →
              </button>
              <p style={{ fontSize:11, color:"var(--mu)", textAlign:"center", marginTop:4 }}>
                Confirmation goes to <strong>{form.email || "your email"}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function Auth({ role, onAuth }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const roleLabels = { parent:"Parent", guide:"Guide / Facilitator", director:"Campus Director", student:"Student", admin:"Admin" };
  const demoAccounts = {
    parent: { name: "Sarah Chen", email: "sarah@example.com" },
    guide: { name: "Coach Rivera", email: "guide@neoschool.me" },
    director: { name: "Dr. Sandra Reyes", email: "director@neoschool.me" },
    student: { name: "Ava Chen", email: "ava@neo" },
    admin: { name: "Andrew (CEO)", email: "andrew@neoschool.me" },
  };

  const submit = () => {
    const user = mode === "demo" ? demoAccounts[role] : { name: form.name, email: form.email };
    const stored = JSON.parse(localStorage.getItem("neo_users") || "{}");
    if (mode === "signup") stored[form.email] = { ...user, role, password: form.password };
    localStorage.setItem("neo_users", JSON.stringify(stored));
    const fullUser = { ...user, role, id: user.email };
    localStorage.setItem("neo_current", JSON.stringify(fullUser));
    getCredits(fullUser.id); // initialise 30 free credits for new user
    onAuth(fullUser);
  };

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 380, width: "100%" }}>
        <div className="fu" style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo sz={18} />
          <h1 className="h1" style={{ marginTop: 20, marginBottom: 6 }}>
            {mode === "demo" ? "Demo login" : mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mu" style={{ fontSize: 13 }}>
            {roleLabels[role]} portal
          </p>
        </div>
        <div className="card fu d1">
          <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "var(--p)", padding: 4, borderRadius: 12 }}>
            {[["demo", "Demo"], ["signin", "Sign in"], ["signup", "Sign up"]].map(([m, l]) => (
              <div key={m} onClick={() => setMode(m)} style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: mode === m ? "#fff" : "transparent", color: mode === m ? "var(--nv)" : "var(--mu)", transition: "all .2s" }}>{l}</div>
            ))}
          </div>
          {mode === "demo" ? (
            <div>
              <div style={{ background: "var(--p)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--mu)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Demo account</div>
                <div style={{ fontWeight: 600 }}>{demoAccounts[role]?.name}</div>
                <div style={{ fontSize: 12, color: "var(--mu)" }}>{demoAccounts[role]?.email}</div>
              </div>
              <button className="btn bo fw" onClick={submit}>Enter as demo user →</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && <div className="fg"><label className="lbl">Full name</label><input className="inp" placeholder="Sarah Chen" value={form.name} onChange={e => up("name", e.target.value)} /></div>}
              <div className="fg"><label className="lbl">Email</label><input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e => up("email", e.target.value)} /></div>
              <div className="fg"><label className="lbl">Password</label><input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e => up("password", e.target.value)} /></div>
              <button className="btn bn fw" onClick={submit} disabled={!form.email || !form.password}>{mode === "signup" ? "Create account →" : "Sign in →"}</button>
            </div>
          )}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--mu)", marginTop: 14 }}>🔒 COPPA & FERPA compliant</p>
      </div>
    </div>
  );
}

// ── PARENT ONBOARDING ─────────────────────────────────────────────────────────
function ParentOnboarding({ user, onDone }) {
  // Restore previous session if it exists
  const savedSession = (() => {
    try { return JSON.parse(localStorage.getItem("neo_onboard_session") || "null"); }
    catch { return null; }
  })();

  const [step, setStep] = useState(savedSession?.curriculum ? 4 : 1);
  const [form, setForm] = useState(savedSession?.form || { childName: "", grade: "", city: "", situation: "", goals: [], concerns: "", schoolType: "campus" });
  const [curriculum, setCurriculum] = useState(savedSession?.curriculum || null);
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const ref = useRef();
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = (key, val) => setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));
  const scroll = () => setTimeout(() => ref.current?.scrollTo({ top: 0, behavior: "smooth" }), 60);

  // Auto-save form + curriculum whenever they change
  useEffect(() => {
    if (form.childName || curriculum) {
      localStorage.setItem("neo_onboard_session", JSON.stringify({ form, curriculum, step }));
    }
  }, [form, curriculum, step]);

  const next = async () => {
    if (step === 3) {
      setStep(4); setLoading(true);
      try { const c = await genCurriculum(form); setCurriculum(c); } catch { setCurriculum({ error: true }); }
      setLoading(false);
    } else { setStep(s => s + 1); scroll(); }
  };

  const reset = () => {
    if (confirm("Start over? This will clear the current curriculum.")) {
      localStorage.removeItem("neo_onboard_session");
      setForm({ childName: "", grade: "", city: "", situation: "", goals: [], concerns: "", schoolType: "campus" });
      setCurriculum(null);
      setStep(1);
    }
  };

  const StBar = ({ s }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 22 }}>
      {[1, 2, 3, 4].map((n, i) => {
        const st = n < s ? "done" : n === s ? "act" : "pend";
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: st === "done" ? "var(--or)" : st === "act" ? "var(--nv)" : "var(--p)", color: st === "pend" ? "var(--mu)" : "#fff", fontSize: 11, fontWeight: 600, transition: "all .3s" }}>
              {st === "done" ? "✓" : n}
            </div>
            {i < 3 && <div style={{ width: 16, height: 2, borderRadius: 99, background: n < s ? "var(--or)" : "var(--p2)" }} />}
          </div>
        );
      })}
      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--mu)", fontWeight: 500 }}>{["Child", "Family", "Goals", "Curriculum"][s - 1]}</span>
    </div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 16px 48px" }} ref={ref}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <Logo sz={14} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--mu)", padding: "3px 9px", background: "var(--p)", borderRadius: 99, textTransform: "uppercase", letterSpacing: ".05em" }}>California</span>
        </div>
        <div className="card">
          <StBar s={step} />
          {step === 1 && (
            <div>
              <h1 className="h1 fu" style={{ marginBottom: 6 }}>Tell us about<br /><em style={{ color: "var(--or)" }}>your child</em></h1>
              <p className="mu fu d1" style={{ fontSize: 13, marginBottom: 20 }}>Personalized curriculum in seconds.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="fg fu d1"><label className="lbl">Child's first name</label><input className="inp" placeholder="Emma" value={form.childName} onChange={e => up("childName", e.target.value)} /></div>
                <div className="fg fu d2"><label className="lbl">Grade</label><select className="sel inp" value={form.grade} onChange={e => up("grade", e.target.value)}><option value="">Select grade</option>{GRADES.map(g => <option key={g}>{g}</option>)}</select></div>
                <div className="fg fu d3"><label className="lbl">City in California</label><select className="sel inp" value={form.city} onChange={e => up("city", e.target.value)}><option value="">Select city</option>{CA_CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="fg fu d4"><label className="lbl">Current school situation</label><select className="sel inp" value={form.situation} onChange={e => up("situation", e.target.value)}><option value="">Select</option>{SITUS.map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="fu d4">
                  <label className="lbl" style={{ marginBottom:8 }}>Learning path</label>
                  <div style={{ display:"flex", gap:8 }}>
                    {[{id:"campus",label:"🏕️ Campus family",sub:"Enrolling at a neoschool"},{id:"homeschool",label:"🏡 Home learning",sub:"Learning at home"}].map(t => (
                      <div key={t.id} onClick={() => up("schoolType",t.id)} style={{ flex:1, cursor:"pointer", padding:"11px 13px", borderRadius:12, border:`2px solid ${form.schoolType===t.id?"var(--or)":"var(--p2)"}`, background:form.schoolType===t.id?"#fff8f0":"#fff", transition:"all .18s" }}>
                        <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{t.label}</div>
                        <div style={{ fontSize:11, color:"var(--mu)" }}>{t.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn bn fw fu d5" onClick={next} disabled={!form.childName || !form.grade || !form.city || !form.situation}>Continue →</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h1 className="h1 fu" style={{ marginBottom: 6 }}>About <em style={{ color: "var(--or)" }}>you</em></h1>
              <p className="mu fu d1" style={{ fontSize: 13, marginBottom: 20 }}>Hi {user?.name?.split(" ")[0]}! Confirm your details.</p>
              <div style={{ background: "var(--p)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: "var(--mu)" }}>{user?.email}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="fg fu d1"><label className="lbl">Desired enrollment</label><select className="sel inp" defaultValue="2026-2027"><option>2026–2027</option><option>2027–2028</option></select></div>
                <div className="fg fu d2"><label className="lbl">How did you hear about us?</label><select className="sel inp"><option value="">Select</option><option>Instagram / Social</option><option>Friend referral</option><option>Google search</option><option>Podcast</option><option>Local community</option></select></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="fu d3">
                  <button className="btn bn fw" onClick={next}>Continue →</button>
                  <button className="btn bg fw" onClick={() => setStep(1)}>← Back</button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h1 className="h1 fu" style={{ marginBottom: 6 }}>What matters <em style={{ color: "var(--or)" }}>most?</em></h1>
              <p className="mu fu d1" style={{ fontSize: 13, marginBottom: 20 }}>Shapes {form.childName}'s curriculum.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="fu d1"><label className="lbl" style={{ marginBottom: 8 }}>Learning goals</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{GOALS.map(g => <div key={g} className={`pill${form.goals.includes(g) ? " on" : ""}`} onClick={() => tog("goals", g)}>{g}</div>)}</div>
                </div>
                <div className="fg fu d2"><label className="lbl">Biggest concern about traditional school?</label><textarea className="ta inp" rows={2} placeholder="Not enough individualization..." value={form.concerns} onChange={e => up("concerns", e.target.value)} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="fu d3">
                  <button className="btn bo fw" onClick={next} disabled={form.goals.length === 0}>✦ Build my curriculum</button>
                  <button className="btn bg fw" onClick={() => setStep(2)}>← Back</button>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              {loading && (
                <div className="fi" style={{ textAlign: "center", padding: "28px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--nv)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Spn /></div>
                  <h2 className="h2" style={{ marginBottom: 6 }}>Building {form.childName}'s plan…</h2>
                  <p className="mu" style={{ fontSize: 12 }}>{form.grade} · {form.city} CA standards</p>
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>{[85, 70, 80, 60].map((w, i) => <div key={i} className="sh" style={{ height: 48, width: `${w}%`, margin: "0 auto" }} />)}</div>
                </div>
              )}
              {curriculum && !loading && !curriculum.error && (
                <div className="fi">
                  <div style={{ background: "var(--nv)", borderRadius: 16, padding: "18px 20px", marginBottom: 16, textAlign: "center" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>✦ {form.childName}'s plan</p>
                    <p style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 16, color: "rgba(255,255,255,.95)", lineHeight: 1.4 }}>"{curriculum.tagline}"</p>
                  </div>
                  <p className="lbl" style={{ marginBottom: 10 }}>Weekly schedule</p>
                  {[{ icon: "🌅", lbl: "MORNING · 2-HOUR BLOCK", c: "var(--or)", txt: curriculum.morning }, { icon: "🌤️", lbl: "AFTERNOON", c: "var(--sg)", txt: curriculum.afternoon }].map((s, i) => (
                    <div key={i} style={{ background: "var(--p)", borderRadius: 12, padding: 13, marginBottom: 9 }}>
                      <div style={{ display: "flex", gap: 8 }}><span style={{ fontSize: 16 }}>{s.icon}</span><div><p style={{ fontSize: 10, fontWeight: 700, color: s.c, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{s.lbl}</p><p style={{ fontSize: 12.5, lineHeight: 1.6 }}>{s.txt}</p></div></div>
                    </div>
                  ))}
                  <p className="lbl" style={{ marginBottom: 10 }}>Subject plan <span style={{ fontWeight:400, color:"var(--mu)", fontSize:10 }}>(tap a tool to preview)</span></p>
                  {curriculum.subjects?.map((s, i) => (
                    <div key={i} style={{ background: "var(--p)", borderRadius: 11, padding: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{s.emoji}</span><span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                        <button
                          onClick={() => setActiveTool(resolveTool(s.tool))}
                          style={{ fontSize: 10, background: "var(--nv)", color: "#fff", padding: "3px 9px", borderRadius: 99, fontWeight: 600, border: "none", cursor: "pointer", display:"inline-flex", alignItems:"center", gap:4 }}>
                          {s.tool} →
                        </button>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--or)" }}>{s.mins}m/wk</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.5, marginBottom: 6 }}>{s.focus}</p>
                      <PBar v={(s.mins / 90) * 100} />
                    </div>
                  ))}

                  {/* WORKSHOPS — life skills */}
                  {curriculum.workshops?.length > 0 && (
                    <div style={{ marginTop: 14, marginBottom: 8 }}>
                      <p className="lbl" style={{ marginBottom: 8 }}>🛠️ Life skills workshops</p>
                      <p style={{ fontSize: 11, color: "var(--mu)", marginBottom: 10 }}>The skills traditional school skips.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
                        {curriculum.workshops.map((w, i) => (
                          <div key={i} style={{ background: "#dff2ea", borderRadius: 10, padding: "9px 11px", borderLeft: "2px solid var(--sg)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                              <span style={{ fontSize: 15 }}>{w.emoji}</span>
                              <span style={{ fontSize: 12, fontWeight: 700 }}>{w.name}</span>
                              <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--sg)", fontWeight: 600 }}>{w.cadence}</span>
                            </div>
                            <p style={{ fontSize: 10.5, color: "var(--mu)", lineHeight: 1.45 }}>{w.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* UNIQUE GENIUS — highlights child's strength */}
                  {curriculum.uniqueGenius && (
                    <div style={{ background: "linear-gradient(135deg, #fff8f0 0%, #fff 100%)", borderRadius: 13, padding: "14px 16px", margin: "14px 0", borderLeft: "3px solid var(--or)" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--or)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>✨ {form.childName}'s unique genius</p>
                      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 16, lineHeight: 1.45, marginBottom: 4 }}>{curriculum.uniqueGenius.title}</p>
                      <p style={{ fontSize: 12, color: "var(--mu)", lineHeight: 1.6 }}>{curriculum.uniqueGenius.description}</p>
                    </div>
                  )}

                  {/* STUDENT PERSONA — for review/QA */}
                  {curriculum.persona && (
                    <details style={{ background: "var(--p)", borderRadius: 11, padding: "10px 14px", margin: "10px 0" }}>
                      <summary style={{ cursor: "pointer", fontSize: 11, fontWeight: 700, color: "var(--mu)", textTransform:"uppercase", letterSpacing:".06em" }}>🔍 How we understand {form.childName} (persona)</summary>
                      <div style={{ marginTop: 10, fontSize: 12, color: "var(--mu)", lineHeight: 1.6 }}>
                        {Object.entries(curriculum.persona).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 6 }}>
                            <strong style={{ color:"var(--tx)" }}>{k.replace(/([A-Z])/g, " $1").replace(/^./, x => x.toUpperCase())}:</strong> {v}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  <div style={{ background: "var(--nv)", borderRadius: 13, padding: "14px 16px", margin: "12px 0" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Coach note</p>
                    <p style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,.9)", lineHeight: 1.65 }}>"{curriculum.coachNote}"</p>
                  </div>

                  {/* AUTO-SAVED indicator */}
                  <p style={{ textAlign:"center", fontSize: 10.5, color: "var(--sg)", marginBottom: 10 }}>
                    💾 Saved automatically · You can come back anytime
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn bo fw" onClick={() => onDone({ form, curriculum, apply: true })}>Apply to neoschool →</button>
                    <button className="btn bg fw" onClick={() => onDone({ form, curriculum, apply: false })}>Explore the platform →</button>
                    <button onClick={reset} style={{ background:"none", border:"none", color:"var(--mu)", fontSize: 11, textDecoration: "underline", cursor:"pointer", marginTop: 2 }}>↻ Start over with a different child</button>
                  </div>
                </div>
              )}
              {curriculum?.error && <div style={{ textAlign: "center", padding: "24px", color: "var(--rd)" }}>Error. <button className="btn bg sm" onClick={() => { setCurriculum(null); setLoading(false); setStep(3); }}>Try again</button></div>}
            </div>
          )}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--mu)", marginTop: 14 }}>🔒 COPPA & FERPA compliant · California only</p>
      </div>
      {activeTool && <SimViewer tool={activeTool} onClose={() => setActiveTool(null)}/>}
    </div>
  );
}

// ── PARENT DASHBOARD ──────────────────────────────────────────────────────────
function ParentDashboard({ user, data }) {
  const [pulseScore, setPulseScore]  = useState(null);
  const [pulseWin, setPulseWin]      = useState("");
  const [pulseChallenge, setPulseChallenge] = useState("");
  const [pulseFocus, setPulseFocus]  = useState("");
  const [checkedIn, setCheckedIn]    = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [tab, setTab]                = useState("home");
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTool, setActiveTool]  = useState(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const { form, curriculum } = data || {};

  const childName  = form?.childName  || localStorage.getItem("neo_child_name") || "your child";
  const childCity  = form?.city       || "California";
  const schoolType = form?.schoolType || localStorage.getItem("neo_school_type") || "campus";
  const isHomeschool = schoolType === "homeschool";

  if (form?.childName) {
    localStorage.setItem("neo_child_name", form.childName);
    localStorage.setItem("neo_school_type", schoolType);
    if (form?.grade) localStorage.setItem("neo_child_grade", form.grade);
  }

  const isFriday = new Date().getDay() === 5;

  // Career explorer — based on curriculum subjects
  const subjectNames = curriculum?.subjects?.map(s => s.name.toLowerCase()) || [];
  const careerMap = {
    math:     ["Software Engineer","Data Scientist","Architect","Actuary","Aerospace Engineer"],
    reading:  ["Journalist","Lawyer","Author","Teacher","Editor"],
    writing:  ["Author","Content Director","Journalist","Screenwriter","Copywriter"],
    science:  ["Research Scientist","Doctor","Environmental Engineer","Astronaut","Chemist"],
    coding:   ["Software Engineer","AI Researcher","Game Designer","CTO","Product Manager"],
    arts:     ["Graphic Designer","Art Director","Film Maker","UX Designer","Architect"],
    music:    ["Musician","Sound Engineer","Music Producer","Composer","Music Teacher"],
    spanish:  ["Diplomat","International Business","Translator","Global Journalist"],
    history:  ["Historian","Policy Advisor","Journalist","Lawyer","Museum Curator"],
    nature:   ["Environmental Scientist","Marine Biologist","Park Ranger","Conservationist"],
  };
  const careers = [...new Set(
    subjectNames.flatMap(s => {
      const key = Object.keys(careerMap).find(k => s.includes(k));
      return key ? careerMap[key].slice(0,2) : [];
    })
  )].slice(0, 6);

  // TRICK question suggestions (Esther Wojcicki method)
  const trickQuestions = [
    { emoji:"✨", q:"What stood out most to you today?" },
    { emoji:"😊", q:"When did you feel most happy during learning?" },
    { emoji:"🤔", q:"What's something you figured out by yourself?" },
    { emoji:"💪", q:"What felt hard — and how did you handle it?" },
    { emoji:"🌟", q:"What would you love to learn tomorrow?" },
    { emoji:"🎯", q:"What's one thing you'd explain to a friend?" },
    { emoji:"❓", q:"What question are you still wondering about?" },
    { emoji:"🏆", q:"What are you most proud of this week?" },
  ];
  const todayQuestions = trickQuestions.slice(
    new Date().getDay() * 2 % trickQuestions.length,
    new Date().getDay() * 2 % trickQuestions.length + 2
  );

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"22px 16px 48px" }}>
      {showPayModal && <PaymentModal userId={user.id} onClose={() => setShowPayModal(false)}/>}
      <div style={{ maxWidth:440, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <Logo sz={14}/>
          <CreditsWidget userId={user.id} onBuyMore={() => setShowPayModal(true)}/>
        </div>
        <div className="fu" style={{ marginBottom:22, paddingBottom:18, borderBottom:"1px solid var(--p2)" }}>
          <p className="eyebrow" style={{ marginBottom:6 }}>Welcome back</p>
          <h2 className="h2" style={{ fontSize:28, fontWeight:400, lineHeight:1.1, marginBottom:8 }}>Hi {user?.name?.split(" ")[0]}.</h2>
          <p style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:16, color:"var(--or)", fontWeight:400 }}>{childName}'s learning dashboard</p>
          <p className="mu" style={{ fontFamily:"'Geist Mono',monospace", fontSize:10.5, marginTop:6, letterSpacing:".05em" }}>{childCity?.toUpperCase()}, CA · {isHomeschool ? "HOME LEARNING" : "NEOSCHOOL CAMPUS"}</p>
        </div>

        {/* Tabs — refined editorial pill bar */}
        <div style={{ display:"flex", background:"var(--p)", padding:"4px", marginBottom:18, borderRadius:99, border:"1px solid var(--p2)" }}>
          {[{id:"home",l:"Home"},{id:"coaching",l:"Parent Coaching"},{id:"future",l:"Future Explorer"}].map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, textAlign:"center", padding:"8px 4px", borderRadius:99, cursor:"pointer", fontFamily:"'Fraunces',serif", fontSize:12.5, fontWeight:500, background:tab===t.id?"#fff":"transparent", color:tab===t.id?"var(--nv)":"var(--mu)", transition:"all .2s", letterSpacing:"-.005em", boxShadow: tab===t.id ? "var(--shadow-sm)" : "none" }}>{t.l}</div>
          ))}
        </div>

        {/* ── HOME TAB ── */}
        {tab === "home" && <>

          {/* Hero: tagline / today's focus — refined */}
          {curriculum?.tagline && (
            <div className="fu" style={{ marginBottom:18, padding:"22px 22px 20px", background:"#fff", border:"1px solid var(--p2)", borderRadius:14, position:"relative", overflow:"hidden", boxShadow:"var(--shadow-sm)" }}>
              <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:"var(--or)" }}/>
              <p className="eyebrow" style={{ marginBottom:10 }}>Today's focus for {childName}</p>
              <p className="quote-bar" style={{ fontSize:19, marginBottom:18, padding:"2px 0 2px 18px", borderLeft:"2px solid var(--or)", fontWeight:400 }}>{curriculum.tagline}</p>
              <button
                className="btn bo fw"
                onClick={() => {
                  setShowSubjects(true);
                  setTimeout(() => {
                    document.getElementById("subjects-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
                style={{ fontSize:14, padding:"13px" }}>
                See {childName}'s activities →
              </button>
            </div>
          )}

          {/* Weekly check-in — compact when not Friday, expanded on Friday */}
          {(isFriday || !checkedIn) && (
            <div className="card fu" style={{ marginBottom:14, borderLeft:"3px solid var(--sg)" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--sg)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>
                Weekly check-in {isFriday ? "· It's Friday! 🎉" : ""}
              </p>
              {!checkedIn ? <>
                <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>How was {childName}'s week?</p>
                <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                  {[{n:1,e:"😔",l:"Tough"},{n:2,e:"😕",l:"Meh"},{n:3,e:"😐",l:"Okay"},{n:4,e:"😊",l:"Good"},{n:5,e:"🌟",l:"Amazing!"}].map(({n,e,l}) => (
                    <div key={n} onClick={() => setPulseScore(n)} style={{ flex:1, textAlign:"center", padding:"9px 4px", borderRadius:10, cursor:"pointer", background:pulseScore===n?"var(--nv)":"var(--p)", transition:"all .2s" }}>
                      <div style={{ fontSize:18 }}>{e}</div>
                      <div style={{ fontSize:9, fontWeight:600, color:pulseScore===n?"#fff":"var(--mu)", marginTop:3 }}>{l}</div>
                    </div>
                  ))}
                </div>
                {pulseScore && <>
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    <div className="fg"><label className="lbl">🏆 Biggest win this week</label><input className="inp" style={{ fontSize:12 }} placeholder="e.g. Finished the fractions activity!" value={pulseWin} onChange={e => setPulseWin(e.target.value)}/></div>
                    <div className="fg"><label className="lbl">💪 A challenging moment</label><input className="inp" style={{ fontSize:12 }} placeholder="e.g. Got frustrated with long division" value={pulseChallenge} onChange={e => setPulseChallenge(e.target.value)}/></div>
                    <div className="fg"><label className="lbl">🎯 Focus for next week</label><input className="inp" style={{ fontSize:12 }} placeholder="e.g. More reading, less screen time" value={pulseFocus} onChange={e => setPulseFocus(e.target.value)}/></div>
                    <button className="btn bo fw" onClick={() => setCheckedIn(true)} disabled={!pulseWin}>Save check-in ✓</button>
                  </div>
                </>}
              </> : (
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--sg)", marginBottom:6 }}>✓ This week's check-in saved!</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {[["🏆",pulseWin],["💪",pulseChallenge],["🎯",pulseFocus]].filter(([,v])=>v).map(([e,v],i) => <p key={i} style={{ fontSize:12, color:"var(--mu)" }}>{e} {v}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible: "An enriching school day" timeline */}
          <div style={{ marginBottom:10 }}>
            <button onClick={() => setShowSchedule(s => !s)} style={{ width:"100%", background:"#fff", border:"1px solid var(--p2)", borderRadius:11, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", textAlign:"left" }}>
              <span style={{ fontSize:18 }}>📅</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600 }}>An enriching school day</p>
                <p style={{ fontSize:11, color:"var(--mu)" }}>4 daily blocks · 8:30 AM – 3:30 PM</p>
              </div>
              <span style={{ fontSize:14, color:"var(--mu)" }}>{showSchedule ? "↑" : "↓"}</span>
            </button>
            {showSchedule && (
              <div className="card fu" style={{ marginTop:7 }}>
                {[
                  { time:"8:30–9:00 AM",  block:"Outside Free Play",        sub:"Movement, fresh air, social warm-up",                                                                                          i:"🌳", c:"var(--sg)" },
                  { time:"9:00–11:00 AM", block:"Core Academic Block",      sub:"2 hours personalized math, reading, writing, science. AI tutors adapt in real time. Brain breaks between subjects.", i:"🧠", c:"var(--or)" },
                  { time:"11:00–12:30",   block:"Outside Free Play & Lunch", sub:"Recess + meal · social time · decompression",                                                                                  i:"🍎", c:"var(--am)" },
                  { time:"12:30–3:30 PM", block:"Real Projects & Life Skills",sub:"Hands-on workshops · creative expression · what AI can never replace",                                                       i:"🎨", c:"var(--bl)" },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex", gap:11, padding:"9px 0", borderBottom:i<3?"1px solid var(--p)":"none" }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:`${r.c}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{r.i}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                        <span style={{ fontSize:13, fontWeight:600 }}>{r.block}</span>
                        <span style={{ fontSize:10, color:r.c, fontWeight:700 }}>{r.time}</span>
                      </div>
                      <p style={{ fontSize:11.5, color:"var(--mu)", lineHeight:1.5 }}>{r.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible: Subject progress */}
          {curriculum?.subjects && (
            <div id="subjects-panel" style={{ marginBottom:10, scrollMarginTop:80 }}>
              <button onClick={() => setShowSubjects(s => !s)} style={{ width:"100%", background:"#fff", border:"1px solid var(--p2)", borderRadius:11, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:18 }}>📊</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600 }}>Weekly subjects & progress</p>
                  <p style={{ fontSize:11, color:"var(--mu)" }}>{curriculum.subjects.length} subjects · this week · tap to expand</p>
                </div>
                <span style={{ fontSize:14, color:"var(--mu)" }}>{showSubjects ? "↑" : "↓"}</span>
              </button>
              {showSubjects && (
                <div className="card fu" style={{ marginTop:7 }}>
                  <p style={{ fontSize:11, color:"var(--mu)", marginBottom:9 }}>Tap a tool to preview the simulation/activity 👇</p>
                  {curriculum.subjects.map((s, i) => {
                    const completed = Math.min(85 + (i*3) % 18, 100);
                    return (
                      <div key={i} style={{ marginBottom:11 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6, marginBottom:4 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, flex:1 }}>
                            <span style={{ fontSize:14 }}>{s.emoji}</span>
                            <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                            {s.tool && (
                              <button onClick={() => setActiveTool(resolveTool(s.tool))}
                                style={{ fontSize:10, background:"var(--nv)", color:"#fff", padding:"3px 9px", borderRadius:99, border:"none", cursor:"pointer", fontWeight:600 }}>
                                ▶ {s.tool}
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:completed>=90?"var(--sg)":"var(--or)" }}>{completed}%</span>
                        </div>
                        <PBar v={completed} c={completed>=90?"var(--sg)":"var(--or)"} h={3}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Next step */}
          <div className="fu d2" style={{ background:"var(--p)", borderRadius:14, padding:"13px 16px", marginBottom:14, display:"flex", gap:10 }}>
            <span style={{ fontSize:18 }}>→</span>
            <div>
              <p style={{ fontSize:11, fontWeight:700, marginBottom:3 }}>Your next step</p>
              <p style={{ fontSize:13, color:"var(--mu)", lineHeight:1.5 }}>
                {isHomeschool
                  ? `Open ${childName}'s activities and start the first learning session together.`
                  : curriculum?.nextStep || `Schedule a 15-minute intro call with ${childName}'s Guide.`}
              </p>
            </div>
          </div>
        </>}

        {tab === "coaching" && <>
          <div style={{ background:"var(--nv)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>POWERED BY TRICK METHOD</p>
            <p style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:14, color:"rgba(255,255,255,.9)", lineHeight:1.5, marginBottom:8 }}>
              "The best thing you can do for your child is ask great questions."
            </p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>
              by Esther Wojcicki — T·R·I·C·K: Trust · Respect · Independence · Collaboration · Kindness
            </p>
          </div>

          <div className="card fu" style={{ marginBottom:14 }}>
            <p className="lbl" style={{ marginBottom:10 }}>💬 Today's conversation starters</p>
            <p style={{ fontSize:12, color:"var(--mu)", marginBottom:12 }}>Instead of "How was your day?" — try these:</p>
            {todayQuestions.map((q, i) => (
              <div key={i} style={{ background:"var(--p)", borderRadius:11, padding:"12px 14px", marginBottom:8, display:"flex", gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{q.emoji}</span>
                <p style={{ fontSize:13, lineHeight:1.5 }}>"{q.q}"</p>
              </div>
            ))}
            <p style={{ fontSize:11, color:"var(--mu)", marginTop:6 }}>Questions rotate daily. Tap any to copy.</p>
          </div>

          <div className="card fu d1" style={{ marginBottom:14 }}>
            <p className="lbl" style={{ marginBottom:10 }}>🔑 The TRICK principles</p>
            {[
              {k:"T",l:"Trust",t:"trust", d:"Trust your child's curiosity. Resist the urge to over-direct."},
              {k:"R",l:"Respect",t:"respect", d:"Every question is valid. Never dismiss curiosity."},
              {k:"I",l:"Independence",t:"independence", d:"Let them struggle a little. That's where growth happens."},
              {k:"C",l:"Collaboration",t:"collaboration", d:"Learn alongside them — 'I wonder too' is a gift."},
              {k:"K",l:"Kindness",t:"kindness", d:"Celebrate effort, not just results."},
            ].map((p, i) => (
              <div key={i} style={{ display:"flex", gap:11, padding:"9px 0", borderBottom:i<4?"1px solid var(--p)":"none" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--or)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>{p.k}</div>
                <div><div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{p.l}</div><p style={{ fontSize:12, color:"var(--mu)", lineHeight:1.5 }}>{p.d}</p></div>
              </div>
            ))}
          </div>
          <a href="https://parentingchildren.com/tips/" target="_blank" rel="noopener noreferrer" className="btn bg fw" style={{ textDecoration:"none", display:"block", textAlign:"center" }}>
            More tips from Esther Wojcicki →
          </a>
        </>}

        {/* ── FUTURE EXPLORER TAB ── */}
        {tab === "future" && <>
          <div style={{ background:"var(--nv)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Future Explorer · Private to you</p>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:14, color:"rgba(255,255,255,.92)", lineHeight:1.5 }}>
              Based on what {childName} is learning and loving, here's what the data suggests about their future.
            </p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.45)", marginTop:6 }}>
              🔒 This data belongs to you. Never shared or sold.
            </p>
          </div>

          {/* Renaissance-style learning trajectory */}
          <LearningTrajectory
            studentName={childName}
            studentGrade={form?.grade || localStorage.getItem("neo_child_grade") || "3rd Grade"}
            mem={null}
          />

          {careers.length > 0 && (
            <div className="card fu" style={{ marginBottom:14 }}>
              <p className="lbl" style={{ marginBottom:10 }}>🔭 Careers that might suit {childName}</p>
              <p style={{ fontSize:12, color:"var(--mu)", marginBottom:12 }}>Based on their strongest subjects and engagement patterns:</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:12 }}>
                {careers.map((c,i) => (
                  <div key={i} style={{ padding:"7px 12px", borderRadius:99, background:`${["#fde8d8","#dff2ea","#ddeeff","#f0e8ff","#fdf3d0","#ffe8f3"][i%6]}`, fontSize:12, fontWeight:600, color:`${["var(--or)","var(--sg)","var(--bl)","var(--pu)","var(--am)","#ff6b9d"][i%6]}` }}>
                    {c}
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11, color:"var(--mu)", lineHeight:1.5 }}>
                These are patterns, not predictions. {childName} has years to discover. This is just a nudge.
              </p>
            </div>
          )}

          <div className="card fu d1" style={{ marginBottom:14 }}>
            <p className="lbl" style={{ marginBottom:10 }}>📊 {childName}'s learning fingerprint</p>
            {curriculum?.subjects?.slice(0,4).map((s, i) => (
              <div key={i} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3, gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flex:1 }}>
                    <span style={{ fontSize:13 }}>{s.emoji}</span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{s.name}</span>
                    {s.tool && (
                      <button onClick={() => setActiveTool(resolveTool(s.tool))}
                        style={{ fontSize:9, background:"var(--bl)", color:"#fff", padding:"2px 7px", borderRadius:99, border:"none", cursor:"pointer", fontWeight:600 }}>
                        ▶ {s.tool}
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize:11, color:"var(--mu)" }}>{s.mins} min/wk</span>
                </div>
                <PBar v={(s.mins/90)*100} c="var(--or)"/>
              </div>
            )) || <p className="mu" style={{ fontSize:12 }}>Generate a curriculum to see {childName}'s learning fingerprint.</p>}
          </div>

          <div style={{ background:"var(--p)", borderRadius:12, padding:"12px 14px" }}>
            <p style={{ fontSize:12, lineHeight:1.65, color:"var(--mu)" }}>
              🧬 As {childName} uses neoschool, we build a private profile of their strengths, curiosity patterns, and learning velocity. Over time, this creates a rich picture only you can see — your child's true potential, not just their grades.
            </p>
          </div>
        </>}
      </div>
      {activeTool && <SimViewer tool={activeTool} onClose={() => setActiveTool(null)}/>}
    </div>
  );
}

// ── LAB PLAYER — per-sim tutor, event tracking, memory, ratings ───────────────
// Helper: convert grade string → number for comparison
function gradeToNum(gradeStr) {
  if (!gradeStr) return 3;
  const s = gradeStr.toLowerCase();
  if (s.includes("pre-k") || s.includes("prek")) return 0;
  if (s.includes("kinder")) return 1;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1]) : 3;
}

// Helper: parse lab grades string → { min, max }
function parseLabGrades(gradesStr) {
  if (!gradesStr) return { min: 0, max: 12 };
  const s = gradesStr.toLowerCase().replace("gr ", "").replace("k", "1");
  const nums = s.match(/\d+/g)?.map(Number) || [0, 12];
  return { min: nums[0], max: nums[nums.length - 1] };
}

function LabPlayer({ lab, userId, onBack }) {
  const [showTutor, setShowTutor] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [events, setEvents] = useState([]);
  const [score, setScore] = useState(null);
  const [ratings, setRatings] = useState({});
  const [showPay, setShowPay] = useState(false);
  const [sessionStart] = useState(Date.now());
  const chatRef = useRef();
  const tutorCfg = getTutorConfig(lab.id);
  const mem = getMemory(userId || "demo");

  // Grade mismatch detection
  const studentGrade = mem.sessions?.[0]?.studentGrade
    || localStorage.getItem("neo_child_grade")
    || "3rd Grade";
  const studentGradeNum = gradeToNum(studentGrade);
  const labGradeRange   = parseLabGrades(lab.grades);
  const isAboveGrade    = studentGradeNum < labGradeRange.min;
  const isBelowGrade    = studentGradeNum > labGradeRange.max;

  useEffect(() => {
    const h = e => {
      const d = e.data; if (!d?.type) return;
      if (d.type === "scoreUpdate") { setScore(d.score); setEvents(p => [...p, { t:"score", v:d.score, time:Date.now()-sessionStart }]); }
      if (d.type === "interaction")   setEvents(p => [...p, { t:"click", action:d.action, time:Date.now()-sessionStart }]);
      if (d.type === "labLoaded")     setEvents(p => [...p, { t:"loaded", time:0 }]);
    };
    window.addEventListener("message", h);
    return () => {
      window.removeEventListener("message", h);
      saveSession(userId || "demo", { lab:lab.id, topic:lab.topic, events, score:score||0, duration:Date.now()-sessionStart, tutorMsgs:msgs.length });
    };
  }, [events, score, msgs]);

  useEffect(() => {
    if (showTutor && msgs.length === 0) {
      const evtSummary = events.length > 0
        ? `${events.filter(e=>e.t==="click").length} interactions, ${Math.round((Date.now()-sessionStart)/1000)}s in${score!==null?`, score:${score}`:""}`
        : "just started";
      setMsgs([{ role:"assistant", content:`Hi! I'm ${tutorCfg.name} ${tutorCfg.avatar}, your ${lab.title} tutor!\n\n${evtSummary!=="just started"?`I can see you've been exploring (${evtSummary}). `:""}What would you like to understand better?` }]);
    }
  }, [showTutor]);

  const send = async () => {
    if (!inp.trim() || typing) return;
    const cr = useCredits(userId || "demo", "tutor_message", COSTS.tutor_message);
    // useCredits delegates to safeUseCredits — never blocks the user
    if (cr.autoToppedUp) console.info('Auto-topped credits for demo');
    const evtCtx = `Session: ${Math.round((Date.now()-sessionStart)/1000)}s. Clicks: ${events.filter(e=>e.t==="click").length}. Score: ${score??"-"}. Recent: ${events.slice(-3).map(e=>e.action||e.t).join(", ")}`;
    const crossCtx = buildCrossContext(mem);

    // Grade-adaptive tutor context
    let gradeCtx = "";
    if (isAboveGrade) {
      gradeCtx = `\n\nGRADE ADAPTATION: This student (${studentGrade}) is working ABOVE their grade level on this ${lab.grades} activity — and doing well! Adapt your language to be more visual and concrete. Use simpler vocabulary, more real-world objects, and celebrate their curiosity. Don't talk down to them — they're clearly capable — but anchor explanations in things they'd know. Praise their above-grade-level engagement specifically.`;
    } else if (isBelowGrade) {
      gradeCtx = `\n\nGRADE ADAPTATION: This student (${studentGrade}) is reviewing material below their grade level. They may need a quick challenge or extension question to stay engaged. Ask them to explain it as if teaching a younger student.`;
    }

    const sys = `${tutorCfg.system}${gradeCtx}\n\nSESSION CONTEXT: ${evtCtx}\nSTUDENT CROSS-SUBJECT MEMORY: ${crossCtx}`;
    const m = { role:"user", content:inp.trim() };
    const all = [...msgs, m];
    setMsgs(all); setInp(""); setTyping(true);
    try {
      const r = await claude(sys, all.map(x => ({ role:x.role, content:x.content })), 180);
      setMsgs(p => [...p, { role:"assistant", content:r, id:Date.now() }]);
    } catch { setMsgs(p => [...p, { role:"assistant", content:"What have you noticed so far in this lab?" }]); }
    setTyping(false);
    setTimeout(() => chatRef.current?.scrollTo({ top:99999, behavior:"smooth" }), 80);
  };

  const rateMsg = (msgId, rating) => {
    setRatings(r => ({ ...r, [msgId]:rating }));
    saveTutorFeedback(userId||"demo", { lab:lab.id, msgId, rating, msg:msgs.find(m=>m.id===msgId)?.content });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {showPay && <PaymentModal userId={userId||"demo"} onClose={()=>setShowPay(false)}/>}
      {/* Header */}
      <div style={{ background:"var(--nv)", padding:"11px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.15)", border:"none", cursor:"pointer", color:"#fff", width:28, height:28, borderRadius:7, fontSize:13 }}>←</button>
        <span style={{ fontSize:18 }}>{lab.emoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{lab.title}</div>
          <div style={{ color:"rgba(255,255,255,.45)", fontSize:10 }}>{lab.grades} · {lab.topic} · {tutorCfg.name}</div>
        </div>
        {isAboveGrade && (
          <div title="This activity is typically for older students — your child is working above grade level!" style={{ background:"linear-gradient(135deg,#c8940e,#e8b820)", borderRadius:99, padding:"3px 10px", display:"flex", alignItems:"center", gap:5, cursor:"default", flexShrink:0 }}>
            <span style={{ fontSize:11 }}>🌟</span>
            <span style={{ fontSize:10, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}>Above grade level</span>
          </div>
        )}
        {score !== null && <div style={{ background:"rgba(255,255,255,.15)", borderRadius:7, padding:"3px 9px", color:"#fff", fontSize:12, fontWeight:700 }}>⚡{score}</div>}
        <CreditsWidget userId={userId||"demo"} onBuyMore={()=>setShowPay(true)}/>
        <button onClick={() => setShowTutor(s => !s)} style={{ background:showTutor?"var(--or)":"rgba(255,255,255,.15)", border:"none", cursor:"pointer", color:"#fff", padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:600 }}>
          {showTutor ? "× Tutor" : `🤖 ${tutorCfg.name}`}
        </button>
      </div>
      {/* Skill tags + grade mismatch parent note */}
      <div style={{ background:"var(--p)", padding:"5px 16px", display:"flex", gap:6, flexShrink:0, flexWrap:"wrap", alignItems:"center" }}>
        {lab.skills.map(s => <span key={s} style={{ fontSize:10, background:"#fff", padding:"2px 7px", borderRadius:99, color:"var(--mu)" }}>{s}</span>)}
        {lab.caPoints?.slice(0,1).map(p => <span key={p} style={{ fontSize:10, background:"var(--nv)", color:"#fff", padding:"2px 6px", borderRadius:99 }}>{p.split(".").slice(-1)[0]}</span>)}
        {isAboveGrade && (
          <span style={{ fontSize:10, color:"var(--am)", fontWeight:600, marginLeft:"auto" }}>
            🌟 Usually {lab.grades} — adapting for younger learner · tutor uses simpler language
          </span>
        )}
      </div>
      {/* Main */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <div style={{ flex:1, position:"relative" }}>
          <iframe src={lab.url || `/labs/${lab.id}.html`} style={{ width:"100%", height:"100%", border:"none" }} title={lab.title} sandbox="allow-scripts allow-same-origin allow-forms"/>
          {events.length === 0 && (
            <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", background:"rgba(10,10,18,.8)", color:"#fff", borderRadius:10, padding:"7px 14px", fontSize:12, backdropFilter:"blur(8px)" }}>
              Loading lab… · Press 🤖 to open AI tutor
            </div>
          )}
        </div>
        {showTutor && (
          <div style={{ width:280, display:"flex", flexDirection:"column", borderLeft:"1px solid var(--p2)", background:"var(--cr)" }}>
            <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--p2)", display:"flex", alignItems:"center", gap:8, flexShrink:0, background:"var(--p)" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--or)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{tutorCfg.avatar}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:12.5 }}>{tutorCfg.name}</div><div style={{ fontSize:10, color:"var(--mu)" }}>{tutorCfg.persona}</div></div>
              <span style={{ fontSize:10, color:"var(--sg)", fontWeight:600 }}>1 cr/msg</span>
            </div>
            {msgs.length <= 1 && (
              <div style={{ padding:"9px 11px", flexShrink:0 }}>
                <p style={{ fontSize:10, color:"var(--mu)", marginBottom:5 }}>Ask me:</p>
                {(tutorCfg.starterPrompts||[]).map((s,i) => <div key={i} onClick={()=>setInp(s)} style={{ fontSize:11, background:"var(--p)", borderRadius:7, padding:"5px 8px", cursor:"pointer", color:"var(--mu)", marginBottom:3 }}>{s}</div>)}
              </div>
            )}
            <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"10px", display:"flex", flexDirection:"column", gap:7 }}>
              {msgs.map((m,i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
                  {m.role==="assistant" && <div style={{ fontSize:10, color:"var(--mu)", marginBottom:2 }}>{tutorCfg.name}</div>}
                  <div className={m.role==="user"?"cb-u":"cb-a"} style={{ fontSize:12, whiteSpace:"pre-wrap" }}>{m.content}</div>
                  {m.role==="assistant" && m.id && (
                    <div style={{ display:"flex", gap:4, marginTop:3 }}>
                      <button onClick={()=>rateMsg(m.id,"good")} style={{ background:ratings[m.id]==="good"?"#dff2ea":"var(--p)", border:"none", borderRadius:5, padding:"2px 6px", fontSize:11, cursor:"pointer" }}>👍</button>
                      <button onClick={()=>rateMsg(m.id,"bad")} style={{ background:ratings[m.id]==="bad"?"#fde8e8":"var(--p)", border:"none", borderRadius:5, padding:"2px 6px", fontSize:11, cursor:"pointer" }}>👎</button>
                    </div>
                  )}
                </div>
              ))}
              {typing && <div className="cb-a" style={{ display:"flex", gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"var(--p2)",animation:`pu 1.2s ${i*.2}s infinite`}}/>)}</div>}
            </div>
            <div style={{ padding:"9px 11px", borderTop:"1px solid var(--p2)", flexShrink:0 }}>
              <div style={{ display:"flex", gap:5 }}>
                <input className="inp" style={{ flex:1, fontSize:12 }} placeholder="Ask anything…" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
                <button className="btn bn xs" onClick={send} disabled={!inp.trim()||typing}>{typing?<Spn/>:"→"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STUDENT PORTAL ────────────────────────────────────────────────────────────
function StudentPortal({ user }) {
  const [activeTab, setActiveTab]   = useState("labs");
  const [activeLab, setActiveLab]   = useState(null);
  const [activeTutor, setActiveTutor] = useState(null);
  const [msgs, setMsgs]             = useState([]);
  const [inp, setInp]               = useState("");
  const [typing, setTyping]         = useState(false);
  const [showPay, setShowPay]       = useState(false);
  const [filter, setFilter]         = useState("All");
  const [activeTool, setActiveTool] = useState(null);
  // Show quick assessment on first visit
  const [assessed, setAssessed] = useState(
    !!localStorage.getItem("neo_child_grade") || !!localStorage.getItem("neo_student_level")
  );
  const [browseAll, setBrowseAll] = useState(false); // expand full activity list when user wants it

  if (!assessed) return <StudentAssessment onDone={({ name, grade }) => {
    if (grade) localStorage.setItem("neo_child_grade", grade);
    if (name)  localStorage.setItem("neo_child_name",  name);
    setAssessed(true);
  }}/>;

  // close viewer on Escape key
  useEffect(() => {
    const h = e => { if (e.key === "Escape") setActiveTool(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const chatRef = useRef();
  const mem = getMemory(user.id);
  const recs = buildRecommendations(mem, LABS);
  const topics = ["All", ...new Set(LABS.map(l => l.topic))];
  const student = DEMO_STUDENTS.find(s => s.name === user?.name) || DEMO_STUDENTS[0];

  const openTutor = (t) => {
    setActiveTutor(t);
    const crossCtx = buildCrossContext(mem);
    setMsgs([{ role:"assistant", content:`Hi! I'm ${t.name} ${t.emoji}\n\n${crossCtx.includes("minutes")?`I know your learning history — `:""}What are you working on today?` }]);
    setActiveTab("chat");
  };
  const send = async () => {
    if (!inp.trim() || typing) return;
    const cr = useCredits(user.id, "tutor_message", COSTS.tutor_message);
    // useCredits delegates to safeUseCredits — never blocks the user
    if (cr.autoToppedUp) console.info('Auto-topped credits for demo');
    const crossCtx = buildCrossContext(mem);
    const m = { role:"user", content:inp.trim() };
    const all = [...msgs, m];
    setMsgs(all); setInp(""); setTyping(true);
    try {
      const r = await claude(activeTutor.system + `\n\nSTUDENT MEMORY: ${crossCtx}`, all.map(x=>({role:x.role,content:x.content})), 180);
      setMsgs(p => [...p, { role:"assistant", content:r }]);
    } catch { setMsgs(p => [...p, { role:"assistant", content:"What have you tried so far?" }]); }
    setTyping(false);
    setTimeout(() => chatRef.current?.scrollTo({ top:99999, behavior:"smooth" }), 80);
  };

  if (activeLab) return <LabPlayer lab={activeLab} userId={user.id} onBack={() => setActiveLab(null)} />;

  if (activeTab === "chat" && activeTutor) return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {showPay && <PaymentModal userId={user.id} onClose={()=>setShowPay(false)}/>}
      <div style={{ background:activeTutor.color, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <button onClick={() => setActiveTab("tutors")} style={{ background:"rgba(255,255,255,.2)", border:"none", cursor:"pointer", color:"#fff", width:28, height:28, borderRadius:7, fontSize:14 }}>←</button>
        <div style={{ width:32, height:32, borderRadius:9, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{activeTutor.emoji}</div>
        <div style={{ flex:1 }}><div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{activeTutor.name} · {activeTutor.label}</div><div style={{ color:"rgba(255,255,255,.6)", fontSize:10 }}>{activeTutor.tool} · 1 credit/msg</div></div>
        <CreditsWidget userId={user.id} onBuyMore={()=>setShowPay(true)}/>
      </div>
      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:9 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="assistant" && <div style={{ fontSize:10, color:"var(--mu)", marginBottom:2 }}>{activeTutor.name}</div>}
            <div className={m.role==="user"?"cb-u":"cb-a"} style={{ whiteSpace:"pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {typing && <div className="cb-a" style={{ display:"flex", gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"var(--p2)",animation:`pu 1.2s ${i*.2}s infinite`}}/>)}</div>}
      </div>
      <div style={{ padding:"11px 14px", background:"rgba(255,255,255,.85)", backdropFilter:"blur(10px)", borderTop:"1px solid var(--p2)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input className="inp" style={{ flex:1 }} placeholder="Ask anything…" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
          <button className="btn bn" onClick={send} disabled={!inp.trim()||typing}>{typing?<Spn/>:"Send"}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {showPay && <PaymentModal userId={user.id} onClose={()=>setShowPay(false)}/>}
      <div style={{ background:"var(--nv)", padding:"11px 14px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <div className="av" style={{ background:student.color, width:30,height:30,fontSize:10 }}>{student.init}</div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:600, fontSize:13.5 }}>Hi, {user?.name?.split(" ")[0]}! 👋</div>
          <div style={{ color:"rgba(255,255,255,.5)", fontSize:10 }}>{mem.streak>0?`${mem.streak}🔥 streak · `:""}velocity: {mem.learningVelocity}</div>
        </div>
        <CreditsWidget userId={user.id} onBuyMore={()=>setShowPay(true)}/>
      </div>
      {activeTool && <SimViewer tool={activeTool} onClose={() => setActiveTool(null)} />}
      <div style={{ display:"flex", background:"var(--p)", padding:"4px", margin:"10px 11px 0", borderRadius:11, flexShrink:0 }}>
        {[{id:"labs",l:"🎮 Activities"},{id:"tools",l:"🛠 Tools & Sims"},{id:"tutors",l:"🤖 Tutors"},{id:"memory",l:"🧠 Memory"}].map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex:1, textAlign:"center", padding:"7px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:11, background:activeTab===t.id?"#fff":"transparent", color:activeTab===t.id?"var(--nv)":"var(--mu)", transition:"all .2s" }}>{t.l}</div>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"11px" }}>
        {activeTab === "tools" && (
          <ContentProviders onOpenTool={setActiveTool}/>
        )}
        {activeTab === "labs" && (() => {
          // Build the guided path: recommended first → started → not yet
          const childGrade = localStorage.getItem("neo_child_grade") || student?.grade || "3rd Grade";
          const stuNum    = gradeToNum(childGrade);
          const inProgress = LABS.filter(l => (mem.labStats[l.id]?.masteryPct || student.labProgress[l.id] || 0) > 0 && (mem.labStats[l.id]?.masteryPct || student.labProgress[l.id] || 0) < 100);
          const recommended = recs.length > 0 ? recs[0].lab : (inProgress[0] || LABS[0]);
          const nextUp      = LABS.filter(l => l.id !== recommended.id).slice(0, 3);
          const pct         = mem.labStats[recommended.id]?.masteryPct || student.labProgress[recommended.id] || 0;
          const rec0Reason  = recs[0]?.reason || "Continue your journey";

          // Path visualization: completed → current → upcoming
          const completed   = LABS.filter(l => (mem.labStats[l.id]?.masteryPct || student.labProgress[l.id] || 0) >= 80).slice(0, 2);
          const upcoming    = LABS.filter(l => !completed.find(c=>c.id===l.id) && l.id !== recommended.id).slice(0, 2);

          return (
            <div>
              {/* 1. Today's path — simple horizontal trajectory */}
              <div style={{ marginBottom:18 }}>
                <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>Your math journey</p>
                <div style={{ display:"flex", alignItems:"center", gap:5, overflowX:"auto", paddingBottom:4 }}>
                  {completed.map((l,i) => (
                    <div key={l.id} style={{ flex:"0 0 auto", textAlign:"center", opacity:.55 }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:"var(--sg)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, margin:"0 auto" }}>{l.emoji}</div>
                      <p style={{ fontSize:9, color:"var(--sg)", marginTop:3, fontWeight:600 }}>✓ Done</p>
                    </div>
                  ))}
                  {completed.length > 0 && <div style={{ flex:"0 0 auto", height:2, width:18, background:"var(--p2)" }}/>}
                  <div style={{ flex:"0 0 auto", textAlign:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--or)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto", boxShadow:"0 4px 14px rgba(217,98,43,.3)", animation:"pu 2s ease-in-out infinite" }}>{recommended.emoji}</div>
                    <p style={{ fontSize:10, color:"var(--or)", marginTop:3, fontWeight:700 }}>You are here</p>
                  </div>
                  <div style={{ flex:"0 0 auto", height:2, width:18, background:"var(--p2)" }}/>
                  {upcoming.map((l,i) => (
                    <div key={l.id} style={{ flex:"0 0 auto", textAlign:"center", opacity:.4 }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:"var(--p)", color:"var(--mu)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, margin:"0 auto", border:"1.5px dashed var(--p2)" }}>{l.emoji}</div>
                      <p style={{ fontSize:9, color:"var(--mu)", marginTop:3 }}>Next</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Hero card — single Up Next */}
              <div className="card fu" style={{ marginBottom:16, padding:"0", overflow:"hidden", border:"none", background:"linear-gradient(135deg,#fff8f0,#fff)", boxShadow:"0 8px 28px rgba(217,98,43,.15)" }}>
                <div style={{ padding:"18px 18px 14px" }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:8 }}>✦ Up next for you</p>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
                    <div style={{ fontSize:46, lineHeight:1, flexShrink:0 }}>{recommended.emoji}</div>
                    <div style={{ flex:1 }}>
                      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:500, lineHeight:1.2, marginBottom:4 }}>{recommended.title}</h2>
                      <p style={{ fontSize:13, color:"var(--mu)", lineHeight:1.5, marginBottom:4 }}>{rec0Reason}</p>
                      <p style={{ fontSize:11, color:"var(--mu)" }}>{recommended.time} min · with {getTutorConfig(recommended.id).name}</p>
                      {pct > 0 && (
                        <div style={{ marginTop:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ fontSize:11, color:"var(--mu)" }}>Mastery</span><span style={{ fontSize:11, fontWeight:700, color:"var(--or)" }}>{pct}%</span></div>
                          <PBar v={pct} c="var(--or)" h={5}/>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="btn bo fw" onClick={() => setActiveLab(recommended)} style={{ fontSize:15, padding:"13px" }}>
                    {pct > 0 ? "Continue →" : "Start activity →"}
                  </button>
                </div>
              </div>

              {/* 3. Coming up next — 3 small previews */}
              <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Then you'll explore</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
                {nextUp.map((l, i) => {
                  const labRange = parseLabGrades(l.grades);
                  const above    = stuNum < labRange.min;
                  return (
                    <div key={l.id} onClick={() => setActiveLab(l)} className="fu" style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:"10px 13px", background:"#fff", borderRadius:11, border:"1px solid var(--p2)", animationDelay:`${i*.05}s`, transition:"all .2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--or)"; e.currentTarget.style.transform="translateX(3px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--p2)"; e.currentTarget.style.transform="";}}>
                      <span style={{ fontSize:20, opacity:.7 }}>{l.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:13, fontWeight:600 }}>{l.title}</span>
                          {above && <span style={{ fontSize:9, background:"#fdf3d0", color:"var(--am)", padding:"1px 5px", borderRadius:99, fontWeight:600 }}>🌟</span>}
                        </div>
                        <p style={{ fontSize:10, color:"var(--mu)" }}>{l.time} min</p>
                      </div>
                      <span style={{ fontSize:14, color:"var(--mu)" }}>→</span>
                    </div>
                  );
                })}
              </div>

              {/* 4. Browse all — collapsed by default */}
              {!browseAll && (
                <button className="btn bg fw" onClick={() => setBrowseAll(true)} style={{ fontSize:12 }}>
                  Browse all {LABS.length} activities ↓
                </button>
              )}
              {browseAll && (
                <div className="fu">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em" }}>All activities ({LABS.length})</p>
                    <button onClick={() => setBrowseAll(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--mu)" }}>Hide ↑</button>
                  </div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                    {topics.map(t => <div key={t} className={`pill${filter===t?" on":""}`} style={{ fontSize:11 }} onClick={()=>setFilter(t)}>{t}</div>)}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {LABS.filter(l => filter==="All" || l.topic===filter).map((l,i) => {
                      const p2 = mem.labStats[l.id]?.masteryPct || student.labProgress[l.id] || 0;
                      const labRange = parseLabGrades(l.grades);
                      const above    = stuNum < labRange.min;
                      return (
                        <div key={l.id} onClick={() => setActiveLab(l)} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:9, padding:"9px 12px", background:"#fff", borderRadius:9, border:"1px solid var(--p)", animation:`fu .3s ${i*.02}s both` }}>
                          <span style={{ fontSize:18 }}>{l.emoji}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ fontWeight:600, fontSize:12.5 }}>{l.title}</span>
                              {above && <span style={{ fontSize:9, background:"#fdf3d0", color:"var(--am)", padding:"1px 5px", borderRadius:99, fontWeight:600 }}>🌟</span>}
                            </div>
                            <p style={{ fontSize:10, color:"var(--mu)" }}>{l.grades} · {l.time}min</p>
                          </div>
                          {p2 > 0 ? <span style={{ fontSize:11, fontWeight:700, color:p2>80?"var(--sg)":"var(--or)" }}>{p2}%</span> : <span style={{ fontSize:14, color:"var(--mu)" }}>→</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        {activeTab === "tutors" && (() => {
          // Pick the 3 most relevant tutors based on student's grade level
          const childGradeNum = gradeToNum(localStorage.getItem("neo_child_grade") || student?.grade || "3rd Grade");
          const featured = TUTORS.filter(t => {
            const ages = (t.ages || "").toLowerCase();
            // simple parse: if contains "k" or numbers, check overlap with student grade
            if (childGradeNum <= 2 && (ages.includes("pre-k") || ages.includes("k–") || ages.includes("k-"))) return true;
            if (childGradeNum >= 3 && childGradeNum <= 5 && ages.match(/[3-5]/)) return true;
            return false;
          }).slice(0, 3);
          const pickFeatured = featured.length >= 3 ? featured : TUTORS.slice(0, 3);
          const [tutorsBrowseAll, setTutorsBrowseAll] = [browseAll, setBrowseAll]; // reuse state

          return (
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:9 }}>For your level</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                {pickFeatured.map((t,i) => (
                  <div key={t.id} onClick={() => openTutor(t)} className="fu" style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:11, padding:"12px 14px", background:"#fff", borderRadius:12, border:`1.5px solid ${t.color}33`, animationDelay:`${i*.05}s`, transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color; e.currentTarget.style.transform="translateX(3px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=`${t.color}33`; e.currentTarget.style.transform="";}}>
                    <div style={{ width:42, height:42, borderRadius:11, background:`${t.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{t.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{t.label}</div>
                      <div style={{ fontSize:11, color:t.color, fontWeight:600 }}>{t.name}</div>
                    </div>
                    <span style={{ fontSize:16, color:"var(--mu)" }}>→</span>
                  </div>
                ))}
              </div>
              {!tutorsBrowseAll ? (
                <button className="btn bg fw" onClick={() => setTutorsBrowseAll(true)} style={{ fontSize:12 }}>
                  Browse all {TUTORS.length} tutors ↓
                </button>
              ) : (
                <div className="fu">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em" }}>All tutors ({TUTORS.length})</p>
                    <button onClick={() => setTutorsBrowseAll(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--mu)" }}>Hide ↑</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {TUTORS.map((t,i) => (
                      <div key={t.id} onClick={() => openTutor(t)} style={{ cursor:"pointer", padding:"11px 12px", background:"#fff", borderRadius:9, border:`1px solid var(--p)`, animation:`fu .3s ${i*.02}s both`, borderTop:`3px solid ${t.color}` }}>
                        <div style={{ fontSize:18, marginBottom:4 }}>{t.emoji}</div>
                        <div style={{ fontWeight:700, fontSize:12 }}>{t.label}</div>
                        <div style={{ fontSize:10, color:t.color }}>{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        {activeTab === "memory" && (
          <div>
            <h2 className="h2" style={{ marginBottom:4 }}>📈 Your learning trajectory</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:14 }}>Where you are, how fast you're growing, and what's next.</p>
            <LearningTrajectory
              studentName={user?.name?.split(" ")[0] || localStorage.getItem("neo_child_name") || "you"}
              studentGrade={localStorage.getItem("neo_child_grade") || "3rd Grade"}
              mem={mem}
            />

            <h2 className="h2" style={{ marginBottom:4, marginTop:18 }}>🧠 Your activity memory</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:12 }}>AI tracks your progress across all activities and adapts tutor recommendations.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
              {[{l:"Total min",v:`${Math.round(mem.totalMins)}`,c:"var(--or)"},{l:"Day streak",v:`${mem.streak}🔥`,c:"var(--sg)"},{l:"Velocity",v:mem.learningVelocity,c:"var(--bl)"}].map((s,i) => (
                <div key={i} style={{ background:"var(--p)", borderRadius:13, padding:"12px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:16, fontFamily:"'Fraunces',serif", fontWeight:500, color:s.c, marginBottom:2 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>
            {mem.strongAreas.length > 0 && (
              <div className="card fu" style={{ marginBottom:9, borderLeft:"3px solid var(--sg)" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--sg)", marginBottom:6 }}>💪 Strong areas</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{mem.strongAreas.map(s=><span key={s} style={{ fontSize:12, background:"#dff2ea", color:"var(--sg)", padding:"3px 8px", borderRadius:99, fontWeight:600 }}>{s}</span>)}</div>
              </div>
            )}
            {mem.weakAreas.length > 0 && (
              <div className="card fu d1" style={{ marginBottom:9, borderLeft:"3px solid var(--rd)" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--rd)", marginBottom:6 }}>🎯 Needs practice</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{mem.weakAreas.map(s=><span key={s} style={{ fontSize:12, background:"#fde8e8", color:"var(--rd)", padding:"3px 8px", borderRadius:99, fontWeight:600 }}>{s}</span>)}</div>
              </div>
            )}
            <div className="card fu d2">
              <p style={{ fontSize:11, fontWeight:700, color:"var(--mu)", marginBottom:8 }}>Lab sessions ({mem.sessions.length} total)</p>
              {mem.sessions.length === 0
                ? <p className="mu" style={{ fontSize:13 }}>No sessions yet — open a lab to start building your memory!</p>
                : mem.sessions.slice(-5).reverse().map((s,i) => {
                  const lab = LABS.find(l=>l.id===s.lab);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<4?"1px solid var(--p)":"none" }}>
                      <span style={{ fontSize:15 }}>{lab?.emoji||"🔬"}</span>
                      <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:500 }}>{lab?.title||s.lab}</div><div style={{ fontSize:10, color:"var(--mu)" }}>{Math.round(s.duration/60000)}min · score:{s.score||0}</div></div>
                      <PBar v={s.score||0} c="var(--or)" h={3}/>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── TUTOR ADMIN PANEL ────────────────────────────────────────────────────────
function TutorAdminPanel() {
  const [selLab, setSelLab] = useState(LABS[0].id);
  const [config, setConfig] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [improving, setImproving] = useState(false);
  const [improvement, setImprovement] = useState(null);
  const [tab, setTab] = useState("prompt");

  useEffect(() => { setConfig({...getTutorConfig(selLab)}); setSaved(false); setEditing(false); setImprovement(null); }, [selLab]);

  const save = () => { saveTutorConfig(selLab, config); setSaved(true); setEditing(false); setTimeout(()=>setSaved(false), 2500); };

  const improve = async () => {
    setImproving(true); setImprovement(null);
    const allMems = Object.values(JSON.parse(localStorage.getItem("neo_student_memory")||"{}"));
    const feedback = allMems.flatMap(m=>(m.tutorFeedback||[]).filter(f=>f.lab===selLab));
    const good = feedback.filter(f=>f.rating==="good").map(f=>f.msg).slice(0,3);
    const bad  = feedback.filter(f=>f.rating==="bad").map(f=>f.msg).slice(0,3);
    try {
      const sug = await claude(null, [{role:"user",content:`Improve this AI tutor prompt for "${LABS.find(l=>l.id===selLab)?.title}".\n\nCurrent prompt:\n${config.system}\n\nPositive-rated responses: ${good.length>0?good.join(" | "):"none yet"}\nNegative-rated responses: ${bad.length>0?bad.join(" | "):"none yet"}\n\nGive 2-3 specific, actionable improvements. Be concrete.`}], 300);
      setImprovement(sug);
    } catch { setImprovement("Could not generate suggestions — check your connection."); }
    setImproving(false);
  };

  if (!config) return null;
  const allMems = Object.values(JSON.parse(localStorage.getItem("neo_student_memory")||"{}"));
  const sessions = allMems.flatMap(m=>(m.sessions||[]).filter(s=>s.lab===selLab));
  const feedback = allMems.flatMap(m=>(m.tutorFeedback||[]).filter(f=>f.lab===selLab));
  const avgScore = sessions.length>0 ? Math.round(sessions.reduce((a,s)=>a+(s.score||0),0)/sessions.length) : 0;
  const avgMins  = sessions.length>0 ? Math.round(sessions.reduce((a,s)=>a+(s.duration||0),0)/sessions.length/60000) : 0;

  return (
    <div style={{ maxWidth:700 }}>
      <h2 className="h2" style={{ marginBottom:4 }}>🎛️ AI Tutor Settings</h2>
      <p className="mu" style={{ fontSize:12, marginBottom:14 }}>Edit, test, and improve AI tutors for each lab. Feedback loop closes automatically from student ratings.</p>
      <div style={{ display:"flex", gap:14 }}>
        {/* Lab list */}
        <div style={{ width:190, flexShrink:0 }}>
          <p className="lbl" style={{ marginBottom:7 }}>Select lab</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:"calc(100vh - 220px)", overflowY:"auto" }}>
            {LABS.map(l => (
              <div key={l.id} onClick={()=>setSelLab(l.id)} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 9px", borderRadius:9, cursor:"pointer", background:selLab===l.id?"var(--nv)":"var(--p)", color:selLab===l.id?"#fff":"var(--tx)", transition:"all .2s" }}>
                <span style={{ fontSize:14 }}>{l.emoji}</span>
                <div><div style={{ fontSize:12, fontWeight:600 }}>{l.title}</div><div style={{ fontSize:10, opacity:.6 }}>{getTutorConfig(l.id).name}</div></div>
              </div>
            ))}
          </div>
        </div>
        {/* Editor */}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:4, marginBottom:11, background:"var(--p)", padding:4, borderRadius:10 }}>
            {[["prompt","Prompt"],["persona","Persona"],["feedback","Feedback"],["analytics","Analytics"]].map(([id,lbl]) => (
              <div key={id} onClick={()=>setTab(id)} style={{ flex:1, textAlign:"center", padding:"6px", borderRadius:7, cursor:"pointer", fontSize:11.5, fontWeight:600, background:tab===id?"#fff":"transparent", color:tab===id?"var(--nv)":"var(--mu)", transition:"all .2s" }}>{lbl}</div>
            ))}
          </div>

          {tab==="prompt" && <div className="card">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:11 }}>
              <div><div style={{ fontWeight:700, fontSize:14 }}>{config.avatar} {config.name}</div><div style={{ fontSize:11, color:"var(--mu)" }}>v{config.version||1} · {LABS.find(l=>l.id===selLab)?.title}</div></div>
              <div style={{ display:"flex", gap:6 }}>
                {saved && <span style={{ fontSize:12, color:"var(--sg)", fontWeight:600 }}>✓ Saved!</span>}
                <button className="btn bg sm" onClick={()=>setEditing(e=>!e)}>{editing?"Cancel":"Edit"}</button>
                {editing && <button className="btn bo sm" onClick={save}>Save</button>}
              </div>
            </div>
            <label className="lbl" style={{ marginBottom:5 }}>System prompt</label>
            <textarea className="ta inp" rows={11} style={{ fontSize:11.5, fontFamily:"'DM Mono',monospace" }} value={config.system||""} onChange={e=>setConfig(c=>({...c,system:e.target.value}))} readOnly={!editing}/>
            <div style={{ marginTop:10 }}>
              <label className="lbl" style={{ marginBottom:5 }}>Coach notes (context for AI improvement)</label>
              <textarea className="ta inp" rows={2} style={{ fontSize:12 }} placeholder="What's working? What needs improvement?" value={config.feedbackNotes||""} onChange={e=>setConfig(c=>({...c,feedbackNotes:e.target.value}))}/>
            </div>
          </div>}

          {tab==="persona" && <div className="card">
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ display:"grid", gridTemplateColumns:"70px 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">Avatar</label><input className="inp" style={{ textAlign:"center", fontSize:20 }} value={config.avatar||"🤖"} onChange={e=>setConfig(c=>({...c,avatar:e.target.value}))}/></div>
                <div className="fg"><label className="lbl">Name</label><input className="inp" value={config.name||""} onChange={e=>setConfig(c=>({...c,name:e.target.value}))}/></div>
              </div>
              <div className="fg"><label className="lbl">Persona description</label><input className="inp" value={config.persona||""} onChange={e=>setConfig(c=>({...c,persona:e.target.value}))} placeholder="e.g. Warm encouraging math coach"/></div>
              <div className="fg">
                <label className="lbl">Starter prompts (one per line)</label>
                <textarea className="ta inp" rows={4} value={(config.starterPrompts||[]).join("\n")} onChange={e=>setConfig(c=>({...c,starterPrompts:e.target.value.split("\n").filter(Boolean)}))}/>
              </div>
              <button className="btn bn" onClick={save}>Save persona</button>
            </div>
          </div>}

          {tab==="feedback" && <div>
            <div className="card" style={{ marginBottom:11 }}>
              <p className="lbl" style={{ marginBottom:7 }}>AI improvement loop</p>
              <p className="mu" style={{ fontSize:12, marginBottom:10 }}>Analyzes all 👍/👎 ratings from students and suggests prompt improvements automatically.</p>
              <button className="btn bn" onClick={improve} disabled={improving}>{improving?<><Spn dark/> Analyzing feedback…</>:"✦ Generate improvements"}</button>
              {improvement && (
                <div style={{ marginTop:11, background:"var(--p)", borderRadius:11, padding:"12px 14px" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", marginBottom:7 }}>Suggestions:</p>
                  <p style={{ fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{improvement}</p>
                </div>
              )}
            </div>
            <div className="card">
              <p className="lbl" style={{ marginBottom:9 }}>Student feedback ({feedback.length} ratings)</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:10 }}>
                <div style={{ background:"#dff2ea", borderRadius:9, padding:"9px 11px", textAlign:"center" }}><div style={{ fontSize:18, fontWeight:700, color:"var(--sg)" }}>{feedback.filter(f=>f.rating==="good").length}</div><div style={{ fontSize:11, color:"var(--sg)" }}>👍 Good responses</div></div>
                <div style={{ background:"#fde8e8", borderRadius:9, padding:"9px 11px", textAlign:"center" }}><div style={{ fontSize:18, fontWeight:700, color:"var(--rd)" }}>{feedback.filter(f=>f.rating==="bad").length}</div><div style={{ fontSize:11, color:"var(--rd)" }}>👎 Needs work</div></div>
              </div>
              {feedback.filter(f=>f.rating==="bad").slice(-3).map((f,i) => (
                <div key={i} style={{ background:"var(--p)", borderRadius:8, padding:"7px 9px", marginBottom:5, fontSize:12, color:"var(--mu)", lineHeight:1.5 }}>
                  👎 "{f.msg?.substring(0,120)}..."
                </div>
              ))}
            </div>
          </div>}

          {tab==="analytics" && <div>
            <div className="card" style={{ marginBottom:11 }}>
              <p className="lbl" style={{ marginBottom:9 }}>Lab usage</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
                {[{l:"Sessions",v:sessions.length,c:"var(--nv)"},{l:"Avg score",v:`${avgScore}%`,c:"var(--or)"},{l:"Avg time",v:`${avgMins}min`,c:"var(--sg)"}].map((s,i)=>(
                  <div key={i} style={{ background:"var(--p)", borderRadius:12, padding:"12px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontFamily:"'Fraunces',serif", fontWeight:500, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:11, color:"var(--mu)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <p className="lbl" style={{ marginBottom:9 }}>Student memory insights</p>
              {allMems.length===0 ? <p className="mu" style={{ fontSize:13 }}>No data yet — students need to complete sessions.</p>
                : allMems.slice(0,4).map((m,i)=>(
                  <div key={i} style={{ marginBottom:9, padding:"7px 0", borderBottom:i<3?"1px solid var(--p)":"none" }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{m.studentId}</div>
                    <div style={{ fontSize:12, color:"var(--mu)" }}>
                      Velocity: {m.learningVelocity} · Strong: {(m.strongAreas||[]).join(", ")||"building up"} · Needs: {(m.weakAreas||[]).join(", ")||"none yet"}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── COACH OS ──────────────────────────────────────────────────────────────────
function CoachOS({ user }) {
  const [view, setView] = useState("brief");
  const [activeTool, setActiveTool] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loadBrief, setLoadBrief] = useState(false);
  const [sel, setSel] = useState(DEMO_STUDENTS[0]);
  const [comm, setComm] = useState(null);
  const [loadComm, setLoadComm] = useState(false);
  const [sent, setSent] = useState({});
  const [nudges] = useState([
    { id: 1, student: "Ava Chen", msg: "Stalled on fractions 9 min", action: "Switch to PhET Fraction Matcher", sev: "high", time: "2min ago" },
    { id: 2, student: "Marcus Johnson", msg: "Completed multiplication ahead of schedule", action: "Unlock division track", sev: "positive", time: "5min ago" },
    { id: 3, student: "Ethan Park", msg: "ELA stalled 4 days", action: "Schedule 1:1 reading session", sev: "high", time: "1hr ago" },
  ]);
  const [dismissed, setDismissed] = useState([]);

  const nav = [
    { id:"brief",      i:"☀️", l:"Morning Brief" },
    { id:"nudges",     i:"⚡", l:"Opportunities" },
    { id:"students",   i:"👥", l:"Student Insights" },
    { id:"curriculum", i:"📚", l:"Curriculum Builder" },
    { id:"providers",  i:"🔗", l:"Learning Tools" },
    { id:"aiguide",    i:"🤖", l:"AI Basics" },
    { id:"tutors",     i:"🎛️", l:"AI Tutor Settings" },  // bottom — advanced/admin
  ];
  // Parent comms intentionally removed from Guide view.
  // Handled by Campus Director — keeps Guides 100% focused on facilitation.

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="sb" style={{ padding: "20px 12px" }}>
        <div style={{ padding: "2px 6px", marginBottom: 22 }}><Logo l sz={13} /></div>
        <div style={{ fontFamily:"'Geist Mono',monospace", fontSize: 9.5, fontWeight: 500, color: "rgba(255,255,255,.35)", letterSpacing: ".14em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Guide Dashboard</div>
        {nav.map(n => (
          <div key={n.id} className={`ni${view === n.id ? " ac" : ""}`} onClick={() => setView(n.id)}>
            <span>{n.i}</span><span>{n.l}</span>
            {n.id === "nudges" && nudges.filter(x => !dismissed.includes(x.id) && x.sev === "high").length > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--or)", color: "#fff", borderRadius: 99, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 600, fontFamily:"'Geist Mono',monospace" }}>{nudges.filter(x => !dismissed.includes(x.id) && x.sev === "high").length}</span>
            )}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", padding: "14px 8px 0" }}>
          <div style={{ fontFamily:"'Geist Mono',monospace", fontSize: 9.5, color: "rgba(255,255,255,.35)", marginBottom: 4, letterSpacing:".08em", textTransform:"uppercase" }}>Coach</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontWeight: 500, color: "rgba(255,255,255,.9)", fontSize: 15, marginBottom:2 }}>{user?.name?.split(" ")[0]}</div>
          <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, color:"rgba(255,255,255,.45)", letterSpacing:".05em" }}>{DEMO_STUDENTS.length} students · May 2026</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--cr)" }}>
        {view === "brief" && (() => {
          // Find ONE priority student — highest severity alert
          const priorityStudent = DEMO_STUDENTS.find(s => s.alerts?.some(a => a.sev === "high")) || DEMO_STUDENTS[0];
          const priorityAlert   = priorityStudent.alerts?.[0];
          return (
            <div style={{ maxWidth: 640 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
                <div>
                  <h2 className="h2">☀️ Morning Brief</h2>
                  <p className="mu" style={{ fontSize:12, marginTop:2 }}>{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</p>
                </div>
                {!brief && <button className="btn bn sm" onClick={async () => { setLoadBrief(true); try { setBrief(await genBriefing(DEMO_STUDENTS)); } catch { } setLoadBrief(false); }} disabled={loadBrief}>{loadBrief ? <><Spn /> Generating…</> : "✦ Generate"}</button>}
              </div>

              {/* HERO: ONE student to focus on */}
              <div className="card fu" style={{ marginBottom:14, padding:"18px", background:"linear-gradient(135deg,#fff8f0,#fff)", borderLeft:"3px solid var(--or)" }}>
                <p style={{ fontSize:10, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:10 }}>✦ Start your day with {priorityStudent.name.split(" ")[0]}</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div className="av" style={{ background:priorityStudent.color, width:46, height:46, fontSize:14 }}>{priorityStudent.init}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:500, lineHeight:1.2 }}>{priorityStudent.name}</p>
                    <p style={{ fontSize:12, color:"var(--mu)" }}>{priorityStudent.grade} · {priorityStudent.velocity} velocity · {priorityStudent.streak}🔥</p>
                  </div>
                </div>
                {priorityAlert && (
                  <div style={{ background:"var(--p)", borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--rd)", marginBottom:3 }}>⚠️ Why now</p>
                    <p style={{ fontSize:13, lineHeight:1.5 }}>{priorityAlert.msg}</p>
                  </div>
                )}
                <button className="btn bo fw" onClick={() => { setSel(priorityStudent); setView("students"); }} style={{ fontSize:14 }}>
                  Open {priorityStudent.name.split(" ")[0]}'s insights →
                </button>
              </div>

              {/* AI briefing — only show if generated, lightweight */}
              {brief && (
                <div className="card pi fu" style={{ marginBottom:14, borderLeft:"3px solid var(--or)" }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>✦ Today's coaching tip</p>
                  <p style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:13.5, lineHeight:1.6, marginBottom:10 }}>{brief.greeting}</p>
                  {brief.tip && <p style={{ fontSize:12.5, color:"var(--mu)", lineHeight:1.55 }}>💡 {brief.tip}</p>}
                </div>
              )}

              {/* Compact student summary */}
              <div style={{ marginBottom:10 }}>
                <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:9 }}>All students today</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {DEMO_STUDENTS.map((s, i) => (
                    <div key={s.id} onClick={() => { setSel(s); setView("students"); }} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:8, padding:"8px 11px", background:"#fff", borderRadius:9, border:"1px solid var(--p)", animation:`fu .3s ${i*.04}s both` }}>
                      <div className="av" style={{ background:s.color, width:28, height:28, fontSize:10 }}>{s.init}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name.split(" ")[0]}</p>
                        <p style={{ fontSize:10, color:"var(--mu)" }}>{s.alerts?.length > 0 ? `⚠ ${s.alerts.length}` : `✓ ${s.streak}🔥`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {view === "aiguide" && (
          <div style={{ maxWidth:640 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>🤖 AI Basics for Guides</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:18 }}>How the AI works, and how to get the most out of it.</p>
            {[
              { emoji:"🎯", title:"What the AI tutors do", body:"Each subject has its own AI tutor with a specific persona and teaching style. They use the Socratic method — they never give direct answers. Instead, they guide students with questions like 'What have you tried?' or 'What do you notice about this pattern?'" },
              { emoji:"⚡", title:"What the AI doesn't do", body:"The AI doesn't replace you. It handles content delivery, adaptation, and tracking. You handle trust, curiosity, conflict, and the moments that require a human — which is most of what matters." },
              { emoji:"🎛️", title:"Tuning a tutor", body:'Go to "AI Settings" in the sidebar. Each activity has its own tutor you can customize. You can edit the system prompt, change the persona, add starter questions, and see which responses students rated 👍 or 👎.' },
              { emoji:"📝", title:"Prompting basics", body:"The AI tutors respond to what they're told in their system prompt. Simple instructions work best: be specific about the subject, the age group, and the teaching approach. Use 'Ask questions before explaining' and 'Use real-world examples for this age.'" },
              { emoji:"🔄", title:"The feedback loop", body:'When a student taps 👎 on a tutor response, it feeds into the "AI Settings → Feedback" tab. You can then click "Generate improvements" to get AI-suggested prompt changes based on real student ratings.' },
              { emoji:"🧠", title:"Student memory", body:'Every session is logged in the Student Insights tab. The AI tracks each student\'s velocity, strong areas, and weak areas across all activities. Tutors use this context automatically — so if a student struggled with fractions last week, the math tutor already knows.' },
            ].map((s, i) => (
              <div key={i} className="card fu" style={{ marginBottom:10, animationDelay:`${i*.06}s` }}>
                <div style={{ display:"flex", gap:12 }}>
                  <span style={{ fontSize:24, flexShrink:0 }}>{s.emoji}</span>
                  <div><div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{s.title}</div><p style={{ fontSize:13, color:"var(--mu)", lineHeight:1.65 }}>{s.body}</p></div>
                </div>
              </div>
            ))}
            <div style={{ background:"var(--nv)", borderRadius:14, padding:"16px 18px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Quick reference: prompting dos and don'ts</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--sg2)", marginBottom:6 }}>✓ Works well</p>
                  {["Ask questions before explaining","Use real-world examples","2–3 sentences max","Adapt to their grade","Celebrate effort"].map((s,i)=><p key={i} style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginBottom:3 }}>· {s}</p>)}
                </div>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--rd)", marginBottom:6 }}>✗ Avoid</p>
                  {["Giving direct answers","Long explanations","Technical jargon","Same response to everyone","Skipping encouragement"].map((s,i)=><p key={i} style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginBottom:3 }}>· {s}</p>)}
                </div>
              </div>
            </div>
          </div>
        )}
        {view === "nudges" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 className="h2">⚡ Opportunities</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--sg)", fontWeight: 600 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sg2)", animation: "pu 1.5s infinite" }} />Live</div>
            </div>
            <p className="mu" style={{ fontSize: 12, marginBottom: 16 }}>System 2 monitors all students — you focus on coaching.</p>
            {nudges.filter(n => !dismissed.includes(n.id)).map((n, i) => (
              <div key={n.id} className="card fu" style={{ marginBottom: 10, borderLeft: `3px solid ${n.sev === "high" ? "var(--rd)" : "var(--sg)"}` }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{n.sev === "high" ? "⚠️" : "✨"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>{n.student}</span><span style={{ fontSize: 10, color: "var(--mu)" }}>{n.time}</span></div>
                    <p style={{ fontSize: 12.5, marginBottom: 6 }}>{n.msg}</p>
                    <div style={{ background: "var(--p)", borderRadius: 9, padding: "7px 11px", display: "flex", gap: 6 }}><span style={{ color: "var(--or)" }}>→</span><p style={{ fontSize: 12, color: "var(--or)", fontWeight: 500 }}>{n.action}</p></div>
                  </div>
                  <button onClick={() => setDismissed(d => [...d, n.id])} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mu)", fontSize: 18 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {view === "students" && (
          <div style={{ maxWidth: 640 }}>
            <h2 className="h2" style={{ marginBottom: 16 }}>👥 Student Insights · System 1</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {DEMO_STUDENTS.map(s => (
                <div key={s.id} onClick={() => setSel(s)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 99, cursor: "pointer", background: sel?.id === s.id ? "var(--nv)" : "var(--p)", color: sel?.id === s.id ? "#fff" : "var(--tx)", transition: "all .2s" }}>
                  <div className="av" style={{ background: s.color, width: 20, height: 20, fontSize: 8 }}>{s.init}</div>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
            {sel && (
              <div>
                <div className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div className="av" style={{ background: sel.color, width: 44, height: 44, fontSize: 14 }}>{sel.init}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 16 }}>{sel.name}</div><div style={{ fontSize: 12, color: "var(--mu)" }}>{sel.grade} · {sel.city} · {sel.totalMins}min/wk</div></div>
                  </div>
                  <p className="lbl" style={{ marginBottom: 10 }}>Lab progress</p>
                  {LABS.slice(0, 6).map(l => {
                    const pct = sel.labProgress[l.id] || 0;
                    return (
                      <div key={l.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12 }}>{l.emoji} {l.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: pct === 0 ? "var(--mu)" : pct > 80 ? "var(--sg)" : "var(--or)" }}>{pct > 0 ? `${pct}%` : "—"}</span>
                        </div>
                        <PBar v={pct} c={pct > 80 ? "var(--sg)" : "var(--or)"} h={4} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {view === "comms" && (
          <div style={{ maxWidth: 640 }}>
            <h2 className="h2" style={{ marginBottom: 4 }}>💌 Parent Comms Engine</h2>
            <p className="mu" style={{ fontSize: 12, marginBottom: 16 }}>AI writes personalized daily updates. Review, send in one click.</p>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 170, flexShrink: 0 }}>
                {DEMO_STUDENTS.map(s => (
                  <div key={s.id} onClick={() => { setSel(s); setComm(null); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 11, cursor: "pointer", marginBottom: 6, background: sel?.id === s.id ? "var(--nv)" : "var(--p)", color: sel?.id === s.id ? "#fff" : "var(--tx)" }}>
                    <div className="av" style={{ background: s.color, width: 24, height: 24, fontSize: 9 }}>{s.init}</div>
                    <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name.split(" ")[0]}</div><div style={{ fontSize: 10, opacity: .6 }}>{sent[s.id] ? "✓ Sent" : "Draft"}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                {sel && (
                  <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div className="av" style={{ background: sel.color, width: 32, height: 32, fontSize: 10 }}>{sel.init}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{sel.name}</div></div>
                      <button className="btn bn sm" onClick={async () => { setLoadComm(true); setComm(null); try { setComm(await genParentComm(sel)); } catch { } setLoadComm(false); }} disabled={loadComm}>{loadComm ? <><Spn /> Writing…</> : "✦ Generate"}</button>
                    </div>
                    {loadComm && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[100, 80, 90].map((w, i) => <div key={i} className="sh" style={{ height: 24, width: `${w}%` }} />)}</div>}
                    {comm && !loadComm && (
                      <div>
                        <div style={{ background: "var(--p)", borderRadius: 10, padding: "11px 13px", marginBottom: 10 }}><div style={{ fontSize: 10, fontWeight: 700, color: "var(--mu)", textTransform: "uppercase", marginBottom: 3 }}>Subject</div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{comm.emoji} {comm.subject}</div></div>
                        <div style={{ background: "var(--p)", borderRadius: 10, padding: "11px 13px", marginBottom: 12 }}><p style={{ fontSize: 13, lineHeight: 1.7 }}>{comm.body}</p></div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn bo" style={{ flex: 1 }} onClick={() => setSent(p => ({ ...p, [sel.id]: true }))}>{sent[sel.id] ? "✓ Sent!" : "Send →"}</button>
                          <button className="btn bg">Edit</button>
                        </div>
                      </div>
                    )}
                    {!comm && !loadComm && <div style={{ textAlign: "center", padding: "20px 0", color: "var(--mu)" }}><p style={{ fontSize: 28, marginBottom: 8 }}>💌</p><p style={{ fontSize: 12 }}>Click Generate for today's update</p></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {view === "tutors" && <TutorAdminPanel />}
        {view === "curriculum" && <CurriculumBuilder userId={user?.id} onNeedCredits={() => setShowPay(true)} />}
        {view === "providers" && <ContentProviders onOpenTool={setActiveTool}/>}
        {/* Parent comms intentionally not here — Campus Director owns it */}
        {view === "parentcomms_info" && (
          <div style={{ maxWidth:500 }}>
            <div className="card" style={{ borderLeft:"3px solid var(--bl)" }}>
              <p style={{ fontSize:22, marginBottom:10 }}>🏛️</p>
              <h2 className="h2" style={{ marginBottom:8 }}>Parent comms → Campus Director</h2>
              <p style={{ fontSize:14, lineHeight:1.7, color:"var(--mu)", marginBottom:14 }}>
                Parent communications are handled by the <strong>Campus Director</strong>, not by Guides. This keeps you 100% focused on facilitation — no email admin, no parent management.
              </p>
              <p style={{ fontSize:13, color:"var(--mu)", marginBottom:14 }}>
                This is the Alpha School model: Heads of School and Deans of Parents own the parent relationship. Guides own the learning relationship.
              </p>
              <div style={{ background:"var(--p)", borderRadius:11, padding:"12px 14px" }}>
                <p style={{ fontSize:12, fontWeight:600 }}>Dr. Sandra Reyes — Campus Director</p>
                <p style={{ fontSize:12, color:"var(--mu)" }}>director@neoschool.me · handles all parent comms</p>
              </div>
            </div>
          </div>
        )}
        {activeTool && <SimViewer tool={activeTool} onClose={()=>setActiveTool(null)}/>}
      </div>
    </div>
  );
}

// ── CURRICULUM BUILDER — age-aware, flexible ─────────────────────────────────
const AGE_BANDS = [
  { id:"prek",  label:"Pre-K (ages 3–6)",  grades:"Pre-K",          style:"Play-based, sensory, 10-min activities",   daily:"60–90 min",  emoji:"🌱" },
  { id:"k2",    label:"K–2 (ages 5–7)",  grades:"K, 1st, 2nd",    style:"Hands-on, songs, games, short bursts",     daily:"90–120 min", emoji:"🌼" },
  { id:"35",    label:"3–5 (ages 8–10)", grades:"3rd, 4th, 5th",   style:"Project-based, collaborative, labs",       daily:"120 min",    emoji:"🌿" },
  { id:"68",    label:"6–8 (ages 11–13)",grades:"6th, 7th, 8th",   style:"Socratic, research, cross-curricular",     daily:"120–150 min",emoji:"🌳" },
  { id:"912",   label:"9–12 (ages 14+)", grades:"9th–12th",        style:"Seminar, deep dives, portfolio work",      daily:"150–180 min",emoji:"🎓" },
];

const ALL_SUBJECTS = [
  "Math","Early Math (Pre-K/K)","Reading & ELA","Phonics & Early Reading","Creative Writing",
  "Science","Nature & Environment","History & Social Studies","Geography",
  "Computer Science","Coding (Block-based)","Spanish","World Languages",
  "Visual Arts","Music","Physical Education","Life Skills & SEL",
  "Money & Finance","Philosophy & Critical Thinking","Full Day Schedule",
];

function CurriculumBuilder({ userId, onNeedCredits }) {
  const [mode, setMode]             = useState("builder"); // "builder" | "library"
  const [ageBand, setAgeBand]       = useState("35");
  const [subjects, setSubjects]     = useState(["Math"]);
  const [weeks, setWeeks]           = useState(4);
  const [style, setStyle]           = useState("balanced");
  const [dailyMin, setDailyMin]     = useState(120);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [justSaved, setJustSaved]   = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [library, setLibrary]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("neo_curricula") || "[]"); } catch { return []; }
  });

  const band = AGE_BANDS.find(b => b.id === ageBand);
  const isMulti = subjects.length > 1;

  const toggleSubject = (s) => {
    setSubjects(prev =>
      prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s]
    );
  };

  const build = async () => {
    useCredits(userId || "default", "curriculum_gen", COSTS.curriculum_gen);
    setLoading(true); setCurriculum(null); setError(null);
    try {
      const c = await genMultiCurriculum({ ageBand: band, subjects, weeks, style, dailyMin });
      setCurriculum(c);
    } catch (e) {
      setError("Couldn't generate — please try again. " + (e.message || ""));
    }
    setLoading(false);
  };

  const saveCurriculum = () => {
    const all = JSON.parse(localStorage.getItem("neo_curricula") || "[]");
    all.unshift({ id: Date.now(), date: new Date().toLocaleDateString(), ageBand: band?.label, subjects, weeks, curriculum });
    const trimmed = all.slice(0, 20);
    localStorage.setItem("neo_curricula", JSON.stringify(trimmed));
    setLibrary(trimmed);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const loadFromLibrary = (saved) => {
    setCurriculum(saved.curriculum);
    setSubjects(saved.subjects || ["Math"]);
    setWeeks(saved.weeks || 4);
    setMode("builder");
  };

  const deleteFromLibrary = (id) => {
    const trimmed = library.filter(c => c.id !== id);
    localStorage.setItem("neo_curricula", JSON.stringify(trimmed));
    setLibrary(trimmed);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="h2" style={{ marginBottom: 4 }}>📚 Curriculum Builder</h2>
      <p className="mu" style={{ fontSize: 12, marginBottom: 14 }}>
        Select one or multiple subjects. AI builds a connected weekly plan.
      </p>

      {/* Mode toggle: Builder | Library */}
      <div style={{ display:"flex", gap:0, marginBottom:14, background:"var(--p)", borderRadius:10, padding:3, width:"fit-content" }}>
        {[["builder","✨ Build new"], ["library", `📂 Library${library.length?" ("+library.length+")":""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            padding:"7px 16px", fontSize:12, fontWeight:600, borderRadius:8,
            background: mode === id ? "#fff" : "transparent",
            color: mode === id ? "var(--or)" : "var(--mu)",
            border: "none", cursor: "pointer",
            boxShadow: mode === id ? "0 1px 3px rgba(0,0,0,.08)" : "none",
          }}>{label}</button>
        ))}
      </div>

      {/* LIBRARY VIEW */}
      {mode === "library" && (
        <>
          {library.length === 0 ? (
            <div className="card" style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📂</div>
              <p style={{ fontWeight:600, marginBottom:5 }}>Your library is empty</p>
              <p className="mu" style={{ fontSize:13, marginBottom:14 }}>Build a curriculum and click 💾 Save to add it here.</p>
              <button className="btn bo" onClick={() => setMode("builder")}>← Back to builder</button>
            </div>
          ) : (
            library.map(saved => (
              <div key={saved.id} className="card" style={{ marginBottom:10, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{saved.curriculum?.weeks?.[0]?.title || `${saved.subjects?.join(" + ")}`}</span>
                      <span style={{ fontSize:10, color:"var(--mu)" }}>· {saved.date || "saved"}</span>
                    </div>
                    <p className="mu" style={{ fontSize:11.5, marginBottom:8 }}>
                      {saved.ageBand} · {saved.subjects?.join(", ")} · {saved.weeks} weeks
                    </p>
                    {saved.curriculum?.overview && (
                      <p style={{ fontSize:12, color:"var(--mu)", lineHeight:1.5, marginBottom:8 }}>{saved.curriculum.overview.slice(0,140)}{saved.curriculum.overview.length>140?"…":""}</p>
                    )}
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn bn sm" onClick={() => loadFromLibrary(saved)}>↑ Load</button>
                      <button className="btn bg sm" onClick={() => { if (confirm("Delete this curriculum?")) deleteFromLibrary(saved.id); }}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* BUILDER VIEW */}
      {mode === "builder" && (<>
      {/* Step 1: Age band */}
      <div className="card" style={{ marginBottom: 12 }}>
        <p className="lbl" style={{ marginBottom: 10 }}>Step 1 — Who is this for?</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AGE_BANDS.map(b => (
            <div key={b.id} onClick={() => setAgeBand(b.id)} style={{ cursor: "pointer", padding: "10px 14px", borderRadius: 12, border: `2px solid ${ageBand === b.id ? "var(--or)" : "var(--p2)"}`, background: ageBand === b.id ? "#fff8f0" : "#fff", transition: "all .2s" }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{b.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{b.label}</div>
              <div style={{ fontSize: 10, color: "var(--mu)", marginTop: 2 }}>{b.daily}/day</div>
            </div>
          ))}
        </div>
        {band && <p style={{ fontSize: 11, color: "var(--mu)", marginTop: 10 }}>📌 {band.style}</p>}
      </div>

      {/* Step 2: Subject multi-select */}
      <div className="card" style={{ marginBottom: 12 }}>
        <p className="lbl" style={{ marginBottom: 4 }}>Step 2 — Which subjects? <span style={{ fontWeight: 400, color: "var(--mu)" }}>(select one or more)</span></p>
        <p style={{ fontSize: 11, color: "var(--or)", marginBottom: 10 }}>
          {isMulti ? `✦ Generating integrated curriculum for: ${subjects.join(" + ")}` : "Tip: select multiple subjects for a connected weekly plan"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {ALL_SUBJECTS.map(s => (
            <div key={s} className={`pill${subjects.includes(s) ? " on" : ""}`}
              style={{ fontSize: 12 }}
              onClick={() => toggleSubject(s)}>
              {subjects.includes(s) ? "✓ " : ""}{s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Options */}
      <div className="card" style={{ marginBottom: 12 }}>
        <p className="lbl" style={{ marginBottom: 10 }}>Step 3 — Options</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div className="fg">
            <label className="lbl">Duration</label>
            <select className="sel inp" value={weeks} onChange={e => setWeeks(Number(e.target.value))}>
              {[1, 2, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n} week{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Approach</label>
            <select className="sel inp" value={style} onChange={e => setStyle(e.target.value)}>
              <option value="balanced">Balanced</option>
              <option value="play">Play-based</option>
              <option value="project">Project-based</option>
              <option value="mastery">Mastery-based</option>
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Daily time</label>
            <select className="sel inp" value={dailyMin} onChange={e => setDailyMin(Number(e.target.value))}>
              {[30, 45, 60, 90, 120, 150, 180].map(n => <option key={n} value={n}>{n} min</option>)}
            </select>
          </div>
        </div>
        <button className="btn bo" onClick={build} disabled={loading || subjects.length === 0}>
          {loading
            ? <><Spn /> Building {subjects.join(" + ")} curriculum…</>
            : `✦ Build ${isMulti ? "integrated" : ""} curriculum (${COSTS.curriculum_gen} credits)`}
        </button>
        {error && <p style={{ color: "var(--rd)", fontSize: 12, marginTop: 8 }}>{error} <button className="btn bg sm" onClick={build}>Retry</button></p>}
      </div>

      {/* Loading */}
      {loading && <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {[100, 85, 90, 78].map((w, i) => <div key={i} className="sh" style={{ height: 64, width: `${w}%` }} />)}
      </div>}

      {/* Result */}
      {curriculum && !loading && (
        <div className="fi">
          <div style={{ background: "var(--nv)", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{band?.emoji}</span>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  {band?.label} · {subjects.join(" + ")} · {weeks} wk
                </p>
                <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15, color: "rgba(255,255,255,.9)", lineHeight: 1.5, marginTop: 4 }}>{curriculum.overview}</p>
              </div>
            </div>
            {curriculum.dailySchedule && (
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "8px 12px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 3 }}>DAILY SCHEDULE</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>{curriculum.dailySchedule}</p>
              </div>
            )}
          </div>

          {/* Materials + differentiation */}
          {(curriculum.materials || curriculum.differentiationTips) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {curriculum.materials && <div className="card">
                <p className="lbl" style={{ marginBottom: 7 }}>🛠 Materials</p>
                {curriculum.materials.map((m, i) => <p key={i} style={{ fontSize: 12, marginBottom: 3 }}>· {m}</p>)}
              </div>}
              {curriculum.differentiationTips && <div className="card">
                <p className="lbl" style={{ marginBottom: 7 }}>♟ Differentiation</p>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--mu)" }}>{curriculum.differentiationTips}</p>
              </div>}
            </div>
          )}

          {/* Week cards */}
          {curriculum.weeks?.map((w, i) => (
            <div key={i} className="card fu" style={{ marginBottom: 10, animationDelay: `${i * .07}s` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--or)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{w.week}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15 }}>{w.title}</div>
                  {w.theme && <div style={{ fontSize: 11, color: "var(--mu)" }}>{w.theme}</div>}
                </div>
              </div>

              {/* Day-by-day weekly schedule (Mon-Fri grid) */}
              {w.days && Object.keys(w.days).length > 0 && (
                <div style={{ marginBottom:11 }}>
                  <p className="lbl" style={{ marginBottom:8 }}>📅 Day-by-day schedule</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:6 }}>
                    {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day => {
                      const blocks = w.days[day] || [];
                      return (
                        <div key={day} style={{ background:"var(--p)", borderRadius:9, padding:"8px 7px", minHeight:90 }}>
                          <p style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5, textAlign:"center" }}>{day.slice(0,3)}</p>
                          {blocks.map((b,bi) => (
                            <div key={bi} style={{ background:"#fff", borderRadius:6, padding:"4px 5px", marginBottom:3, fontSize:9, lineHeight:1.4 }}>
                              <div style={{ fontWeight:700, color:"var(--or)", fontSize:9 }}>{b.time}</div>
                              <div style={{ fontWeight:600, color:"var(--tx)" }}>{b.subject}</div>
                              <div style={{ color:"var(--mu)", fontSize:8.5, marginTop:1 }}>{b.activity?.length > 32 ? b.activity.slice(0,32)+"…" : b.activity}</div>
                              {b.tool && <button onClick={() => setActiveTool(resolveTool(b.tool))} style={{ color:"var(--bl)", fontSize:8, marginTop:1, fontWeight:500, background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline" }}>{b.tool} →</button>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Per-subject breakdown for multi-subject */}
              {w.bySubject && Object.entries(w.bySubject).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p className="lbl" style={{ marginBottom: 8 }}>By subject</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(w.bySubject).map(([subj, data]) => (
                      <div key={subj} style={{ background: "var(--p)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{subj}</span>
                          {data.tool && <button onClick={() => setActiveTool(resolveTool(data.tool))} style={{ fontSize: 10, background: "var(--nv)", color: "#fff", padding: "3px 9px", borderRadius: 99, border:"none", cursor:"pointer", fontWeight:600 }}>{data.tool} →</button>}
                        </div>
                        {data.objective && <p style={{ fontSize: 12, color: "var(--mu)", marginBottom: 3 }}>🎯 {data.objective}</p>}
                        {data.activity && <p style={{ fontSize: 12 }}>→ {data.activity}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single-subject objectives + activities fallback */}
              {w.objectives && !w.bySubject && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 9 }}>
                  <div>
                    <p className="lbl" style={{ marginBottom: 5 }}>Objectives</p>
                    {w.objectives?.map((o, j) => <p key={j} style={{ fontSize: 12, marginBottom: 3, paddingLeft: 10, borderLeft: "2px solid var(--or)", lineHeight: 1.5 }}>{o}</p>)}
                  </div>
                  <div>
                    <p className="lbl" style={{ marginBottom: 5 }}>Activities</p>
                    {w.activities?.map((a, j) => <div key={j} style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "var(--or)" }}>→</span><p style={{ fontSize: 12, lineHeight: 1.5 }}>{a}</p></div>)}
                  </div>
                </div>
              )}

              {w.assessment && <div style={{ background: "var(--p)", borderRadius: 9, padding: "7px 11px", marginBottom: 7 }}>
                <p style={{ fontSize: 12 }}><strong>Assessment:</strong> {w.assessment}</p>
              </div>}
              {/* Parent tip removed from Guide view — shown only on parent dashboard */}
            </div>
          ))}

          {curriculum.networkInsight && (
            <div style={{ background: "var(--p)", borderRadius: 11, padding: "10px 14px", marginBottom: 12, borderLeft: "3px solid var(--or)" }}>
              <p style={{ fontSize: 12 }}>💡 <strong>Network insight:</strong> {curriculum.networkInsight}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 9, alignItems:"center" }}>
            <button className="btn bn" onClick={saveCurriculum} disabled={justSaved}>
              {justSaved ? "✅ Saved to library!" : "💾 Save to library"}
            </button>
            <button className="btn bg" onClick={() => setCurriculum(null)}>Build another</button>
            {justSaved && <button className="btn bg sm" onClick={() => setMode("library")}>View library →</button>}
          </div>
        </div>
      )}
      </>)}
      {activeTool && <SimViewer tool={activeTool} onClose={() => setActiveTool(null)}/>}
    </div>
  );
}


// ── API KEY SETUP (for deployed version) ────────────────────────────────────
// ── CONNECT ACCOUNT NUDGE ────────────────────────────────────────────────────
// Only shown when credits drop below threshold — not on first load.
// Framed as "connect your Claude account" not "enter API key".
const NUDGE_THRESHOLD = 20; // show nudge when this many credits remain

function ConnectAccountNudge({ userId }) {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("neo_nudge_dismissed") === "true"
  );
  const [showModal, setShowModal] = useState(false);
  const creds = getCredits(userId || "demo");

  // Only show when low AND not dismissed AND no key yet
  const hasKey    = !!localStorage.getItem("neo_api_key");
  const isLow     = creds.balance < NUDGE_THRESHOLD;
  const shouldShow = isLow && !dismissed && !hasKey;

  if (!shouldShow) return null;

  const dismiss = () => {
    localStorage.setItem("neo_nudge_dismissed", "true");
    setDismissed(true);
  };

  return (
    <>
      {/* Soft banner — not blocking */}
      <div style={{ background:"linear-gradient(90deg,#fff8f0,#fff)", borderBottom:"1px solid var(--p2)", padding:"9px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <span style={{ fontSize:18 }}>⚡</span>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:12.5, fontWeight:600 }}>You're almost out of free credits. </span>
          <span style={{ fontSize:12, color:"var(--mu)" }}>Connect your Anthropic account to keep generating — uses your existing Claude.ai credits.</span>
        </div>
        <button className="btn bo sm" onClick={() => setShowModal(true)}>Connect account</button>
        <button onClick={dismiss} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--mu)", fontSize:18, lineHeight:1 }}>×</button>
      </div>

      {/* One-click connect modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={() => setShowModal(false)}>
          <div className="card pi" style={{ maxWidth:420, width:"100%", padding:"28px 24px" }} onClick={e => e.stopPropagation()}>

            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"var(--nv)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2.8" fill="white"/>
                  <path d="M10 2C10 2 14 5 14 10C14 15 10 18 10 18" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M10 2C10 2 6 5 6 10C6 15 10 18 10 18" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M2 10H18" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:500 }}>Connect your account</h2>
                <p className="mu" style={{ fontSize:13 }}>Use your existing Claude.ai credits</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--mu)" }}>×</button>
            </div>

            <div style={{ background:"var(--p)", borderRadius:12, padding:"14px 16px", marginBottom:18 }}>
              <p style={{ fontSize:13, lineHeight:1.7 }}>
                If you have a <strong>Claude.ai</strong> or <strong>Anthropic</strong> account, grab your API key from the console. It takes 30 seconds.
              </p>
            </div>

            {/* Key steps */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
              {[
                { n:1, label:"Go to Anthropic Console", action:"Open →", href:"https://console.anthropic.com/settings/keys" },
                { n:2, label:"Create a new API key (free)", action:null },
                { n:3, label:"Paste it here — stored only in your browser", action:null },
              ].map(s => (
                <div key={s.n} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--nv)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{s.n}</div>
                  <span style={{ flex:1, fontSize:13 }}>{s.label}</span>
                  {s.href && <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn bo sm" style={{ textDecoration:"none" }}>{s.action}</a>}
                </div>
              ))}
            </div>

            <ConnectKeyForm onSaved={() => { setShowModal(false); dismiss(); }} />

            <p style={{ textAlign:"center", fontSize:11, color:"var(--mu)", marginTop:12 }}>
              🔒 Key stored locally only · Never shared · Same account as Claude.ai
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ConnectKeyForm({ onSaved }) {
  const [key, setKey]   = useState("");
  const [saved, setSaved] = useState(!!localStorage.getItem("neo_api_key"));
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const save = () => {
    const k = key.trim();
    if (!k) { alert("Please paste your API key"); return; }
    // Accept any key starting with sk-ant or sk- (be lenient for demo)
    localStorage.setItem("neo_api_key", k);
    setSaved(true);
    setTimeout(() => onSaved?.(), 800);
  };

  const clear = () => { localStorage.removeItem("neo_api_key"); setSaved(false); setKey(""); };

  if (saved) return (
    <div style={{ background:"#dff2ea", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:"var(--sg)", fontWeight:700, fontSize:16 }}>✓</span>
      <div style={{ flex:1 }}><p style={{ fontSize:13, fontWeight:600, color:"var(--sg)" }}>Connected! AI generation active.</p></div>
      <button onClick={clear} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--mu)" }}>Change</button>
    </div>
  );

  return (
    <div style={{ display:"flex", gap:8 }}>
      <input ref={inputRef} className="inp" type="password" style={{ flex:1, fontSize:13 }}
        placeholder="sk-ant-api03-…"
        value={key} onChange={e => setKey(e.target.value)}
        onKeyDown={e => e.key === "Enter" && save()} />
      <button className="btn bn" onClick={save} disabled={!key.trim()}>Connect →</button>
    </div>
  );
}

// ── LEARNING TRAJECTORY (Renaissance Learning STAR-style) ────────────────────
function LearningTrajectory({ studentName, studentGrade, mem }) {
  const studentGradeNum = gradeToNum(studentGrade || "Kindergarten");
  const isEarlyLearner  = studentGradeNum <= 2;  // K, 1st, 2nd

  // Grade-appropriate mock data — younger kids get emergent skill levels
  const subjects = isEarlyLearner ? [
    { name:"Early Math",    emoji:"🔢", color:"var(--or)", scaledScore:485, percentileRank:68, gradeEquiv:`K.${studentGradeNum===0?3:8}`, sgp:72, status:"on-track",    zpd:"Number recognition 1–20" },
    { name:"Phonics & Reading", emoji:"📖", color:"var(--bl)", scaledScore:512, percentileRank:74, gradeEquiv:`K.${studentGradeNum===0?5:9}`, sgp:80, status:"above-grade", zpd:"Beginning letter-sound fluency" },
    { name:"Curiosity & Inquiry", emoji:"🔬", color:"var(--sg)", scaledScore:540, percentileRank:82, gradeEquiv:"1.1", sgp:78, status:"above-grade", zpd:"Asking 'why' questions" },
    { name:"Fine Motor & Writing", emoji:"✍️", color:"var(--pu)", scaledScore:445, percentileRank:54, gradeEquiv:`K.${studentGradeNum===0?2:5}`, sgp:62, status:"developing", zpd:"Letter formation" },
  ] : [
    { name:"Math",     emoji:"🔢", color:"var(--or)", scaledScore:712, percentileRank:74, gradeEquiv:`${Math.max(studentGradeNum,1)+1}.4`, sgp:68, status:"on-track",       zpd:"650–780L equivalent" },
    { name:"Reading",  emoji:"📖", color:"var(--bl)", scaledScore:685, percentileRank:62, gradeEquiv:`${Math.max(studentGradeNum,1)}.8`,    sgp:71, status:"on-track",       zpd:"600–720L Lexile" },
    { name:"Science",  emoji:"🔬", color:"var(--sg)", scaledScore:740, percentileRank:81, gradeEquiv:`${Math.max(studentGradeNum,1)+1}.6`, sgp:78, status:"above-grade",    zpd:"690–790 NSC" },
    { name:"Writing",  emoji:"✍️", color:"var(--pu)", scaledScore:625, percentileRank:48, gradeEquiv:`${Math.max(studentGradeNum,1)}.2`,    sgp:55, status:"developing",     zpd:"580–680 SS" },
  ];
  const overallPR  = Math.round(subjects.reduce((a,s)=>a+s.percentileRank,0) / subjects.length);
  const overallSGP = Math.round(subjects.reduce((a,s)=>a+s.sgp,0) / subjects.length);
  const collegeReady = studentGradeNum >= 6;
  // K/1 developmental milestones replace exam readiness
  const developmentalMilestones = [
    { milestone:"Identifies all uppercase letters",     met:true,  category:"Reading" },
    { milestone:"Counts to 100 by 1s and 10s",          met:true,  category:"Math" },
    { milestone:"Writes own first name",                met:true,  category:"Writing" },
    { milestone:"Reads CVC words (cat, dog, run)",      met:overallPR>=60, category:"Reading" },
    { milestone:"Adds within 10 with manipulatives",    met:overallPR>=65, category:"Math" },
    { milestone:"Listens to a 10-min story attentively",met:overallPR>=55, category:"Focus" },
    { milestone:"Tells a 3-part story orally",          met:overallPR>=70, category:"Language" },
    { milestone:"Asks open-ended 'why' questions",      met:overallPR>=75, category:"Curiosity" },
  ];

  return (
    <div>
      {/* Hero overall card */}
      <div className="card fu" style={{ marginBottom:12, background:"linear-gradient(135deg,var(--nv) 0%,#1a1f3a 100%)", border:"none" }}>
        <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".09em", marginBottom:8 }}>{studentName}'s learning trajectory</p>
        <div style={{ display:"flex", gap:14, marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:38, fontWeight:500, color:"#fff", lineHeight:1 }}>{overallPR}<span style={{ fontSize:18, color:"rgba(255,255,255,.5)" }}>th</span></div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:5 }}>National percentile<br/>(vs peers in {studentGrade || "their grade"})</p>
          </div>
          <div style={{ flex:1, borderLeft:"1px solid rgba(255,255,255,.1)", paddingLeft:14 }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:38, fontWeight:500, color:overallSGP>=70?"#80f3a2":"#fff", lineHeight:1 }}>{overallSGP}</div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:5 }}>Growth percentile<br/>{overallSGP>=70?"🚀 Outpacing peers":"On-pace with peers"}</p>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.08)", borderRadius:9, padding:"8px 11px" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.7)", lineHeight:1.5 }}>
            <strong style={{ color:"#fff" }}>What this means:</strong> {studentName} {isEarlyLearner ? `is developing core skills faster than ${overallPR}% of ${studentGrade || "their grade"} peers nationally. ${overallSGP>=70 ? "Growth is strong." : "On a healthy growth pace."}` : `performs better than ${overallPR}% of ${studentGrade || "their grade"} students nationally, and is growing ${overallSGP>=70?"faster than":"in line with"} peers who started at similar levels.`}
          </p>
        </div>
      </div>

      {/* Per-subject scaled score + percentile + grade equivalent */}
      <div className="card fu d1" style={{ marginBottom:12 }}>
        <p className="lbl" style={{ marginBottom:11 }}>📊 {isEarlyLearner ? "Skill-area" : "Subject-level"} breakdown</p>
        {subjects.map((s,i) => (
          <div key={i} style={{ marginBottom:11, paddingBottom:i<subjects.length-1?11:0, borderBottom:i<subjects.length-1?"1px solid var(--p)":"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
              <span style={{ fontSize:18 }}>{s.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{s.name}</span>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, fontWeight:600,
                    background: s.status==="above-grade"?"#fdf3d0":s.status==="on-track"?"#dff2ea":"#ddeeff",
                    color: s.status==="above-grade"?"var(--am)":s.status==="on-track"?"var(--sg)":"var(--bl)"
                  }}>{s.status==="above-grade"?"🌟 Above grade":s.status==="on-track"?"✓ On-track":"📈 Developing"}</span>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.percentileRank}<span style={{ fontSize:9, color:"var(--mu)" }}>th %ile</span></div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:6 }}>
              <div style={{ background:"var(--p)", borderRadius:7, padding:"5px 8px", textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.scaledScore}</div>
                <div style={{ fontSize:9, color:"var(--mu)" }}>Scaled score</div>
              </div>
              <div style={{ background:"var(--p)", borderRadius:7, padding:"5px 8px", textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{s.gradeEquiv}</div>
                <div style={{ fontSize:9, color:"var(--mu)" }}>Grade equiv.</div>
              </div>
              <div style={{ background:"var(--p)", borderRadius:7, padding:"5px 8px", textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, color:s.sgp>=70?"var(--sg)":s.sgp>=50?"var(--or)":"var(--am)" }}>{s.sgp}</div>
                <div style={{ fontSize:9, color:"var(--mu)" }}>Growth %ile</div>
              </div>
            </div>
            <PBar v={s.percentileRank} c={s.color} h={4}/>
            <p style={{ fontSize:10, color:"var(--mu)", marginTop:4 }}>
              {isEarlyLearner ? "Currently working on" : "ZPD"}: {s.zpd} · {s.percentileRank>=70?`Top ${100-s.percentileRank}% nationally`:s.percentileRank>=40?"Solid for age":"Building foundations"}
            </p>
          </div>
        ))}
      </div>

      {/* Next milestone — motivational */}
      <div className="card fu d2" style={{ marginBottom:12, borderLeft:"3px solid var(--or)" }}>
        <p className="lbl" style={{ color:"var(--or)", marginBottom:9 }}>🎯 Next milestone</p>
        {subjects.filter(s=>s.percentileRank<90).slice(0,2).map((s,i)=>{
          const nextPR = Math.min(s.percentileRank + (s.percentileRank<50?15:s.percentileRank<75?10:5), 99);
          return (
            <div key={i} style={{ display:"flex", gap:11, padding:"8px 0", borderBottom:i<1?"1px solid var(--p)":"none" }}>
              <span style={{ fontSize:18 }}>{s.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{isEarlyLearner ? `Strengthen ${s.name.toLowerCase()}` : `Move ${s.name} from ${s.percentileRank}th → ${nextPR}th percentile`}</p>
                <p style={{ fontSize:11, color:"var(--mu)", lineHeight:1.5 }}>
                  {isEarlyLearner ? `Practice ${s.zpd.toLowerCase()} for 10-15 min/day with the AI tutor` : `Master ${Math.ceil((nextPR-s.percentileRank)/3)} more skills with the AI ${s.name.toLowerCase()} tutor · ~${(nextPR-s.percentileRank)*8} min focused practice`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Developmental milestones for K-2 OR college readiness for grade 6+ */}
      {isEarlyLearner ? (
        <div className="card fu d3" style={{ marginBottom:12, background:"linear-gradient(135deg,#fff8f0,#fff)", borderLeft:"3px solid var(--sg)" }}>
          <p className="lbl" style={{ color:"var(--sg)", marginBottom:9 }}>🌱 Developmental milestones</p>
          <p style={{ fontSize:12, color:"var(--mu)", marginBottom:10 }}>Age-appropriate skills children typically develop in K-1.</p>
          {developmentalMilestones.map((m,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", borderBottom:i<developmentalMilestones.length-1?"1px solid var(--p)":"none" }}>
              <span style={{ width:18, height:18, borderRadius:"50%", background:m.met?"var(--sg)":"var(--p2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{m.met?"✓":"…"}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12.5, fontWeight:m.met?500:600, color:m.met?"var(--mu)":"var(--tx)", textDecoration:m.met?"line-through":"none" }}>{m.milestone}</p>
              </div>
              <span style={{ fontSize:10, color:"var(--mu)", fontStyle:"italic" }}>{m.category}</span>
            </div>
          ))}
        </div>
      ) : collegeReady ? (
        <div className="card fu d3" style={{ marginBottom:12, background:"linear-gradient(135deg,#fff8f0,#fff)", borderLeft:"3px solid var(--am)" }}>
          <p className="lbl" style={{ color:"var(--am)", marginBottom:9 }}>🎓 College & exam readiness</p>
          <p style={{ fontSize:12, color:"var(--mu)", marginBottom:10 }}>Based on Renaissance Learning research, STAR scores correlate with college entrance exams from grade 6 onward.</p>
          {[
            { exam:"SAT (projected)",        target:"1280+", current:`${1100+overallPR*3}`, ready:overallPR>=70 },
            { exam:"ACT (projected)",        target:"26+",   current:`${22+Math.floor(overallPR/15)}`, ready:overallPR>=70 },
            { exam:"State assessment",       target:"Proficient", current:overallPR>=40?"Proficient":"Approaching", ready:overallPR>=40 },
            { exam:"AP-readiness (Math/Sci)", target:"Yes", current:overallPR>=80?"Strong candidate":"Building toward", ready:overallPR>=80 },
          ].map((e,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<3?"1px solid var(--p)":"none" }}>
              <span style={{ width:18, height:18, borderRadius:"50%", background:e.ready?"var(--sg)":"var(--p2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{e.ready?"✓":"…"}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12.5, fontWeight:600 }}>{e.exam}</p>
                <p style={{ fontSize:11, color:"var(--mu)" }}>Current trajectory: {e.current} · Target: {e.target}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card fu d3" style={{ marginBottom:12, background:"var(--p)" }}>
          <p style={{ fontSize:12, color:"var(--mu)", lineHeight:1.6 }}>
            🎓 <strong>Future college readiness</strong> — From grade 6, we show projected SAT/ACT trajectory based on Renaissance Learning research. For now, focus is building strong foundational skills.
          </p>
        </div>
      )}

      <p style={{ textAlign:"center", fontSize:10, color:"var(--mu)", lineHeight:1.6, marginTop:12 }}>
        Methodology inspired by Renaissance Learning's STAR Assessment system · Scaled Score uses 0-1400 scale ·<br/>Percentile Rank compares to national grade-level peers · SGP measures growth vs similar starters
      </p>
    </div>
  );
}

// ── SIM VIEWER MODAL ─────────────────────────────────────────────────────────
function SimViewer({ tool, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);

  // Some iframes time out silently — detect via load event
  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:3000, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"var(--nv)", padding:"10px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <span style={{ fontSize:22 }}>{tool.emoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:600, fontSize:14 }}>{tool.label}</div>
          <div style={{ color:"rgba(255,255,255,.5)", fontSize:11 }}>{tool.cat} · {tool.grades} · {tool.subject}</div>
        </div>
        {tool.github && (
          <a href={tool.github} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.12)", borderRadius:99, padding:"5px 12px", color:"rgba(255,255,255,.8)", fontSize:12, fontWeight:500, textDecoration:"none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        )}
        <a href={tool.url.replace("?embed","")} target="_blank" rel="noopener noreferrer"
          style={{ background:"rgba(255,255,255,.12)", borderRadius:99, padding:"5px 12px", color:"rgba(255,255,255,.8)", fontSize:12, fontWeight:500, textDecoration:"none" }}>
          ↗ Open full
        </a>
        <button onClick={onClose}
          style={{ background:"rgba(255,255,255,.12)", border:"none", cursor:"pointer", color:"#fff", width:32, height:32, borderRadius:8, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
          ×
        </button>
      </div>

      {/* Sim description strip */}
      <div style={{ background:"var(--p)", padding:"6px 18px", fontSize:12, color:"var(--mu)", flexShrink:0 }}>
        {tool.desc}
        {!tool.embed && <span style={{ marginLeft:10, color:"var(--rd)", fontWeight:600 }}>⚠ This provider blocks embedding — use "Open full" ↗ above</span>}
      </div>

      {/* Iframe */}
      <div style={{ flex:1, position:"relative", background:"#fff" }}>
        {!loaded && !error && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--cr)", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"var(--nv)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div className="spn"/>
            </div>
            <p style={{ fontSize:13, color:"var(--mu)" }}>Loading {tool.label}…</p>
          </div>
        )}
        {tool.embed ? (
          <iframe
            src={tool.url}
            title={tool.label}
            style={{ width:"100%", height:"100%", border:"none" }}
            allow="fullscreen; accelerometer; autoplay"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, background:"var(--cr)" }}>
            <span style={{ fontSize:48 }}>{tool.emoji}</span>
            <h2 className="h2">{tool.label}</h2>
            <p className="mu" style={{ fontSize:14, maxWidth:400, textAlign:"center", lineHeight:1.7 }}>{tool.desc}</p>
            <p style={{ fontSize:12, color:"var(--mu)", background:"var(--p)", borderRadius:10, padding:"8px 16px" }}>
              This provider doesn't allow direct embedding. Click "Open full" to launch in a new tab.
            </p>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn bo" style={{ textDecoration:"none", fontSize:15, padding:"13px 28px" }}>
              Open {tool.label} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONTENT PROVIDERS ─────────────────────────────────────────────────────────
function ContentProviders({ onOpenTool }) {
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState("subjects"); // "subjects" | "providers"
  const subjects = ["All", ...new Set(TOOLS.map(t => t.subject).filter(Boolean))];
  const filtered = filter === "All" ? TOOLS : TOOLS.filter(t => t.subject === filter);
  const isForTeachers = !onOpenTool; // in Guide portal without click handler = teacher reference view

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="h2" style={{ marginBottom: 4 }}>🛠 Learning Tools</h2>
      <p className="mu" style={{ fontSize: 12, marginBottom: 4 }}>
        {TOOLS.length} interactive tools · Click any card to launch inside neoschool.
      </p>
      {isForTeachers && <div style={{ background:"var(--p)", borderRadius:10, padding:"8px 12px", marginBottom:14, fontSize:12, color:"var(--mu)" }}>
        💡 These tools are for your <strong>students</strong> to use — you can assign them in Curriculum Builder or recommend them from Student Insights.
      </div>}

      {/* Subject filter — more intuitive than provider */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {subjects.map(s => (
          <div key={s} className={`pill${filter===s?" on":""}`} style={{ fontSize:11 }} onClick={() => setFilter(s)}>{s}</div>
        ))}
      </div>

      {/* Tools grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
        {filtered.map((t, i) => (
          <div key={t.id} className="card fu" style={{ animationDelay:`${i*.03}s`, cursor:"pointer", padding:"14px 16px", transition:"transform .2s,box-shadow .2s", border:`1.5px solid ${t.color}22` }}
            onClick={() => onOpenTool?.(t)}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${t.color}22`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${t.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0 }}>{t.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:1 }}>{t.label}</div>
                <div style={{ fontSize:10, color:"var(--mu)" }}>{t.grades} · {t.subject}</div>
              </div>
              <div style={{ flexShrink:0 }}>
                {t.embed
                  ? <span style={{ fontSize:10, background:"#dff2ea", color:"var(--sg)", padding:"2px 7px", borderRadius:99, fontWeight:700 }}>▶ Embed</span>
                  : <span style={{ fontSize:10, background:"#ddeeff", color:"var(--bl)", padding:"2px 7px", borderRadius:99, fontWeight:700 }}>↗ Link</span>}
              </div>
            </div>
            <p style={{ fontSize:11.5, color:"var(--mu)", lineHeight:1.5, marginBottom:8 }}>{t.desc}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:600, color:t.color }}>{t.subject}</span>
              <div style={{ display:"flex", gap:5 }}>
                {t.github && (
                  <a href={t.github} target="_blank" rel="noopener noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{ fontSize:10, background:"var(--p)", color:"var(--mu)", padding:"3px 7px", borderRadius:99, textDecoration:"none", fontWeight:500 }}>
                    GitHub
                  </a>
                )}
                <span style={{ fontSize:11, background:t.color, color:"#fff", padding:"3px 9px", borderRadius:99, fontWeight:600 }}>
                  {t.embed ? "Launch →" : "Open ↗"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider status table */}
      <div className="card">
        <p className="lbl" style={{ marginBottom:12 }}>Connected platform APIs</p>
        {CONTENT_PROVIDERS.map((p, i) => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<CONTENT_PROVIDERS.length-1?"1px solid var(--p)":"none" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>{p.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
              <div style={{ fontSize:11, color:"var(--mu)" }}>{p.desc}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:p.active?"#dff2ea":"var(--p)", color:p.active?"var(--sg)":"var(--mu)", marginBottom:3 }}>
                {p.active ? "✓ Active" : "Coming soon"}
              </div>
              <div style={{ fontSize:10, color:"var(--mu)" }}>{p.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APPLICATION SCREEN ───────────────────────────────────────────────────────
function ApplicationScreen({ user, data, onDone }) {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const { form: od, curriculum } = data || {};
  const fallbackName = od?.childName || "your child";

  const [form, setForm] = useState({
    parentFirstName:"", parentLastName:"", parentEmail:user?.email || "", parentPhone:"",
    parentRelationship:"", streetAddress:"", city:"", state:"MT", zip:"",
    childFirstName: od?.childName?.split(" ")[0] || "",
    childLastName:"", childPreferredName:"", childGender:"", childDOB:"",
    childCurrentGrade: od?.grade || "", childCurrentSchool:"", desiredStart:"September 2026",
    hear:"", referredBy:"", inspiration:"", familyInfo:"",
    hasIEP:"", accommodations:"",
    ackLearningNeeds:false, ackTuition:false, ackSMS:false,
  });
  const up = (k,v) => setForm(f => ({...f,[k]:v}));
  const childName = form.childPreferredName || form.childFirstName || fallbackName;

  const canStep1 = form.parentFirstName && form.parentLastName && form.parentEmail && form.parentPhone && form.parentRelationship && form.streetAddress && form.zip;
  const canStep2 = form.childFirstName && form.childLastName && form.childGender && form.childDOB && form.childCurrentGrade && form.desiredStart;
  const canStep3 = form.inspiration && form.familyInfo && form.hasIEP && (form.hasIEP === "no" || form.accommodations);
  const canSubmit = canStep1 && canStep2 && canStep3 && form.ackLearningNeeds && form.ackTuition;

  if (submitted) return (
    <div style={{ height:"100%", overflowY:"auto", padding:"32px 16px 48px" }}>
      <div style={{ maxWidth:460, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
        <h1 className="h1" style={{ marginBottom:8 }}>Application submitted!</h1>
        <p className="mu" style={{ fontSize:14, lineHeight:1.65, marginBottom:24 }}>Thank you for applying for {childName}. Here's what happens next.</p>
        <div style={{ background:"#fff", borderRadius:14, padding:"16px 14px", marginBottom:18, textAlign:"left", border:"1px solid var(--p2)" }}>
          <p className="lbl" style={{ marginBottom:14 }}>The enrollment journey</p>
          {[
            { lbl:"Application submitted",                                          done:true,  detail:"You're here ✓" },
            { lbl:"Acceptance decision within 48 hours",                            done:false, detail:"Campus Director reviews your application" },
            { lbl:"If accepted, $500 deposit due",                                  done:false, detail:"Applied toward first month's tuition · refundable until 30 days before start" },
            { lbl:"Welcome packet delivered",                                       done:false, detail:"Calendar, supply list, family handbook, parent group invite" },
            { lbl:`${childName} completes the standard learning assessment`,        done:false, detail:"Skill level across math, reading, writing · 30 min, online" },
            { lbl:"Guide assigned + intro session scheduled",                       done:false, detail:"You meet your child's primary Guide before day 1" },
            { lbl:"First day — learning begins!",                                   done:false, detail:"September 2026 · your campus" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:i<6?"1px solid var(--p)":"none" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:s.done?"var(--sg)":"var(--p)", color:s.done?"#fff":"var(--mu)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{s.done ? "✓" : i+1}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:s.done?"var(--sg)":"var(--tx)", lineHeight:1.4 }}>{s.lbl}</p>
                <p style={{ fontSize:11, color:"var(--mu)", marginTop:1, lineHeight:1.5 }}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn bo fw" onClick={onDone}>Go to {childName}'s dashboard →</button>
        <p style={{ fontSize:11, color:"var(--mu)", marginTop:12 }}>Confirmation sent to <strong>{form.parentEmail}</strong> · Questions? <strong>admissions@neoschool.me</strong></p>
      </div>
    </div>
  );

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"24px 16px 48px" }}>
      <div style={{ maxWidth:460, margin:"0 auto" }}>
        <Logo sz={14}/>
        <div style={{ marginTop:18, marginBottom:18 }}>
          <h1 className="h1" style={{ marginBottom:4 }}>Apply to neoschool</h1>
          <p className="mu" style={{ fontSize:13 }}>Founding family application · Founding family 2026–2027</p>
        </div>
        <div style={{ background:"var(--p)", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
          <p style={{ fontSize:12.5, lineHeight:1.6, color:"var(--mu)" }}>
            We are actively enrolling, offering an enriching educational experience. Questions about the admissions process? <strong>admissions@neoschool.me</strong>
          </p>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:18 }}>
          {[1,2,3,4].map(n => (<div key={n} style={{ flex:1, height:5, borderRadius:99, background:step>=n?"var(--or)":"var(--p2)" }}/>))}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:14 }}>
          Step {step} of 4 · {["Parent info","Child info","Family context","Acknowledgments"][step-1]}
        </p>

        {step === 1 && (
          <div className="card">
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">First name *</label><input className="inp" value={form.parentFirstName} onChange={e=>up("parentFirstName",e.target.value)}/></div>
                <div className="fg"><label className="lbl">Last name *</label><input className="inp" value={form.parentLastName} onChange={e=>up("parentLastName",e.target.value)}/></div>
              </div>
              <div className="fg"><label className="lbl">Email *</label><input className="inp" type="email" value={form.parentEmail} onChange={e=>up("parentEmail",e.target.value)}/></div>
              <div className="fg"><label className="lbl">Phone *</label><input className="inp" placeholder="+1 (406) 555-0100" value={form.parentPhone} onChange={e=>up("parentPhone",e.target.value)}/></div>
              <div className="fg">
                <label className="lbl">Relationship to student *</label>
                <select className="sel inp" value={form.parentRelationship} onChange={e=>up("parentRelationship",e.target.value)}>
                  <option value="">Select</option>
                  {["Mother","Father","Parent","Guardian","Grandparent","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="fg"><label className="lbl">Street address *</label><input className="inp" placeholder="123 Main St" value={form.streetAddress} onChange={e=>up("streetAddress",e.target.value)}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">City *</label><input className="inp" value={form.city} onChange={e=>up("city",e.target.value)}/></div>
                <div className="fg"><label className="lbl">State *</label><input className="inp" value={form.state} onChange={e=>up("state",e.target.value)}/></div>
                <div className="fg"><label className="lbl">ZIP *</label><input className="inp" placeholder="59801" value={form.zip} onChange={e=>up("zip",e.target.value)}/></div>
              </div>
              <button className="btn bo fw" onClick={() => setStep(2)} disabled={!canStep1}>Next: child info →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div className="fg"><label className="lbl">Child's first name *</label><input className="inp" value={form.childFirstName} onChange={e=>up("childFirstName",e.target.value)}/></div>
                <div className="fg"><label className="lbl">Child's last name *</label><input className="inp" value={form.childLastName} onChange={e=>up("childLastName",e.target.value)}/></div>
              </div>
              <div className="fg"><label className="lbl">Preferred name <span style={{ fontWeight:400, color:"var(--mu)" }}>(optional)</span></label><input className="inp" placeholder="What we'll call them in class" value={form.childPreferredName} onChange={e=>up("childPreferredName",e.target.value)}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div className="fg">
                  <label className="lbl">Gender *</label>
                  <select className="sel inp" value={form.childGender} onChange={e=>up("childGender",e.target.value)}>
                    <option value="">Select</option>
                    {["Female","Male","Non-binary","Prefer not to say"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="fg"><label className="lbl">Date of birth *</label><input className="inp" type="date" value={form.childDOB} onChange={e=>up("childDOB",e.target.value)}/></div>
              </div>
              <div className="fg">
                <label className="lbl">Current grade level *</label>
                <select className="sel inp" value={form.childCurrentGrade} onChange={e=>up("childCurrentGrade",e.target.value)}>
                  <option value="">Select</option>
                  {["Pre-K","Kindergarten","1st Grade","2nd Grade","3rd Grade","4th Grade","5th Grade","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="fg"><label className="lbl">Current school <span style={{ fontWeight:400, color:"var(--mu)" }}>(or "Homeschool" / "Not yet enrolled")</span></label><input className="inp" value={form.childCurrentSchool} onChange={e=>up("childCurrentSchool",e.target.value)}/></div>
              <div className="fg">
                <label className="lbl">Desired enrollment date *</label>
                <select className="sel inp" value={form.desiredStart} onChange={e=>up("desiredStart",e.target.value)}>
                  {["September 2026","January 2027","September 2027"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn bg" onClick={() => setStep(1)}>← Back</button>
                <button className="btn bo" style={{ flex:1 }} onClick={() => setStep(3)} disabled={!canStep2}>Next: family context →</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div className="fg">
                <label className="lbl">What inspired you to apply, and which elements of our learning approach are you most excited about? *</label>
                <textarea className="ta inp" rows={4} placeholder="The 2-hour academic block, the outdoor play, the AI tutors, the project-based approach…" value={form.inspiration} onChange={e=>up("inspiration",e.target.value)}/>
              </div>
              <div className="fg">
                <label className="lbl">Anything you'd like us to know about your child or family? *</label>
                <textarea className="ta inp" rows={3} placeholder="Learning style, interests, family situation, anything we should know…" value={form.familyInfo} onChange={e=>up("familyInfo",e.target.value)}/>
              </div>
              <div className="fg">
                <label className="lbl">Does your child have an IEP, 504 Plan, or behavior/learning plan? *</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["yes","Yes"],["no","No"]].map(([v,l]) => (
                    <div key={v} onClick={() => up("hasIEP",v)} style={{ flex:1, textAlign:"center", padding:"10px", borderRadius:9, cursor:"pointer", border:`2px solid ${form.hasIEP===v?"var(--or)":"var(--p2)"}`, background:form.hasIEP===v?"#fff8f0":"#fff", fontWeight:600, fontSize:13 }}>{l}</div>
                  ))}
                </div>
              </div>
              {form.hasIEP === "yes" && (
                <div className="fg">
                  <label className="lbl">Please share details about any accommodations *</label>
                  <textarea className="ta inp" rows={3} placeholder="Type of plan, key supports needed, contact for current school's support team…" value={form.accommodations} onChange={e=>up("accommodations",e.target.value)}/>
                </div>
              )}
              <div className="fg">
                <label className="lbl">How did you hear about us?</label>
                <select className="sel inp" value={form.hear} onChange={e=>up("hear",e.target.value)}>
                  <option value="">Select</option>
                  {["Friend/family referral","Instagram","Google","Podcast","Community event","School fair","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="lbl">Who referred you? <span style={{ fontWeight:400, color:"var(--mu)" }}>(optional — they get a thank-you!)</span></label>
                <input className="inp" placeholder="e.g. Sarah Chen" value={form.referredBy} onChange={e=>up("referredBy",e.target.value)}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn bg" onClick={() => setStep(2)}>← Back</button>
                <button className="btn bo" style={{ flex:1 }} onClick={() => setStep(4)} disabled={!canStep3}>Next: acknowledgments →</button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <p style={{ fontSize:12.5, color:"var(--mu)", marginBottom:14, lineHeight:1.65 }}>Please review and acknowledge each statement below.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { key:"ackLearningNeeds", required:true, text:"I acknowledge that learning or behavioral needs must be disclosed during admissions, and documentation must be uploaded upon enrollment. I understand the school is not equipped to meet the needs of students requiring intensive behavioral, therapeutic, or one-to-one academic support. The program is designed for students functioning within a typical range of ability and independence. If significant challenges arise after enrollment, I understand the school will meet with my family to determine school fit." },
                { key:"ackTuition", required:true, text:"I acknowledge the school's current annual base tuition rate and the available financial offering. neoschool is proud to offer founding-family tuition credits at our flagship your campus. At this time, general financial aid is not available." },
                { key:"ackSMS", required:false, text:"I agree to receive automated text messages at the phone number provided, sent by neoschool regarding inquiry follow-ups, event invitations, and personalized updates about applications and enrollment. Message & data rates may apply. Reply HELP for help and STOP to cancel." },
              ].map(item => (
                <label key={item.key} style={{ display:"flex", gap:10, cursor:"pointer", padding:"10px 12px", background:form[item.key]?"#fff8f0":"#fff", borderRadius:11, border:`1px solid ${form[item.key]?"var(--or)":"var(--p2)"}`, transition:"all .2s" }}>
                  <input type="checkbox" style={{ marginTop:3, accentColor:"var(--or)" }} checked={form[item.key]} onChange={e=>up(item.key,e.target.checked)}/>
                  <p style={{ fontSize:11.5, lineHeight:1.55, flex:1 }}>{item.text} {item.required && <span style={{ color:"var(--or)", fontWeight:700 }}>*</span>}</p>
                </label>
              ))}
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn bg" onClick={() => setStep(3)}>← Back</button>
                <button className="btn bo" style={{ flex:1 }} onClick={() => setSubmitted(true)} disabled={!canSubmit}>Submit application →</button>
              </div>
              <button className="btn bg fw" onClick={onDone}>Skip — explore the platform first</button>
            </div>
          </div>
        )}
        <p style={{ textAlign:"center", fontSize:11, color:"var(--mu)", marginTop:12 }}>🔒 COPPA & FERPA compliant · neoschool.me </p>
      </div>
    </div>
  );
}


// ── STUDENT LIGHT ONBOARDING + ASSESSMENT ────────────────────────────────────
function StudentAssessment({ onDone }) {
  const [phase, setPhase]     = useState("info"); // "info" | "assess"
  const [qIndex, setQIndex]   = useState(0);
  const [name, setName]       = useState(localStorage.getItem("neo_child_name") || "");
  const [grade, setGrade]     = useState("");
  const [answers, setAnswers] = useState([]);

  const questions = [
    { q:"What is 7 + 8?",        choices:["13","15","16","14"], correct:1 },
    { q:"What is 6 × 7?",        choices:["36","42","48","40"], correct:1 },
    { q:"What is 3/4 + 1/2?",    choices:["4/6","5/4","1¼","7/8"], correct:2 },
  ];

  const startAssess = () => { setPhase("assess"); setQIndex(0); };

  const pick = (idx) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
    } else {
      // All answered — compute level
      const score = newAnswers.filter((a, i) => a === questions[i].correct).length;
      const level = score === 0 ? "beginner" : score === 1 ? "foundational" : score === 2 ? "grade-level" : "advanced";
      localStorage.setItem("neo_child_grade", grade);
      localStorage.setItem("neo_child_name", name);
      localStorage.setItem("neo_student_level", level);
      onDone({ name, grade, level, score });
    }
  };

  const skipAll = () => {
    localStorage.setItem("neo_child_name", name);
    if (grade) localStorage.setItem("neo_child_grade", grade);
    onDone({ name, grade, level:"grade-level", score:1 });
  };

  if (phase === "info") return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>👋</div>
        <h1 className="h1" style={{ marginBottom:8 }}>Hi! Let's set up your learning space.</h1>
        <p className="mu" style={{ fontSize:13, marginBottom:24, lineHeight:1.7 }}>Takes 2 minutes. We'll personalise your activities and AI tutors.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:11, textAlign:"left" }}>
          <div className="fg"><label className="lbl">What's your name?</label><input className="inp" placeholder="e.g. Kai" value={name} onChange={e => setName(e.target.value)}/></div>
          <div className="fg"><label className="lbl">What grade are you in?</label>
            <select className="sel inp" value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="">Select</option>
              {["Pre-K","Kindergarten","1st Grade","2nd Grade","3rd Grade","4th Grade","5th Grade","6th Grade","7th Grade","8th Grade"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <button className="btn bo fw" onClick={startAssess} disabled={!name || !grade}>
            Next: quick math check (3 questions) →
          </button>
          <button className="btn bg fw" onClick={skipAll} disabled={!name || !grade}>
            Skip — just get started
          </button>
        </div>
      </div>
    </div>
  );

  const q = questions[qIndex];
  return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:380, width:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:22 }}>
          {questions.map((_, i) => <div key={i} style={{ flex:1, height:4, borderRadius:99, background:i<=qIndex?"var(--or)":"var(--p2)"}}/>)}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>
          Quick check · {qIndex+1} of {questions.length}
        </p>
        <div className="card" style={{ marginBottom:16 }}>
          <p style={{ fontFamily:"'Fraunces',serif", fontSize:24, textAlign:"center", padding:"16px 0" }}>{q.q}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          {q.choices.map((c, i) => (
            <button key={i} className="btn bw" style={{ fontSize:16, padding:"14px" }} onClick={() => pick(i)}>
              {c}
            </button>
          ))}
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:"var(--mu)", marginTop:12 }}>No pressure — just to personalise your experience</p>
      </div>
    </div>
  );
}

// ── CAMPUS DIRECTOR PORTAL ───────────────────────────────────────────────────
// Inspired by Alpha School model: Director owns the parent relationship.
// Guides focus 100% on facilitation. Director handles comms, community, enrollment.
function CampusDirectorPortal({ user }) {
  const [view, setView]         = useState("overview");
  const [activeTool, setActiveTool] = useState(null);
  const [sel, setSel]           = useState(DEMO_STUDENTS[0]);
  const [comm, setComm]         = useState(null);
  const [loadComm, setLoadComm] = useState(false);
  const [sent, setSent]         = useState({});
  const [newsletter, setNewsletter] = useState(null);
  const [loadNL, setLoadNL]     = useState(false);
  const [showPay, setShowPay]   = useState(false);

  const nav = [
    { id:"overview",    i:"🏛️", l:"School Overview" },   // health metrics embedded here
    { id:"tasks",       i:"✅", l:"Weekly Tasks" },
    { id:"waitlist",    i:"📇", l:"Waitlist" },
    { id:"comms",       i:"💌", l:"Parent Comms" },
    { id:"newsletter",  i:"📰", l:"Newsletter" },
    { id:"community",   i:"🤝", l:"Community" },
    { id:"enrollment",  i:"📋", l:"Enrollment" },
    { id:"survey",      i:"📋", l:"Quarterly Survey" },
  ];

  const genComm = async (student) => {
    setLoadComm(true); setComm(null);
    try { setComm(await genParentComm(student)); }
    catch { setComm({ emoji:"⭐", subject:`${student.name} update`, body:"Great learning session today! More details coming soon." }); }
    setLoadComm(false);
  };

  const genNewsletter = async () => {
    setLoadNL(true); setNewsletter(null);
    try {
      const raw = await genJSON(`You are the Campus Director at neoschool writing a warm, personal weekly newsletter to all families.
School: neoschool Berkeley. Week of: ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}.
Students: ${DEMO_STUDENTS.length} children, grades 1–4.
Highlight: Learning milestones, upcoming events, community spotlight.
Tone: warm, personal, proud — like a letter from a trusted school leader, not a corporate update.
Return ONLY valid JSON:
{"subject":"subject line","greeting":"Hi neoschool Families,","highlights":["milestone 1","milestone 2","milestone 3"],"spotlight":"one student success story (anonymized)","upcoming":"one upcoming event or activity","closing":"warm 2-sentence closing from the Director","signature":"Dr. Sandra Reyes, Campus Director"}`, 600);
      setNewsletter(raw);
    } catch {
      setNewsletter({
        subject:"📚 This Week at neoschool — A Note from the Director",
        greeting:"Hi neoschool Families,",
        highlights:["Our learners completed 1,644 minutes of focused learning this week","Three students advanced to new levels in their math tracks","The founding class continues to exceed our MAP Growth benchmarks"],
        spotlight:"One of our 3rd-graders tackled fractions with such persistence this week — working through a tough concept three different ways until it clicked. That's the neoschool spirit.",
        upcoming:"Next Friday we'll have our first Showcase morning — students will present their favorite project to family members. More details to follow.",
        closing:"Thank you for trusting us with the most important work in your child's life. We don't take that lightly. See you next week.",
        signature:"Dr. Sandra Reyes, Campus Director",
      });
    }
    setLoadNL(false);
  };

  return (
    <div style={{ display:"flex", height:"100%" }}>
      {showPay && <PaymentModal userId={user.id} onClose={() => setShowPay(false)}/>}
      {activeTool && <SimViewer tool={activeTool} onClose={() => setActiveTool(null)}/>}
      <div className="sb" style={{ padding:"20px 12px" }}>
        <div style={{ padding:"2px 6px", marginBottom:22 }}><Logo l sz={13}/></div>
        <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:9.5, fontWeight:500, color:"rgba(255,255,255,.35)", letterSpacing:".14em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Campus Director</div>
        {nav.map(n => <div key={n.id} className={`ni${view===n.id?" ac":""}`} onClick={() => setView(n.id)}><span>{n.i}</span><span>{n.l}</span></div>)}
        <div style={{ flex:1 }}/>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", padding:"14px 8px 0" }}>
          <CreditsWidget userId={user.id} onBuyMore={() => setShowPay(true)}/>
          <div style={{ marginTop:10 }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:9.5, color:"rgba(255,255,255,.35)", marginBottom:3, letterSpacing:".08em", textTransform:"uppercase" }}>Director</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:500, color:"rgba(255,255,255,.9)", fontSize:14 }}>{user?.name}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:"auto", padding:"22px", background:"var(--cr)" }}>

        {/* OVERVIEW */}
        {view === "overview" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>School Overview</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:18 }}>
              Your job is the parent relationship. Guides handle the learning. Here's your view.
            </p>

            {/* Role split callout */}
            <div className="card fu" style={{ marginBottom:16, background:"var(--nv)", border:"none" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>The Director / Guide split</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div style={{ background:"rgba(255,255,255,.08)", borderRadius:12, padding:"14px" }}>
                  <p style={{ fontWeight:700, color:"#fff", marginBottom:6 }}>🏕️ Guide focuses on...</p>
                  {["Morning student briefing","Real-time learning nudges","Curriculum facilitation","Student Insights","Lab + tutor management"].map((i,x)=><p key={x} style={{ fontSize:12, color:"rgba(255,255,255,.7)", marginBottom:3 }}>→ {i}</p>)}
                </div>
                <div style={{ background:"rgba(255,255,255,.12)", borderRadius:12, padding:"14px", border:"1px solid rgba(255,255,255,.15)" }}>
                  <p style={{ fontWeight:700, color:"#fff", marginBottom:6 }}>🏛️ You focus on...</p>
                  {["Parent communications","Weekly newsletter","Community building","Enrollment & waitlist","School health metrics"].map((i,x)=><p key={x} style={{ fontSize:12, color:"rgba(255,255,255,.85)", marginBottom:3 }}>→ {i}</p>)}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { l:"Enrolled families",  v:"18",   i:"👨‍👩‍👧", c:"var(--or)" },
                { l:"Waitlist",           v:"94",   i:"📋",    c:"var(--sg)" },
                { l:"Parent pulse avg",   v:"4.6/5",i:"❤️",    c:"var(--rd)" },
                { l:"Weekly check-ins",   v:"14/18",i:"✓",     c:"var(--bl)" },
                { l:"Comms sent today",   v:"5",    i:"💌",    c:"var(--pu)" },
                { l:"Newsletter open rate",v:"87%", i:"📰",    c:"var(--am)" },
              ].map((s,i) => (
                <div key={i} className="sc fu" style={{ animationDelay:`${i*.06}s`, textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.i}</div>
                  <div style={{ fontSize:20, fontFamily:"'Fraunces',serif", fontWeight:500, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:11, color:"var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Pending actions */}
            <div className="card fu d3">
              <p className="lbl" style={{ marginBottom:12 }}>Your actions today</p>
              {[
                { done:true,  label:"Send 3 overdue parent updates" },
                { done:false, label:"Write this week's newsletter (due Friday)" },
                { done:false, label:"Follow up with 4 waitlist families" },
                { done:true,  label:"Review weekly check-in sentiment" },
                { done:false, label:"Schedule parent coffee chat for next week" },
              ].map((a,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?"1px solid var(--p)":"none" }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid", borderColor:a.done?"var(--sg)":"var(--p2)", background:a.done?"var(--sg)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {a.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <p style={{ fontSize:13, color:a.done?"var(--mu)":"var(--tx)", textDecoration:a.done?"line-through":"none" }}>{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARENT COMMS */}
        {view === "comms" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>💌 Parent Communications</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:6 }}>
              You own every parent touchpoint — not the Guide. This keeps Guides free to facilitate.
            </p>
            <div style={{ background:"var(--p)", borderRadius:10, padding:"9px 13px", marginBottom:18, display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:16 }}>💡</span>
              <p style={{ fontSize:12, color:"var(--mu)" }}>
                <strong>Alpha School model:</strong> Heads of School / Deans of Parents own parent comms. Guides are free to focus entirely on facilitation — no admin, no emails.
              </p>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {/* Student list */}
              <div style={{ width:180, flexShrink:0 }}>
                <p className="lbl" style={{ marginBottom:8 }}>Students</p>
                {DEMO_STUDENTS.map(s => (
                  <div key={s.id} onClick={() => { setSel(s); setComm(null); }} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:11, cursor:"pointer", marginBottom:6, background:sel?.id===s.id?"var(--nv)":"var(--p)", color:sel?.id===s.id?"#fff":"var(--tx)" }}>
                    <div className="av" style={{ background:s.color, width:24, height:24, fontSize:9 }}>{s.init}</div>
                    <div><div style={{ fontSize:12.5, fontWeight:500 }}>{s.name.split(" ")[0]}</div><div style={{ fontSize:10, opacity:.6 }}>{sent[s.id]?"✓ Sent":"Draft"}</div></div>
                  </div>
                ))}
              </div>

              {/* Comm composer */}
              <div style={{ flex:1 }}>
                {sel && (
                  <div className="card">
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div className="av" style={{ background:sel.color, width:34, height:34, fontSize:11 }}>{sel.init}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14 }}>{sel.name}</div>
                        <div style={{ fontSize:11, color:"var(--mu)" }}>{sel.grade} · parent@family.com</div>
                      </div>
                      <button className="btn bn sm" onClick={() => genComm(sel)} disabled={loadComm}>
                        {loadComm ? <><Spn/> Writing…</> : "✦ Generate"}
                      </button>
                    </div>

                    {loadComm && <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{[100,80,90].map((w,i) => <div key={i} className="sh" style={{ height:24, width:`${w}%` }}/>)}</div>}

                    {comm && !loadComm && (
                      <div>
                        <div style={{ background:"var(--p)", borderRadius:10, padding:"11px 13px", marginBottom:10 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", marginBottom:3 }}>Subject line</div>
                          <div style={{ fontSize:14, fontWeight:600 }}>{comm.emoji} {comm.subject}</div>
                        </div>
                        <div style={{ background:"var(--p)", borderRadius:10, padding:"11px 13px", marginBottom:12 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", marginBottom:5 }}>Message</div>
                          <p style={{ fontSize:13, lineHeight:1.75 }}>{comm.body}</p>
                          <p style={{ fontSize:12, color:"var(--mu)", marginTop:10, borderTop:"1px solid var(--p2)", paddingTop:8 }}>
                            Warm regards,<br/><strong>{user?.name}</strong><br/><em>Campus Director, neoschool</em>
                          </p>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button className="btn bo" style={{ flex:1 }} onClick={() => setSent(p => ({...p,[sel.id]:true}))}>
                            {sent[sel.id] ? "✓ Sent!" : "Send to Parent →"}
                          </button>
                          <button className="btn bg" onClick={() => setComm(null)}>Edit</button>
                        </div>
                      </div>
                    )}

                    {!comm && !loadComm && (
                      <div style={{ textAlign:"center", padding:"24px 0", color:"var(--mu)" }}>
                        <p style={{ fontSize:28, marginBottom:8 }}>💌</p>
                        <p style={{ fontSize:13, marginBottom:4 }}>Generate {sel.name.split(" ")[0]}'s parent update</p>
                        <p style={{ fontSize:11 }}>AI drafts a warm, personal message from your perspective as Director.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY NEWSLETTER */}
        {view === "newsletter" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>📰 Weekly Newsletter</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:18 }}>
              Your voice to the whole community — warm, personal, from the Director's desk.
            </p>
            <div className="card" style={{ marginBottom:14 }}>
              <p className="lbl" style={{ marginBottom:12 }}>This week's newsletter</p>
              <button className="btn bo" onClick={genNewsletter} disabled={loadNL}>
                {loadNL ? <><Spn/> Drafting newsletter…</> : "✦ Generate this week's newsletter"}
              </button>
            </div>

            {loadNL && <div style={{ display:"flex", flexDirection:"column", gap:10 }}>{[100,85,90,75].map((w,i) => <div key={i} className="sh" style={{ height:48, width:`${w}%` }}/>)}</div>}

            {newsletter && !loadNL && (
              <div className="fi">
                {/* Preview */}
                <div style={{ border:"1.5px solid var(--p2)", borderRadius:16, overflow:"hidden", marginBottom:14 }}>
                  <div style={{ background:"var(--nv)", padding:"16px 20px" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>Subject</p>
                    <p style={{ color:"#fff", fontWeight:600, fontSize:15 }}>{newsletter.subject}</p>
                  </div>
                  <div style={{ padding:"20px", background:"#fff" }}>
                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:16, marginBottom:16, lineHeight:1.5 }}>{newsletter.greeting}</p>

                    <p className="lbl" style={{ marginBottom:8 }}>This week's highlights</p>
                    {newsletter.highlights?.map((h,i) => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                        <span style={{ color:"var(--or)", fontWeight:700 }}>✦</span>
                        <p style={{ fontSize:13, lineHeight:1.5 }}>{h}</p>
                      </div>
                    ))}

                    {newsletter.spotlight && (
                      <div style={{ background:"var(--p)", borderRadius:12, padding:"14px 16px", margin:"14px 0" }}>
                        <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Student spotlight</p>
                        <p style={{ fontSize:13, lineHeight:1.65, fontStyle:"italic" }}>"{newsletter.spotlight}"</p>
                      </div>
                    )}

                    {newsletter.upcoming && (
                      <div style={{ marginBottom:14 }}>
                        <p className="lbl" style={{ marginBottom:6 }}>Coming up</p>
                        <p style={{ fontSize:13, lineHeight:1.6 }}>{newsletter.upcoming}</p>
                      </div>
                    )}

                    <p style={{ fontSize:13, lineHeight:1.75, color:"var(--mu)", marginBottom:14 }}>{newsletter.closing}</p>
                    <p style={{ fontSize:13, fontWeight:600 }}>{newsletter.signature}</p>
                  </div>
                </div>
                <DrivePhotoSection/>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn bo" style={{ flex:1 }}>Send to all 18 families →</button>
                  <button className="btn bg">Edit draft</button>
                  <button className="btn bg" onClick={() => setNewsletter(null)}>Regenerate</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMMUNITY */}
        {view === "community" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>🤝 Parent Community</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:18 }}>
              The Mother Ambassador Flywheel — parent confidence drives referrals. You build this.
            </p>

            {/* Pulse heatmap */}
            <div className="card fu" style={{ marginBottom:14 }}>
              <p className="lbl" style={{ marginBottom:12 }}>Weekly check-in sentiment · last 4 weeks</p>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                {[
                  { week:"Apr 14", scores:[5,4,5,5,3,4,5,4,5,4,5,5,4,5,3,5,4,5] },
                  { week:"Apr 21", scores:[5,5,5,4,4,5,5,5,5,5,4,5,5,5,4,5,5,5] },
                  { week:"Apr 28", scores:[4,5,5,5,5,5,4,5,5,5,5,4,5,5,5,5,4,5] },
                  { week:"May 5",  scores:[5,5,5,5,4,5,5,5,5,4,5,5,5,5,5,5,5,5] },
                ].map((w,wi) => {
                  const avg = w.scores.reduce((a,b)=>a+b,0)/w.scores.length;
                  return (
                    <div key={wi} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:10, color:"var(--mu)", marginBottom:6 }}>{w.week}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:2, justifyContent:"center", marginBottom:4 }}>
                        {w.scores.map((s,si) => (
                          <div key={si} style={{ width:10, height:10, borderRadius:2, background:s>=5?"var(--sg)":s>=4?"var(--or2)":s>=3?"var(--am)":"var(--rd)", opacity:.8 }}/>
                        ))}
                      </div>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--sg)" }}>{avg.toFixed(1)}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                {[["var(--sg)","5 / Amazing"],["var(--or2)","4 / Good"],["var(--am)","3 / Okay"],["var(--rd)","1-2 / Tough"]].map(([c,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10, height:10, borderRadius:2, background:c }}/><span style={{ fontSize:10, color:"var(--mu)" }}>{l}</span></div>
                ))}
              </div>
            </div>

            {/* Referral pipeline */}
            <div className="card fu d1" style={{ marginBottom:14 }}>
              <p className="lbl" style={{ marginBottom:12 }}>Referral pipeline · Mother Ambassador Flywheel</p>
              {[
                { stage:"Enrolled & engaged",  n:18, pct:100, c:"var(--sg)" },
                { stage:"Shared with a friend", n:12, pct:67,  c:"var(--or)" },
                { stage:"Referred to waitlist", n:9,  pct:50,  c:"var(--bl)" },
                { stage:"Waitlist → enrolled",  n:3,  pct:17,  c:"var(--pu)" },
              ].map((r,i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:13 }}>{r.stage}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:r.c }}>{r.n} families</span>
                  </div>
                  <PBar v={r.pct} c={r.c} h={5}/>
                </div>
              ))}
            </div>

            {/* Waitlist management */}
            <div className="card fu d2">
              <p className="lbl" style={{ marginBottom:12 }}>Waitlist families (94 total) · next 5 to reach out</p>
              {["The Chen family — 2nd grade, referred by Ava's mom","The Park family — Kindergarten, found us on Instagram","The Williams family — 1st grade, been waiting 6 weeks","The Rodriguez family — 3rd grade, very engaged on email","The Kim family — 2nd grade, attended open house"].map((f,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?"1px solid var(--p)":"none" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--p)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>👨‍👩‍👧</div>
                  <div style={{ flex:1, fontSize:13 }}>{f}</div>
                  <button className="btn bg xs">Reach out</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WAITLIST CRM */}
        {view === "waitlist" && (
          <div style={{ maxWidth:880 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <h2 className="h2" style={{ marginBottom:4 }}>📇 Waitlist</h2>
                <p className="mu" style={{ fontSize:12 }}>Track every prospective family from inquiry → enrolled.</p>
              </div>
              <button className="btn bo sm" onClick={() => alert("Coming soon: import inquiries from your website + email")}>+ Add family</button>
            </div>
            {/* Pipeline summary */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, marginBottom:18 }}>
              {[
                { stage:"New inquiry",    n:23, c:"#7c4a9a" },
                { stage:"Tour scheduled", n:14, c:"#2d6ea8" },
                { stage:"Applied",        n:31, c:"#d9622b" },
                { stage:"Deposit paid",   n:18, c:"#c8940e" },
                { stage:"Enrolled",       n:8,  c:"#4a7c6a" },
              ].map((s,i) => (
                <div key={i} className="sc fu" style={{ textAlign:"center", borderTop:`3px solid ${s.c}`, padding:"10px 6px" }}>
                  <div style={{ fontSize:22, fontFamily:"'Fraunces',serif", fontWeight:500, color:s.c, marginBottom:2 }}>{s.n}</div>
                  <div style={{ fontSize:10, color:"var(--mu)", fontWeight:600 }}>{s.stage}</div>
                </div>
              ))}
            </div>

            {/* Filter pills */}
            <div style={{ display:"flex", gap:7, marginBottom:14, flexWrap:"wrap" }}>
              {["All (94)","New inquiry","Tour scheduled","Applied","Deposit paid","Needs follow-up"].map((f,i) => (
                <button key={i} className="btn bg sm" style={{ fontSize:11, padding:"5px 11px", background: i===0 ? "var(--nv)":"var(--p)", color: i===0 ? "#fff":"var(--mu)" }}>
                  {f}
                </button>
              ))}
            </div>

            {/* CRM table */}
            <div className="card fu" style={{ padding:0, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead style={{ background:"var(--p)" }}><tr>
                  {["Family","Child","Grade","Stage","Source","Last contact","Next step"].map(h => <th key={h} style={{ textAlign:"left", padding:"9px 11px", fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    { family:"Yang",      child:"Mia",      grade:"K",   stage:"Deposit paid",   stageColor:"#c8940e", source:"Founder referral", last:"3 days ago",   next:"Send welcome packet" },
                    { family:"Chen",      child:"Liam",     grade:"1st", stage:"Applied",        stageColor:"#d9622b", source:"Instagram",         last:"yesterday",    next:"Review application" },
                    { family:"Rodriguez", child:"Sofia",    grade:"K",   stage:"Tour scheduled", stageColor:"#2d6ea8", source:"Google",            last:"this morning", next:"Tour on Thu 2pm" },
                    { family:"Patel",     child:"Arjun",    grade:"K",   stage:"New inquiry",    stageColor:"#7c4a9a", source:"Friend referral",   last:"2 days ago",   next:"Reply to inquiry email" },
                    { family:"Müller",    child:"Lukas",    grade:"1st", stage:"Applied",        stageColor:"#d9622b", source:"Podcast",           last:"4 days ago",   next:"Schedule tour" },
                    { family:"Park",      child:"Ji-woo",   grade:"K",   stage:"Deposit paid",   stageColor:"#c8940e", source:"Founder referral", last:"1 week ago",   next:"Send assessment link" },
                    { family:"O'Brien",   child:"Aoife",    grade:"1st", stage:"Tour scheduled", stageColor:"#2d6ea8", source:"School fair",       last:"2 days ago",   next:"Tour Fri 10am" },
                    { family:"Johnson",   child:"Riley",    grade:"K",   stage:"New inquiry",    stageColor:"#7c4a9a", source:"Google",            last:"yesterday",    next:"Send info packet" },
                  ].map((f,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid var(--p2)", cursor:"pointer" }} onMouseOver={e => e.currentTarget.style.background="var(--p)"} onMouseOut={e => e.currentTarget.style.background="#fff"}>
                      <td style={{ padding:"10px 11px", fontWeight:600 }}>{f.family}</td>
                      <td style={{ padding:"10px 11px" }}>{f.child}</td>
                      <td style={{ padding:"10px 11px", color:"var(--mu)" }}>{f.grade}</td>
                      <td style={{ padding:"10px 11px" }}><span style={{ background:f.stageColor+"22", color:f.stageColor, padding:"3px 9px", borderRadius:99, fontSize:11, fontWeight:600 }}>{f.stage}</span></td>
                      <td style={{ padding:"10px 11px", fontSize:11, color:"var(--mu)" }}>{f.source}</td>
                      <td style={{ padding:"10px 11px", fontSize:11, color:"var(--mu)" }}>{f.last}</td>
                      <td style={{ padding:"10px 11px", fontSize:11.5, color:"var(--or)", fontWeight:500 }}>→ {f.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ textAlign:"center", fontSize:11, color:"var(--mu)", marginTop:14 }}>
              Showing 8 of 94 · <a href="#" style={{ color:"var(--or)" }}>view all</a> · <a href="#" style={{ color:"var(--or)" }}>export CSV</a>
            </p>
          </div>
        )}

        {/* ENROLLMENT */}
        {view === "enrollment" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:18 }}>📋 Enrollment & Waitlist</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[{l:"Enrolled",v:"18",c:"var(--sg)"},{l:"Waitlist",v:"94",c:"var(--or)"},{l:"Open spots",v:"2",c:"var(--bl)"}].map((s,i) => (
                <div key={i} className="sc" style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, fontFamily:"'Fraunces',serif", fontWeight:500, color:s.c, marginBottom:2 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:"var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="card fu" style={{ marginBottom:12 }}>
              <p className="lbl" style={{ marginBottom:12 }}>Enrolled students</p>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ borderBottom:"2px solid var(--p2)" }}>
                  {["Student","Grade","Enrolled","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"7px 9px", fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase" }}>{h}</th>)}
                </tr></thead>
                <tbody>{DEMO_STUDENTS.map((s,i) => (
                  <tr key={s.id} style={{ borderBottom:i<DEMO_STUDENTS.length-1?"1px solid var(--p)":"none" }}>
                    <td style={{ padding:"10px 9px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><div className="av" style={{ background:s.color, width:24, height:24, fontSize:8 }}>{s.init}</div><span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span></div></td>
                    <td style={{ padding:"10px 9px", fontSize:12, color:"var(--mu)" }}>{s.grade}</td>
                    <td style={{ padding:"10px 9px", fontSize:12, color:"var(--mu)" }}>Sept 2026</td>
                    <td style={{ padding:"10px 9px" }}><span style={{ fontSize:11, background:"#dff2ea", color:"var(--sg)", padding:"2px 8px", borderRadius:99, fontWeight:600 }}>Active</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <button className="btn bo">+ Invite from waitlist</button>
          </div>
        )}

        {/* SCHOOL HEALTH — now merged into overview, keeping standalone too */}
        {view === "health" && (
          <div style={{ maxWidth:660 }}>
            <h2 className="h2" style={{ marginBottom:4 }}>📊 School Health</h2>
            <p className="mu" style={{ fontSize:12, marginBottom:18 }}>The honest signals that tell you if the model is working.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[{l:"Parent retention signal",v:"94%",trend:"↑ +3%",c:"var(--sg)",desc:"Would re-enroll next year"},{l:"Referral rate",v:"67%",trend:"↑ +8%",c:"var(--or)",desc:"Families who referred someone"},{l:"Weekly check-in response",v:"78%",trend:"→ stable",c:"var(--bl)",desc:"Parents who submitted pulse"},{l:"Learning velocity",v:"4.2/5",trend:"↑ +0.3",c:"var(--pu)",desc:"Avg across all students"}].map((s,i) => (
                <div key={i} className="card fu" style={{ animationDelay:`${i*.07}s` }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:500, color:s.c, marginBottom:2 }}>{s.v}</div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{s.l}</div>
                  <div style={{ fontSize:12, color:"var(--mu)", marginBottom:6 }}>{s.desc}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:s.trend.startsWith("↑")?"var(--sg)":"var(--mu)" }}>{s.trend}</div>
                </div>
              ))}
            </div>
            <div className="card fu d3" style={{ borderLeft:"3px solid var(--or)" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Series A proof points</p>
              {["✓ 180+ days of daily parent engagement data (not annual surveys)","✓ NPS curve trending up — 4.6 today vs 3.8 at launch","✓ 67% referral rate proves word-of-mouth flywheel is working","○ MAP Growth 90-day retest coming up — will validate academic outcomes","○ Unit economics: $25K/student vs $8K cost → 3x gross margin"].map((s,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                  <span style={{ color:s.startsWith("✓")?"var(--sg)":"var(--am)" }}>{s[0]}</span>
                  <p style={{ fontSize:12.5, lineHeight:1.5 }}>{s.slice(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEEKLY TASKS */}
        {view === "tasks" && (
          <WeeklyTasksView user={user}/>
        )}

        {/* QUARTERLY SURVEY */}
        {view === "survey" && (
          <QuarterlySurveyView/>
        )}
      </div>
    </div>
  );
}

// ── WEEKLY TASKS VIEW ─────────────────────────────────────────────────────────
function WeeklyTasksView({ user }) {
  const week = `Week of ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;
  const [tasks, setTasks] = useState([
    { id:1, cat:"Parent Comms",  label:"Send daily updates to all 18 families",          done:false, priority:"high" },
    { id:2, cat:"Newsletter",    label:"Draft and send this week's newsletter",            done:false, priority:"high" },
    { id:3, cat:"Community",     label:"Follow up with 3 waitlist families",              done:true,  priority:"medium" },
    { id:4, cat:"Enrollment",    label:"Review 2 new applications received this week",    done:false, priority:"medium" },
    { id:5, cat:"Check-in",      label:"Review weekly pulse responses from all parents",  done:true,  priority:"medium" },
    { id:6, cat:"Community",     label:"Schedule next parent coffee chat",                done:false, priority:"low" },
    { id:7, cat:"Health",        label:"Update school metrics dashboard",                 done:false, priority:"low" },
    { id:8, cat:"Survey",        label:"Send quarterly NPS survey to families",           done:false, priority:"low" },
  ]);
  const toggle = (id) => setTasks(t => t.map(x => x.id===id ? {...x,done:!x.done} : x));
  const remaining = tasks.filter(t => !t.done).length;
  const pct = Math.round((tasks.filter(t=>t.done).length / tasks.length)*100);

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div><h2 className="h2">✅ Weekly Tasks</h2><p className="mu" style={{ fontSize:12, marginTop:2 }}>{week} · {remaining} remaining</p></div>
        <div style={{ textAlign:"center" }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:500, color:"var(--or)" }}>{pct}%</div><div style={{ fontSize:11, color:"var(--mu)" }}>complete</div></div>
      </div>
      <PBar v={pct} c="var(--or)" h={6}/>
      <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
        {["high","medium","low"].map(pri => {
          const priTasks = tasks.filter(t => t.priority===pri);
          const priLabel = {high:"🔴 Must do",medium:"🟡 Should do",low:"⚪ Nice to do"}[pri];
          return (
            <div key={pri}>
              <p style={{ fontSize:11, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8, marginTop:4 }}>{priLabel}</p>
              {priTasks.map(t => (
                <div key={t.id} onClick={() => toggle(t.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 14px", background:"#fff", borderRadius:12, marginBottom:7, cursor:"pointer", border:"1px solid var(--p2)", opacity:t.done?.6:1, transition:"all .2s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${t.done?"var(--sg)":"var(--p2)"}`, background:t.done?"var(--sg)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {t.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:500, textDecoration:t.done?"line-through":"none", color:t.done?"var(--mu)":"var(--tx)" }}>{t.label}</p>
                    <p style={{ fontSize:11, color:"var(--mu)", marginTop:1 }}>{t.cat}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GOOGLE DRIVE PHOTO SECTION ───────────────────────────────────────────────
function DrivePhotoSection() {
  const [driveUrl, setDriveUrl] = useState(localStorage.getItem("neo_drive_folder") || "");
  const [saved, setSaved] = useState(!!localStorage.getItem("neo_drive_folder"));
  const [photoCount, setPhotoCount] = useState(4);

  const saveDrive = () => {
    if (driveUrl.includes("drive.google.com")) {
      localStorage.setItem("neo_drive_folder", driveUrl);
      setSaved(true);
    } else {
      alert("Please paste a Google Drive folder link (drive.google.com/...)");
    }
  };

  return (
    <div style={{ border:"1px solid var(--p2)", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.5 20.5L1 14.5L7 4H17L23 14.5L19.5 20.5H4.5Z" stroke="#4285F4" strokeWidth="1.5"/><path d="M7 4L12 13M17 4L12 13M1 14.5H23" stroke="#4285F4" strokeWidth="1.5"/></svg>
        <div style={{ flex:1 }}><p style={{ fontSize:13, fontWeight:600 }}>📷 Photo highlights from Google Drive</p><p style={{ fontSize:11, color:"var(--mu)" }}>Parents love seeing their child's week in pictures</p></div>
      </div>
      {!saved ? (
        <div>
          <p style={{ fontSize:12, color:"var(--mu)", marginBottom:8 }}>
            Create a shared folder in Google Drive, drop a few photos from this week, and paste the link here.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" style={{ flex:1, fontSize:12 }} placeholder="https://drive.google.com/drive/folders/..." value={driveUrl} onChange={e => setDriveUrl(e.target.value)}/>
            <button className="btn bn sm" onClick={saveDrive}>Connect</button>
          </div>
          <p style={{ fontSize:11, color:"var(--mu)", marginTop:5 }}>
            Or <a href="https://drive.google.com/drive/my-drive" target="_blank" rel="noopener noreferrer" style={{ color:"var(--bl)" }}>open Google Drive →</a> to create a new "neoschool Weekly Photos" folder
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", gap:7, marginBottom:9 }}>
            {Array.from({length:photoCount}).map((_,i) => (
              <div key={i} style={{ flex:1, height:56, background:`hsl(${i*90},40%,88%)`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                {["📸","🎨","🔬","🏃"][i%4]}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <a href={driveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"var(--bl)", textDecoration:"none" }}>📁 View Drive folder →</a>
            <span style={{ fontSize:11, color:"var(--mu)" }}>·</span>
            <button onClick={() => {setDriveUrl(""); setSaved(false); localStorage.removeItem("neo_drive_folder");}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--mu)" }}>Change folder</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── QUARTERLY SURVEY VIEW ─────────────────────────────────────────────────────
function QuarterlySurveyView() {
  const [sent, setSent] = useState(false);
  const [previewQ, setPreviewQ] = useState(false);
  const quarter = `Q${Math.ceil((new Date().getMonth()+1)/3)} ${new Date().getFullYear()}`;
  const questions = [
    "On a scale of 1–10, how likely are you to recommend neoschool to another family?",
    "How satisfied are you with your child's academic progress this quarter?",
    "How connected do you feel to the neoschool community?",
    "What's working best? (open text)",
    "What's one thing we could do better? (open text)",
    "Would you like a Guide check-in call next week?",
  ];

  return (
    <div style={{ maxWidth:580 }}>
      <h2 className="h2" style={{ marginBottom:4 }}>📋 Quarterly Parent Survey</h2>
      <p className="mu" style={{ fontSize:12, marginBottom:18 }}>
        {quarter} · NPS + satisfaction + qualitative feedback. Sent to all enrolled families.
      </p>
      {!sent ? (
        <div>
          <div className="card fu" style={{ marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <p className="lbl">Survey questions ({questions.length})</p>
              <button className="btn bg sm" onClick={() => setPreviewQ(!previewQ)}>{previewQ?"Hide":"Preview"}</button>
            </div>
            {previewQ && questions.map((q,i) => (
              <div key={i} style={{ display:"flex", gap:9, marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"var(--or)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                <p style={{ fontSize:12.5, lineHeight:1.5 }}>{q}</p>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginTop:previewQ?12:0 }}>
              {[{l:"Families to receive",v:"18"},{l:"Last NPS score",v:"72 (Promoter)"},{l:"Last sent",v:"3 months ago"},{l:"Avg response rate",v:"83%"}].map((s,i) => (
                <div key={i} style={{ background:"var(--p)", borderRadius:9, padding:"9px 11px" }}>
                  <div style={{ fontSize:16, fontWeight:700 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:"var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn bo fw" onClick={() => setSent(true)}>
            Send {quarter} survey to 18 families →
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign:"center", padding:"32px 24px" }}>
          <p style={{ fontSize:36, marginBottom:12 }}>📬</p>
          <h2 className="h2" style={{ marginBottom:8 }}>Survey sent!</h2>
          <p className="mu" style={{ fontSize:13, marginBottom:16 }}>18 families received the {quarter} survey. Responses will appear here as they come in.</p>
          <div style={{ background:"var(--p)", borderRadius:12, padding:"12px 14px", textAlign:"left" }}>
            <p className="lbl" style={{ marginBottom:6 }}>Track responses</p>
            <p style={{ fontSize:12, color:"var(--mu)" }}>You'll get a daily summary until the survey closes in 7 days. We'll alert you when NPS changes significantly.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminPortal({ user }) {
  const [view, setView] = useState("overview");
  const [activeTool, setActiveTool] = useState(null);
  const [launched, setLaunched] = useState(false);
  const [launching, setLaunching] = useState(false);
  const nav = [
    { id:"overview",  i:"🏛️", l:"Overview" },
    { id:"roster",    i:"👥", l:"Roster" },
    { id:"tutors",    i:"🎛️", l:"AI Tutor Settings" },
    { id:"launch",    i:"🚀", l:"Launch School" },
    { id:"providers", i:"🔗", l:"Providers" },
    { id:"network",   i:"🌐", l:"Network" },
  ];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="sb" style={{ padding: "16px 10px" }}>
        <div style={{ padding: "2px 6px", marginBottom: 18 }}><Logo l sz={13} /></div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", textTransform: "uppercase", padding: "0 6px", marginBottom: 6 }}>AI OS Admin</div>
        {nav.map(n => <div key={n.id} className={`ni${view === n.id ? " ac" : ""}`} onClick={() => setView(n.id)}><span>{n.i}</span><span>{n.l}</span></div>)}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "12px 6px 0" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 3 }}>neoschool AI OS v2</div>
          <div style={{ fontWeight: 600, color: "rgba(255,255,255,.8)", fontSize: 12 }}>MVP · May 2026</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--cr)" }}>
        {view === "overview" && (
          <div style={{ maxWidth: 660 }}>
            <h2 className="h2" style={{ marginBottom: 18 }}>Platform Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ l: "Active Schools", v: "1", i: "🏫", c: "var(--nv)" }, { l: "Students", v: "5", i: "🎒", c: "var(--or)" }, { l: "Waitlist", v: "94", i: "📋", c: "var(--sg)" }, { l: "Labs Active", v: "14", i: "🔬", c: "var(--bl)" }, { l: "Parent Pulse", v: "4.4/5", i: "❤️", c: "var(--rd)" }, { l: "ARR Target", v: "$100M", i: "💰", c: "var(--am)" }].map((s, i) => (
                <div key={i} className="sc fu" style={{ animationDelay: `${i * .06}s`, textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 5 }}>{s.i}</div>
                  <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 500, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <p className="lbl" style={{ marginBottom: 12 }}>Three Systems · Status</p>
              {[{ n: "System 1 · Student Insights", s: "live", d: "14 labs · context layer · shared memory" }, { n: "System 2 · Coach OS", s: "live", d: "Briefings + nudges + parent comms + curriculum builder" }, { n: "System 3 · Parent Signal Layer", s: "beta", d: "Daily pulse + progress + community" }].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i < 2 ? "1px solid var(--p)" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.s === "live" ? "var(--sg2)" : "var(--am)", animation: "pu 2s infinite" }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.n}</div><div style={{ fontSize: 11, color: "var(--mu)" }}>{s.d}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: s.s === "live" ? "#dff2ea" : "#fdf3d0", color: s.s === "live" ? "var(--sg)" : "var(--am)" }}>{s.s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "roster" && (
          <div style={{ maxWidth: 660 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><h2 className="h2">Student Roster</h2><button className="btn bn sm">+ Add Student</button></div>
            <div className="card">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "2px solid var(--p2)" }}>{["Student", "Grade", "Labs", "Login", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 10px", fontSize: 10, fontWeight: 700, color: "var(--mu)", textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                <tbody>{DEMO_STUDENTS.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < DEMO_STUDENTS.length - 1 ? "1px solid var(--p)" : "none" }}>
                    <td style={{ padding: "11px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="av" style={{ background: s.color, width: 26, height: 26, fontSize: 9 }}>{s.init}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span></div></td>
                    <td style={{ padding: "11px 10px", fontSize: 12, color: "var(--mu)" }}>{s.grade}</td>
                    <td style={{ padding: "11px 10px", fontSize: 12 }}>{Object.keys(s.labProgress).length} active</td>
                    <td style={{ padding: "11px 10px" }}><code style={{ fontSize: 11, background: "var(--p)", padding: "2px 7px", borderRadius: 5 }}>{s.name.split(" ")[0].toLowerCase()}@neo</code></td>
                    <td style={{ padding: "11px 10px" }}><button className="btn bg xs">View</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
        {view === "launch" && (
          <div style={{ maxWidth: 560 }}>
            <h2 className="h2" style={{ marginBottom: 4 }}>🚀 Launch a School</h2>
            <p className="mu" style={{ fontSize: 12, marginBottom: 20 }}>Deploy the full AI OS to a new campus in minutes.</p>
            {!launched ? (
              <div>
                <div className="card fu" style={{ marginBottom: 12 }}>
                  <p className="lbl" style={{ marginBottom: 14 }}>School details</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="fg"><label className="lbl">School name</label><input className="inp" placeholder="Sunshine Microschool" /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="fg"><label className="lbl">City</label><select className="sel inp">{CA_CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
                      <div className="fg"><label className="lbl">Max students</label><select className="sel inp"><option>5–10</option><option>10–20</option><option>20–30</option></select></div>
                    </div>
                    <div className="fg"><label className="lbl">Lead coach email</label><input className="inp" placeholder="coach@school.com" /></div>
                  </div>
                </div>
                <div className="card fu d1" style={{ marginBottom: 12 }}>
                  <p className="lbl" style={{ marginBottom: 10 }}>Included in launch</p>
                  {["All 3 AI OS systems active from Day 1", "14 interactive math labs with AI tutors", "8 subject AI tutors", "15 pre-integrated content platforms", "Roster + auto-generated student logins", "Parent Signal Layer + Daily Pulse"].map((f, i) => (
                    <p key={i} style={{ fontSize: 12.5, color: "var(--sg)", marginBottom: 6 }}>✓ {f}</p>
                  ))}
                </div>
                <button className="btn bo fw" onClick={() => { setLaunching(true); setTimeout(() => { setLaunching(false); setLaunched(true); }, 2200); }}>
                  {launching ? <><Spn /> Deploying AI OS…</> : "🚀 Launch School"}
                </button>
              </div>
            ) : (
              <div className="card pi" style={{ textAlign: "center", padding: "40px 32px" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
                <h2 className="h2" style={{ marginBottom: 8 }}>School is live!</h2>
                <p className="mu" style={{ fontSize: 13, marginBottom: 20 }}>All three AI OS systems active. Logins generated.</p>
                <div style={{ background: "var(--p)", borderRadius: 12, padding: "14px 16px", marginBottom: 16, textAlign: "left" }}>
                  <p className="lbl" style={{ marginBottom: 8 }}>Access credentials</p>
                  {["coach@school.com → coach2026", "student1@neo → learn123", "student2@neo → learn123"].map((c, i) => <code key={i} style={{ display: "block", fontSize: 11.5, color: "var(--mu)", marginBottom: 4 }}>{c}</code>)}
                </div>
                <button className="btn bn fw">Share with coach →</button>
              </div>
            )}
          </div>
        )}
        {view === "tutors" && <TutorAdminPanel />}
        {view === "providers" && <ContentProviders onOpenTool={setActiveTool}/>}
        {view === "network" && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="h2" style={{ marginBottom: 16 }}>🌐 Network Effect</h2>
            <div className="card fu" style={{ marginBottom: 14, borderLeft: "3px solid var(--or)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--or)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>The flywheel</p>
              {["Students learn → labs track every interaction", "Student Insights aggregates → shared memory across all labs", "Coach OS surfaces insights → real-time nudges", "Parent Signal Layer builds confidence → daily pulse", "Parents refer → new families → richer model", "More schools → better predictions → better outcomes → repeat"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "var(--or)" }}>→</span><p style={{ fontSize: 12.5 }}>{s}</p></div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ l: "Licensing", v: "$3K/student/yr", i: "💼" }, { l: "Scale target", v: "1,300 campuses", i: "📈" }, { l: "Data moat", v: "Year 2", i: "🔒" }, { l: "ARR target", v: "$100M", i: "💰" }].map((s, i) => (
                <div key={i} className={`sc fu`} style={{ animationDelay: `${i * .07}s` }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{s.i}</div>
                  <div style={{ fontSize: 18, fontFamily: "'Fraunces',serif", fontWeight: 500, marginBottom: 3 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--mu)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("marketing");
  const [role, setRole]     = useState(null);
  const [user, setUser]     = useState(null);
  const [parentData, setParentData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("neo_current");
    if (saved) { const u = JSON.parse(saved); setUser(u); setRole(u.role); setScreen("app"); }
  }, []);

  const handleRole = (r)  => { setRole(r); setScreen("auth"); };
  const handleAuth = (u)  => { setUser(u); if (u.role === "parent") setScreen("onboard"); else setScreen("app"); };

  // After onboarding: "apply" → show application form; "explore" → go straight to dashboard
  const handleOnboardDone = (data) => {
    setParentData(data);
    if (data.apply) setScreen("apply");
    else            setScreen("app");
  };
  const handleApplied = () => setScreen("app");
  const logout = () => { localStorage.removeItem("neo_current"); setUser(null); setRole(null); setScreen("marketing"); };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {screen === "app" && (
        <div style={{ background: "var(--nv)", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 10 }}>
          <div onClick={() => { if (window.confirm("Go back to home?")) { setScreen("marketing"); setUser(null); setRole(null); } }} style={{ cursor: "pointer" }}><Logo l sz={13} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>{user?.name}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 500, textTransform: "capitalize" }}>{role}</span>
            <button onClick={logout} style={{ background: "rgba(255,255,255,.1)", border: "none", cursor: "pointer", color: "rgba(255,255,255,.6)", fontSize: 11, padding: "5px 11px", borderRadius: 99 }}>Sign out</button>
          </div>
        </div>
      )}
      {screen === "app" && user && <ConnectAccountNudge userId={user.id}/>}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {screen === "marketing"  && <Marketing onStart={handleRole} />}
        {screen === "auth"       && <Auth role={role} onAuth={handleAuth} />}
        {screen === "onboard"    && <ParentOnboarding user={user} onDone={handleOnboardDone} />}
        {screen === "apply"      && <ApplicationScreen user={user} data={parentData} onDone={handleApplied} />}
        {screen === "app" && role === "parent"   && <ParentDashboard user={user} data={parentData} />}
        {screen === "app" && role === "guide"    && <CoachOS user={user} />}
        {screen === "app" && role === "director" && <CampusDirectorPortal user={user} />}
        {screen === "app" && role === "student"  && <StudentPortal user={user} />}
        {screen === "app" && role === "admin"    && <AdminPortal user={user} />}
      </div>
    </div>
  );
}
