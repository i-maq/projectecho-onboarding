/*
  # Create echoes table for journaling

  1. New Tables
    - `echoes`
      - `id` (serial, primary key)
      - `content` (text, the journal entry content)
      - `user_id` (integer, foreign key to users table)
      - `created_at` (timestamp, when the entry was created)

  2. Security
    - Enable RLS on `echoes` table
    - Add policies for users to only access their own echoes

  3. Performance
    - Add indexes for user_id and created_at columns
*/

-- Create echoes table
CREATE TABLE IF NOT EXISTS echoes (
  id serial PRIMARY KEY,
  content text NOT NULL,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS echoes_user_id_idx ON echoes(user_id);
CREATE INDEX IF NOT EXISTS echoes_created_at_idx ON echoes(created_at);

-- Enable RLS
ALTER TABLE echoes ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user ID from JWT token
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS integer AS $$
BEGIN
  -- This will be set by our application when making requests
  RETURN COALESCE(current_setting('app.current_user_id', true)::integer, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for echoes table
CREATE POLICY "Users can read own echoes"
  ON echoes
  FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own echoes"
  ON echoes
  FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own echoes"
  ON echoes
  FOR UPDATE
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own echoes"
  ON echoes
  FOR DELETE
  USING (user_id = get_current_user_id());