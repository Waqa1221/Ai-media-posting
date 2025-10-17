/*
  # User Notifications Table

  1. New Tables
    - `user_notifications`
      - `id` (uuid, primary key) - Unique notification identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `type` (text, not null) - system | engagement | billing | security | feature | admin
      - `title` (text, not null) - Notification title
      - `message` (text, not null) - Notification message
      - `is_read` (boolean) - Read status (default false)
      - `is_archived` (boolean) - Archived status (default false)
      - `action_url` (text) - Call-to-action URL
      - `action_label` (text) - Call-to-action label
      - `metadata` (jsonb) - Additional notification data (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `read_at` (timestamptz) - Read timestamp

  2. Security
    - Enable RLS on `user_notifications` table
    - Add policy for users to manage their own notifications
*/

CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('system', 'engagement', 'billing', 'security', 'feature', 'admin')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  is_archived boolean DEFAULT false NOT NULL,
  action_url text,
  action_label text,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);