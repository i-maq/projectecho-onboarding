/*
  # Consolidate authentication to Supabase Auth

  Removes the custom JWT + bcrypt auth system and switches all tables
  to use Supabase Auth's built-in auth.uid() for RLS policies.

  Changes:
  1. Drop all existing RLS policies on echoes and user_profiles
  2. Drop foreign key constraints referencing custom users table
  3. Alter user_id columns from integer to uuid
  4. Add foreign key constraints to auth.users(id)
  5. Recreate RLS policies using auth.uid()
  6. Drop custom helper functions (get_current_user_id, get_echo_video_status)
  7. Drop the custom users table
*/

-- ============================================================
-- 1. ECHOES TABLE: Drop policies and update schema
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own echoes" ON echoes;
DROP POLICY IF EXISTS "Users can insert own echoes" ON echoes;
DROP POLICY IF EXISTS "Users can update own echoes" ON echoes;
DROP POLICY IF EXISTS "Users can delete own echoes" ON echoes;

-- Drop foreign key to custom users table
ALTER TABLE echoes DROP CONSTRAINT IF EXISTS echoes_user_id_fkey;

-- Change user_id from integer to uuid
ALTER TABLE echoes
  ALTER COLUMN user_id DROP DEFAULT,
  ALTER COLUMN user_id SET DATA TYPE uuid USING gen_random_uuid(),
  ADD CONSTRAINT echoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate policies using auth.uid()
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

-- ============================================================
-- 2. USER_PROFILES TABLE: Drop policies and update schema
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Drop unique constraint and foreign key
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_unique;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Change user_id from integer to uuid
ALTER TABLE user_profiles
  ALTER COLUMN user_id SET DATA TYPE uuid USING gen_random_uuid(),
  ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Recreate policies using auth.uid()
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

-- ============================================================
-- 3. Clean up custom auth functions and users table
-- ============================================================

-- Drop custom helper functions
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS get_echo_video_status(integer);

-- Drop the custom users table (no longer needed with Supabase Auth)
DROP TABLE IF EXISTS users CASCADE;
