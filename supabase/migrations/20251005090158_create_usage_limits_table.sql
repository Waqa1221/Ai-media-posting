/*
  # Usage Limits Table

  1. New Tables
    - `usage_limits`
      - `id` (uuid, primary key) - Unique limit record identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `limit_type` (text, not null) - Type of limit (posts, ai_generations, media_uploads, etc.)
      - `current_usage` (integer) - Current usage count (default 0)
      - `limit_value` (integer, not null) - Maximum allowed usage
      - `reset_date` (timestamptz, not null) - When the limit resets
      - `reset_frequency` (text) - Reset schedule (daily, weekly, monthly) (default monthly)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `usage_limits` table
    - Add policy for users to read their own usage limits
    - Add policy for users to update their own usage limits
*/

CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  limit_type text NOT NULL,
  current_usage integer DEFAULT 0 NOT NULL,
  limit_value integer NOT NULL,
  reset_date timestamptz NOT NULL,
  reset_frequency text DEFAULT 'monthly' NOT NULL CHECK (reset_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, limit_type)
);

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage limits"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_limit_type ON usage_limits(limit_type);
CREATE INDEX IF NOT EXISTS idx_usage_limits_reset_date ON usage_limits(reset_date);