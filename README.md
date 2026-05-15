# neoschool

The operating system for microschools. Built by parents, for parents.

**Stack:** Vite + React 18 · Supabase · Anthropic Claude · Lovable

## What's included

- ~4,000-line React platform (landing + parent/guide/director/student/admin portals)
- 54 interactive math labs (14 originals + 40 Synthesis-inspired)
- 19 AI tutors · 38 content tools
- Application + waitlist CRM
- AI curriculum generator with auto-save
- 12-competency progress framework
- Editorial design system (Fraunces + Newsreader)

## Quick start (local dev)

```bash
npm install
cp .env.example .env   # fill in keys
npm run dev
```

## Deploy via Lovable

Lovable auto-builds on every push to this repo. Just set environment variables in Lovable's project settings:

```
VITE_SUPABASE_URL          (see .env.example)
VITE_SUPABASE_ANON_KEY     (see .env.example)
VITE_ANTHROPIC_API_KEY     (your Anthropic key)
```

## Apply database schema

Run `supabase-schema.sql` once in Supabase SQL editor → 10 tables + RLS policies.

## Project structure

```
src/
  App.jsx              ~4,000 lines — all routes & components
  api.js               Anthropic + curriculum generation
  credits.js           Credit tracking / billing
  data.js              LABS (54), TOOLS (38), TUTORS (19)
  memory.js            Cross-subject AI memory
  supabase.js          Supabase client (env-based, fallback to localStorage)
  toolResolver.js      Curriculum tool → SimViewer mapping
  tutorConfig.js       Per-lab AI tutor configs
  index.css            Editorial design system

public/
  labs/                14 original math labs
  labs-pack/           40 Synthesis-inspired math labs
```

© neoschool
