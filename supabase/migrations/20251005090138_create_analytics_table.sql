/*
  # Analytics Table

  1. New Tables
    - `analytics`
      - `id` (uuid, primary key) - Unique analytics record identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `post_id` (uuid, foreign key) - References posts table (nullable)
      - `account_id` (uuid, foreign key) - References social_accounts table (nullable)
      - `platform` (text) - Platform for the metric
      - `metric_name` (text, not null) - Name of metric (likes, shares, impressions, clicks, etc.)
      - `metric_value` (numeric, not null) - Numeric value of the metric
      - `metric_type` (text) - Type classification (default engagement)
      - `recorded_at` (timestamptz) - When metric was recorded (default now)
      - `metric_date` (date) - Date for grouping metrics (default current date)
      - `metadata` (jsonb) - Additional metric metadata (default {})
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `analytics` table
    - Add policy for users to read their own analytics
    - Add policy for users to insert their own analytics
*/

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  account_id uuid REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform text CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest')),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_type text DEFAULT 'engagement' NOT NULL,
  recorded_at timestamptz DEFAULT now() NOT NULL,
  metric_date date DEFAULT CURRENT_DATE NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_account_id ON analytics(account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_date ON analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at DESC);