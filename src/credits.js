// ── CREDITS SYSTEM ───────────────────────────────────────────────────────────
// Demo-first: users always get enough credits to explore. Never block demos.
const KEY = "neo_credits";
const USAGE_KEY = "neo_usage";

export const PLANS = [
  { id:"free",    name:"Free Trial",  credits:100, price:0,   desc:"Full demo — try everything", color:"#4a7c6a", stripe:null,    popular:false },
  { id:"starter", name:"Starter",     credits:300, price:9,   desc:"For 1 child, 1 month",       color:"#d9622b", stripe:"https://buy.stripe.com/test_starter", popular:false },
  { id:"family",  name:"Family",      credits:1000,price:29,  desc:"Up to 3 children",            color:"#2d6ea8", stripe:"https://buy.stripe.com/test_family",  popular:true  },
  { id:"school",  name:"School",      credits:10000,price:149,desc:"Full school, all students",   color:"#7c4a9a", stripe:"https://buy.stripe.com/test_school",  popular:false },
];

// Cost in credits per action
export const COSTS = {
  tutor_message:  1,
  curriculum_gen: 2,   // reduced from 5 — parents shouldn't feel penalised
  briefing:       2,   // reduced from 3
  parent_comm:    1,   // reduced from 2
  tutor_improve:  2,
};

// Auto-top-up threshold — if balance falls below this, silently add free credits
const AUTO_TOPUP_THRESHOLD = 5;
const AUTO_TOPUP_AMOUNT    = 50;

export function getCredits(userId = "default") {
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (!all[userId]) {
    // New user: 100 free credits, no card required
    all[userId] = { balance: 100, plan: "free", totalUsed: 0, purchaseHistory: [], autoToppedUp: 0 };
    localStorage.setItem(KEY, JSON.stringify(all));
  }
  return all[userId];
}

// safeUseCredits — NEVER blocks the user; auto-tops-up if needed
// Use this everywhere in the app instead of the hard-blocking version
export function safeUseCredits(userId = "default", action, amount) {
  // Ensure user exists (initializes with 100 free if new)
  getCredits(userId);
  const all = JSON.parse(localStorage.getItem(KEY) || "{}");
  const user = all[userId];

  // Auto-top-up if balance is too low
  if (user.balance < amount) {
    user.balance += AUTO_TOPUP_AMOUNT;
    user.autoToppedUp = (user.autoToppedUp || 0) + AUTO_TOPUP_AMOUNT;
  }

  user.balance = Math.max(0, user.balance - amount);
  user.totalUsed = (user.totalUsed || 0) + amount;
  all[userId] = user;
  localStorage.setItem(KEY, JSON.stringify(all));

  // Track usage
  const usage = JSON.parse(localStorage.getItem(USAGE_KEY) || "[]");
  usage.push({ action, amount, timestamp: Date.now(), userId });
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage.slice(-200)));

  return { success: true, balance: user.balance, autoToppedUp: user.autoToppedUp > 0 };
}

// Legacy version — kept for compatibility but now delegates to safeUseCredits
export function useCredits(userId = "default", action, amount) {
  return safeUseCredits(userId, action, amount);
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
