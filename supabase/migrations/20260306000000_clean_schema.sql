/*
  # Clean schema for fresh Supabase project

  Sets up the complete database schema from scratch using Supabase Auth (auth.users).
  Old migrations referenced a custom `users` table with integer IDs — this replaces
  everything with UUID-based foreign keys to auth.users and RLS via auth.uid().

  1. Tables
    - user_profiles: personal data + onboarding status
    - echoes: journal entries with optional Tavus video support

  2. Security
    - RLS enabled on both tables
    - Policies use auth.uid() — no custom session config needed
*/

-- ============================================================
-- user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  date_of_birth date,
  age integer,
  photo_data text,
  echo_avatar_data text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (user_id = auth.uid());

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- echoes
-- ============================================================
CREATE TABLE IF NOT EXISTS echoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  tavus_video_id text,
  video_data text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS echoes_user_id_idx ON echoes(user_id);
CREATE INDEX IF NOT EXISTS echoes_created_at_idx ON echoes(created_at);
CREATE INDEX IF NOT EXISTS echoes_tavus_video_id_idx ON echoes(tavus_video_id);

ALTER TABLE echoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own echoes"
  ON echoes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own echoes"
  ON echoes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own echoes"
  ON echoes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own echoes"
  ON echoes FOR DELETE
  USING (user_id = auth.uid());
