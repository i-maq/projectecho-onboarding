/*
  # Create echoes table for existing users

  1. New Tables
    - `echoes`
      - `id` (serial, primary key)
      - `content` (text, not null)
      - `user_id` (integer, foreign key to users.id)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `echoes` table
    - Add policy for users to manage their own echoes

  3. Indexes
    - Add index on user_id for efficient queries
    - Add index on created_at for ordering
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

-- Policies for echoes table
CREATE POLICY "Users can read own echoes"
  ON echoes
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY "Users can insert own echoes"
  ON echoes
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY "Users can update own echoes"
  ON echoes
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY "Users can delete own echoes"
  ON echoes
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id')::integer);