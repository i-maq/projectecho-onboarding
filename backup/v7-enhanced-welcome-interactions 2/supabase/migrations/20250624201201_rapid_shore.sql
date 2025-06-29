/*
  # Add personal data and Echo avatar support

  1. New Tables
    - `user_profiles`
      - `id` (serial, primary key)
      - `user_id` (integer, foreign key to users.id)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `date_of_birth` (date, not null)
      - `age` (integer, not null)
      - `photo_data` (text, base64 encoded photo)
      - `echo_avatar_data` (text, processed echo avatar data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles

  3. Indexes
    - Add index on user_id for efficient queries
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  age integer NOT NULL,
  photo_data text,
  echo_avatar_data text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint to ensure one profile per user
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policies for user_profiles table
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (user_id = get_current_user_id());