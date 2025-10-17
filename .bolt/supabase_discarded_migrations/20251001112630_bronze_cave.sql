/*
  # Add Buffer API Integration

  1. New Tables
    - `buffer_updates` - Track Buffer posts and their status
  
  2. Profile Updates
    - Add Buffer connection fields to profiles table
  
  3. Security
    - Enable RLS on new tables
    - Add policies for user data access
*/

-- Add Buffer connection fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'buffer_access_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN buffer_access_token TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'buffer_connected_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN buffer_connected_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create buffer_updates table to track Buffer posts
CREATE TABLE IF NOT EXISTS buffer_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  buffer_update_id TEXT NOT NULL,
  buffer_profile_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'buffer',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  analytics_synced_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buffer_updates_user_id ON buffer_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_buffer_updates_buffer_id ON buffer_updates(buffer_update_id);
CREATE INDEX IF NOT EXISTS idx_buffer_updates_status ON buffer_updates(status);
CREATE INDEX IF NOT EXISTS idx_buffer_updates_scheduled ON buffer_updates(scheduled_for);

-- Enable RLS
ALTER TABLE buffer_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buffer_updates
CREATE POLICY "Users can manage their own Buffer updates"
  ON buffer_updates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to clean up old Buffer updates
CREATE OR REPLACE FUNCTION cleanup_old_buffer_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete Buffer updates older than 90 days
  DELETE FROM buffer_updates 
  WHERE created_at < now() - interval '90 days'
    AND status IN ('sent', 'failed', 'cancelled');
END;
$$;

-- Add updated_at trigger for buffer_updates
CREATE OR REPLACE FUNCTION update_buffer_updates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER buffer_updates_updated_at
  BEFORE UPDATE ON buffer_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_buffer_updates_updated_at();