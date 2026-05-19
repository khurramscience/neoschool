-- ════════════════════════════════════════════════════════════════════════════
-- neoschool — full Supabase schema (one-shot migration)
-- 
-- Apply: Supabase dashboard → SQL Editor → paste this entire file → Run.
-- Takes ~5 seconds. Safe to re-run (uses IF NOT EXISTS).
-- ════════════════════════════════════════════════════════════════════════════

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES (extends auth.users) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  name        TEXT,
  role        TEXT CHECK (role IN ('parent','guide','director','student','admin')) DEFAULT 'parent',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. FAMILIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.families (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_name TEXT,
  city        TEXT,
  state       TEXT,
  situation   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. STUDENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  grade       TEXT,
  avatar_emoji TEXT DEFAULT '🌱',
  goals       JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. CURRICULA ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.curricula (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. APPLICATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  campus      TEXT,
  child_name  TEXT,
  grade       TEXT,
  status      TEXT CHECK (status IN ('new','reviewing','accepted','waitlisted','rejected')) DEFAULT 'new',
  form_data   JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. WAITLIST (Director CRM) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_name TEXT NOT NULL,
  child_name  TEXT,
  grade       TEXT,
  campus      TEXT,
  email       TEXT,
  phone       TEXT,
  stage       TEXT CHECK (stage IN ('new_inquiry','tour_scheduled','applied','deposit_paid','enrolled','declined')) DEFAULT 'new_inquiry',
  source      TEXT,
  last_contact TIMESTAMPTZ,
  next_step   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. SESSIONS (lab usage events) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  lab_id      TEXT,
  duration_seconds INT,
  score       INT,
  events      JSONB,
  ts          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. MEMORIES (cross-subject AI memory) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT,
  category    TEXT,
  ts          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. WEEKLY_PULSES (parent check-ins) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weekly_pulses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID REFERENCES public.families(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  week_of     DATE,
  score       INT CHECK (score BETWEEN 1 AND 5),
  win         TEXT,
  challenge   TEXT,
  focus       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. LABS catalog (synced from public/labs-pack) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.labs (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  emoji       TEXT,
  topic       TEXT,
  grades      TEXT,
  url         TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY — each family/user sees only their own data
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curricula     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs          ENABLE ROW LEVEL SECURITY;

-- Profiles: users see/edit their own
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
CREATE POLICY "Users see own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Families: users see/edit their own
DROP POLICY IF EXISTS "Users own families" ON public.families;
CREATE POLICY "Users own families" ON public.families
  FOR ALL USING (auth.uid() = user_id);

-- Students: linked via family_id → family.user_id
DROP POLICY IF EXISTS "Users see own students" ON public.students;
CREATE POLICY "Users see own students" ON public.students
  FOR ALL USING (
    family_id IN (SELECT id FROM public.families WHERE user_id = auth.uid())
  );

-- Curricula: by user_id
DROP POLICY IF EXISTS "Users see own curricula" ON public.curricula;
CREATE POLICY "Users see own curricula" ON public.curricula
  FOR ALL USING (auth.uid() = user_id);

-- Applications: by user_id (also allow anonymous insert for marketing form)
DROP POLICY IF EXISTS "Users see own applications" ON public.applications;
CREATE POLICY "Users see own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can apply" ON public.applications;
CREATE POLICY "Anyone can apply" ON public.applications
  FOR INSERT WITH CHECK (true);

-- Waitlist: only directors/admins see all rows (we'll add proper role check later)
DROP POLICY IF EXISTS "Directors see waitlist" ON public.waitlist;
CREATE POLICY "Directors see waitlist" ON public.waitlist
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('director','admin'))
  );

-- Labs: public read, only admins write
DROP POLICY IF EXISTS "Anyone reads labs" ON public.labs;
CREATE POLICY "Anyone reads labs" ON public.labs FOR SELECT USING (true);

-- Memory + sessions + pulses: linked via student_id
DROP POLICY IF EXISTS "Users see own student memory" ON public.memories;
CREATE POLICY "Users see own student memory" ON public.memories
  FOR ALL USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.families f ON s.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users see own student sessions" ON public.sessions;
CREATE POLICY "Users see own student sessions" ON public.sessions
  FOR ALL USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.families f ON s.family_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users see own pulses" ON public.weekly_pulses;
CREATE POLICY "Users see own pulses" ON public.weekly_pulses
  FOR ALL USING (
    family_id IN (SELECT id FROM public.families WHERE user_id = auth.uid())
  );

-- ════════════════════════════════════════════════════════════════════════════
-- Indexes for performance
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_families_user_id      ON public.families(user_id);
CREATE INDEX IF NOT EXISTS idx_students_family_id    ON public.students(family_id);
CREATE INDEX IF NOT EXISTS idx_curricula_user_id     ON public.curricula(user_id);
CREATE INDEX IF NOT EXISTS idx_curricula_student_id  ON public.curricula(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id  ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_stage        ON public.waitlist(stage);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id   ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_memories_student_id   ON public.memories(student_id);

-- ════════════════════════════════════════════════════════════════════════════
-- Done! Verify with:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- You should see 10 tables.
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- KNOWLEDGE GRAPH TABLES (added round 7)
-- These mirror the localStorage shape from src/knowledgeGraph.js
-- Sync flushes from client every 30s via supabaseSync.js
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.kg_lab_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  text NOT NULL,
  lab_id      text NOT NULL,
  lab_topic   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kg_visits_student ON public.kg_lab_visits(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_visits_lab ON public.kg_lab_visits(lab_id);

CREATE TABLE IF NOT EXISTS public.kg_lab_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  text NOT NULL,
  lab_id      text NOT NULL,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kg_events_student ON public.kg_lab_events(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_events_lab ON public.kg_lab_events(lab_id);
CREATE INDEX IF NOT EXISTS idx_kg_events_type ON public.kg_lab_events(event_type);

CREATE TABLE IF NOT EXISTS public.kg_mcq_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  text NOT NULL,
  lab_id      text NOT NULL,
  mcq_id      text NOT NULL,
  chosen      int  NOT NULL,
  correct     boolean NOT NULL,
  concept     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kg_mcq_student ON public.kg_mcq_results(student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.kg_edges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  text NOT NULL,
  from_lab    text NOT NULL,
  to_lab      text NOT NULL,
  edge_type   text NOT NULL,
  weight      float NOT NULL DEFAULT 1.0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, from_lab, to_lab, edge_type)
);
CREATE INDEX IF NOT EXISTS idx_kg_edges_student ON public.kg_edges(student_id);

CREATE TABLE IF NOT EXISTS public.tutor_turns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  text NOT NULL,
  lab_id      text NOT NULL,
  role        text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tutor_turns_student ON public.tutor_turns(student_id, created_at DESC);

-- RLS: each student can read/write only their own rows
ALTER TABLE public.kg_lab_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_lab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_mcq_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_turns ENABLE ROW LEVEL SECURITY;

-- For now: permissive policies (anonymous writes ok during onboarding).
-- Tighten once auth is enforced.
DROP POLICY IF EXISTS kg_visits_anon ON public.kg_lab_visits;
CREATE POLICY kg_visits_anon ON public.kg_lab_visits FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS kg_events_anon ON public.kg_lab_events;
CREATE POLICY kg_events_anon ON public.kg_lab_events FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS kg_mcq_anon ON public.kg_mcq_results;
CREATE POLICY kg_mcq_anon ON public.kg_mcq_results FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS kg_edges_anon ON public.kg_edges;
CREATE POLICY kg_edges_anon ON public.kg_edges FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS tutor_turns_anon ON public.tutor_turns;
CREATE POLICY tutor_turns_anon ON public.tutor_turns FOR ALL USING (true) WITH CHECK (true);
