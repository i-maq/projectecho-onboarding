/*
  # Add Tavus Video Support to Echoes Table

  1. Changes to Echoes Table
    - Add `tavus_video_id` - Reference to the Tavus API video ID
    - Add `video_data` - Full JSON response from Tavus API
    - Add `video_url` - Direct URL to the generated video
  
  2. Indexes
    - Add index on `tavus_video_id` for lookup
*/

-- Add columns to echoes table for Tavus video support
ALTER TABLE IF EXISTS echoes 
  ADD COLUMN IF NOT EXISTS tavus_video_id text,
  ADD COLUMN IF NOT EXISTS video_data text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- Add index for video lookups
CREATE INDEX IF NOT EXISTS echoes_tavus_video_id_idx ON echoes(tavus_video_id);

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS "Users can read own echoes" ON echoes;
CREATE POLICY "Users can read own echoes"
  ON echoes
  FOR SELECT
  USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can insert own echoes" ON echoes;
CREATE POLICY "Users can insert own echoes"
  ON echoes
  FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "Users can update own echoes" ON echoes;
CREATE POLICY "Users can update own echoes"
  ON echoes
  FOR UPDATE
  USING (user_id = get_current_user_id());

-- Add function to check echo video status
CREATE OR REPLACE FUNCTION get_echo_video_status(echo_id integer)
RETURNS text AS $$
DECLARE
  status text;
BEGIN
  SELECT
    CASE
      WHEN video_url IS NOT NULL THEN 'ready'
      WHEN tavus_video_id IS NOT NULL THEN 'processing'
      ELSE 'none'
    END INTO status
  FROM echoes
  WHERE id = echo_id;
  
  RETURN status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;