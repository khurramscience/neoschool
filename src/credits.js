// ── CREDITS SYSTEM ───────────────────────────────────────────────────────────
// Demo-then-charge model:
//   • Activities & games are ALWAYS free — they never touch credits.
//   • The AI tutor is a free DEMO: every new learner gets FREE_DEMO_CREDITS
//     messages to experience it.
//   • When the demo runs out, we stop and invite an upgrade (or "bring your
//     own key" for unlimited). We do NOT silently top up forever.
//   • Bring-Your-Own-Key (BYOK) users are never charged credits.
import { hasUserKey } from "./userApiKey.js";

const KEY = "neo_credits";
const USAGE_KEY = "neo_usage";

// Free AI-tutor demo allowance for a brand-new learner (1 credit = 1 message).
export const FREE_DEMO_CREDITS = 25;

export const PLANS = [
  { id:"free",    name:"Free demo",   credits:FREE_DEMO_CREDITS, price:0,  desc:"Try the AI tutor free", color:"#4a7c6a", stripe:null, popular:false },
  { id:"starter", name:"Starter",     credits:300,  price:9,   desc:"For 1 child, 1 month",      color:"#d9622b", stripe:"https://buy.stripe.com/test_starter", popular:false },
  { id:"family",  name:"Family",      credits:1000, price:29,  desc:"Up to 3 children",          color:"#2d6ea8", stripe:"https://buy.stripe.com/test_family",  popular:true  },
  { id:"school",  name:"School",      credits:10000,price:149, desc:"Full school, all students", color:"#7c4a9a", stripe:"https://buy.stripe.com/test_school",  popular:false },
];

// Cost in credits per AI action. Activities/games cost nothing and never call this.
export const COSTS = {
  tutor_message:  1,
  curriculum_gen: 2,
  briefing:       2,
  parent_comm:    1,
  tutor_improve:  2,
};

export function getCredits(userId = "default") {
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (!all[userId]) {
    all[userId] = { balance: FREE_DEMO_CREDITS, plan: "free", totalUsed: 0, purchaseHistory: [] };
    localStorage.setItem(KEY, JSON.stringify(all));
  }
  return all[userId];
}

// useCredits — the demo gate.
//   Returns { success:true, balance, byok? }            when the action may proceed
//   Returns { success:false, needsUpgrade:true, balance } when the demo is exhausted
// BYOK users always succeed and are never charged.
export function useCredits(userId = "default", action, amount = 1) {
  // Unlimited for users who brought their own Anthropic key
  if (hasUserKey()) {
    trackUsage(action, 0, userId);
    return { success: true, byok: true, balance: getCredits(userId).balance };
  }

  getCredits(userId); // ensure initialised
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  const user = all[userId];

  if (user.balance < amount) {
    // Demo exhausted — invite upgrade, do not auto-top-up.
    return { success: false, needsUpgrade: true, balance: user.balance };
  }

  user.balance -= amount;
  user.totalUsed = (user.totalUsed || 0) + amount;
  all[userId] = user;
  localStorage.setItem(KEY, JSON.stringify(all));
  trackUsage(action, amount, userId);
  return { success: true, balance: user.balance };
}

// Back-compat alias — some call sites use safeUseCredits.
export const safeUseCredits = useCredits;

// How many free demo messages remain (for UI copy). BYOK = Infinity.
export function demoRemaining(userId = "default") {
  if (hasUserKey()) return Infinity;
  return getCredits(userId).balance;
}

function trackUsage(action, amount, userId) {
  const usage = JSON.parse(localStorage.getItem(USAGE_KEY) || "[]");
  usage.push({ action, amount, timestamp: Date.now(), userId });
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage.slice(-200)));
}

export function addCredits(userId = "default", amount, plan) {
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  const user = all[userId] || { balance: 0, plan: "free", totalUsed: 0, purchaseHistory: [] };
  user.balance += amount;
  user.plan = plan;
  user.purchaseHistory = [...(user.purchaseHistory || []), { amount, plan, timestamp: Date.now() }];
  all[userId] = user;
  localStorage.setItem(KEY, JSON.stringify(all));
  return user;
}

export function getUsageStats(userId = "default") {
  return JSON.parse(localStorage.getItem(USAGE_KEY) || "[]").filter(u => u.userId === userId);
}
