/*
  # User Reports Table

  1. New Tables
    - `user_reports`
      - `id` (uuid, primary key) - Unique report identifier
      - `reporter_id` (uuid, foreign key) - References profiles table (who reported)
      - `reported_user_id` (uuid, foreign key) - References profiles table (reported user)
      - `reported_post_id` (uuid, foreign key) - References posts table (reported post)
      - `report_type` (text, not null) - spam | harassment | inappropriate_content | copyright | fake_account | other
      - `description` (text, not null) - Report description
      - `status` (text) - pending | investigating | resolved | dismissed | escalated (default pending)
      - `priority` (text) - low | medium | high | critical (default medium)
      - `assigned_to` (uuid, foreign key) - References profiles table (admin assigned)
      - `resolution_notes` (text) - Resolution details
      - `resolved_at` (timestamptz) - Resolution timestamp
      - `metadata` (jsonb) - Additional report metadata (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `user_reports` table
    - Add policy for users to create reports
    - Add policy for admins to manage reports
*/

CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  report_type text NOT NULL CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'fake_account', 'other')),
  description text NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed', 'escalated')),
  priority text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes text,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports"
  ON user_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_post_id ON user_reports(reported_post_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_priority ON user_reports(priority);
CREATE INDEX IF NOT EXISTS idx_user_reports_assigned_to ON user_reports(assigned_to);