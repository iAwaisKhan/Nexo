-- ============================================================
-- Nexo Cloud Sync — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the tables, enables Row-Level Security, and sets up Realtime.
-- ============================================================

-- 1. PROFILES (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. NOTES
CREATE TABLE IF NOT EXISTS notes (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  last_modified BIGINT NOT NULL DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  published_at BIGINT,
  slug TEXT,
  is_blog BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE USING (auth.uid() = user_id);

-- Public notes can be read by anyone (for sharing)
CREATE POLICY "Anyone can view public notes"
  ON notes FOR SELECT USING (is_public = TRUE);


-- 3. TASKS
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('To Do', 'Done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  priority task_priority NOT NULL DEFAULT 'Medium',
  due_date VARCHAR(50) DEFAULT '',
  status task_status NOT NULL DEFAULT 'To Do',
  created_at_ts BIGINT NOT NULL DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED,
  PRIMARY KEY (id, user_id)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);


-- 4. FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  duration INTEGER NOT NULL,
  target_id TEXT,
  target_type TEXT,
  session_date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON focus_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON focus_sessions FOR DELETE USING (auth.uid() = user_id);


-- 5. ENABLE REALTIME
-- This allows Supabase Realtime to broadcast changes on these tables.
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_sessions;

-- 6. FULL TEXT SEARCH INDEXES (GIN)
CREATE INDEX IF NOT EXISTS notes_fts_idx ON notes USING GIN (fts);
CREATE INDEX IF NOT EXISTS tasks_fts_idx ON tasks USING GIN (fts);


-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_last_modified ON notes(user_id, last_modified);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(user_id, created_at_ts);


-- ============================================================
-- SETUP INSTRUCTIONS:
-- ============================================================
-- 1. Go to https://supabase.com → create a new project (free tier).
-- 2. Open Dashboard → SQL Editor → New Query → paste this entire file → Run.
-- 3. Go to Authentication → Providers → enable Google.
--    - You'll need a Google OAuth Client ID & Secret from https://console.cloud.google.com
--    - Set the redirect URL to: https://<your-project>.supabase.co/auth/v1/callback
-- 4. Copy your project URL and anon key from Settings → API.
-- 5. Create a .env file in Nexo root with:
--      VITE_SUPABASE_URL=https://your-project.supabase.co
--      VITE_SUPABASE_ANON_KEY=your-anon-key
-- ============================================================
