import fs from "fs";
// browser API shims
global.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
// controlled fetch: taxonomy from disk, supabase auth mocked, everything else empty-ok
const taxonomy = fs.readFileSync("./public/taxonomy.json", "utf8");
global.fetch = (url, opts = {}) => {
  const u = String(url);
  if (u.includes("taxonomy.json")) return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(taxonomy)) });
  if (u.includes("/auth/v1/signup") || u.includes("/auth/v1/token")) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({
      access_token: "t", refresh_token: "r", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600,
      user: { id: "u1", email: "test@neo.me", user_metadata: { name: "Test Parent", role: "parent" } },
    }), headers: new Headers({ "content-type": "application/json" }) });
  }
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve(""), headers: new Headers() });
};
global.IntersectionObserver = class {
  constructor(cb){ this.cb = cb; }
  observe(el){ try { this.cb([{ isIntersecting: true, target: el }]); } catch {} }
  unobserve(){} disconnect(){}
};
global.matchMedia = global.matchMedia || (q => ({ matches:false, media:q, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
window.matchMedia = global.matchMedia;
