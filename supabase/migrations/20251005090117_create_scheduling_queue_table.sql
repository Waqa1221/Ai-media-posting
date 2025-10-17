/*
  # Scheduling Queue Table

  1. New Tables
    - `scheduling_queue`
      - `id` (uuid, primary key) - Unique queue item identifier
      - `post_id` (uuid, foreign key, not null) - References posts table
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `platform` (text, not null) - twitter | linkedin | facebook | instagram | tiktok | youtube | pinterest
      - `scheduled_for` (timestamptz, not null) - Scheduled publish time
      - `priority` (integer) - Queue priority (default 5, higher = more priority)
      - `status` (text) - pending | processing | completed | failed | cancelled (default pending)
      - `attempts` (integer) - Number of attempts (default 0)
      - `max_attempts` (integer) - Maximum attempts (default 3)
      - `last_attempt_at` (timestamptz) - Last attempt timestamp
      - `next_retry_at` (timestamptz) - Next retry timestamp
      - `error_message` (text) - Error message if failed
      - `error_details` (jsonb) - Detailed error information (default {})
      - `metadata` (jsonb) - Additional metadata (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `scheduling_queue` table
    - Add policy for users to manage their own queue items
*/

CREATE TABLE IF NOT EXISTS scheduling_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest')),
  scheduled_for timestamptz NOT NULL,
  priority integer DEFAULT 5 NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer DEFAULT 0 NOT NULL,
  max_attempts integer DEFAULT 3 NOT NULL,
  last_attempt_at timestamptz,
  next_retry_at timestamptz,
  error_message text,
  error_details jsonb DEFAULT '{}'::jsonb NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE scheduling_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scheduling queue"
  ON scheduling_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduling queue"
  ON scheduling_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduling queue"
  ON scheduling_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduling queue"
  ON scheduling_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scheduling_queue_user_id ON scheduling_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_post_id ON scheduling_queue(post_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_platform ON scheduling_queue(platform);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_status ON scheduling_queue(status);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_scheduled_for ON scheduling_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_next_retry_at ON scheduling_queue(next_retry_at);