/*
  # Automation Rules Table

  1. New Tables
    - `automation_rules`
      - `id` (uuid, primary key) - Unique rule identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `project_id` (uuid, foreign key) - References client_projects (nullable)
      - `name` (text, not null) - Rule name
      - `description` (text) - Rule description
      - `trigger_type` (text, not null) - schedule | engagement_threshold | hashtag_trending | auto_response | content_performance
      - `trigger_conditions` (jsonb) - Trigger configuration (default {})
      - `actions` (jsonb array) - Actions to execute (default [])
      - `schedule_expression` (text) - Cron-like schedule expression
      - `timezone` (text) - Timezone for scheduling (default UTC)
      - `is_active` (boolean) - Active status (default true)
      - `execution_count` (integer) - Total executions (default 0)
      - `success_count` (integer) - Successful executions (default 0)
      - `last_executed_at` (timestamptz) - Last execution timestamp
      - `next_execution_at` (timestamptz) - Next execution timestamp
      - `error_count` (integer) - Number of errors (default 0)
      - `last_error_message` (text) - Last error message
      - `last_error_at` (timestamptz) - Last error timestamp
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `automation_rules` table
    - Add policy for users to manage their own automation rules
*/

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES client_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('schedule', 'engagement_threshold', 'hashtag_trending', 'auto_response', 'content_performance')),
  trigger_conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
  actions jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
  schedule_expression text,
  timezone text DEFAULT 'UTC' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  execution_count integer DEFAULT 0 NOT NULL,
  success_count integer DEFAULT 0 NOT NULL,
  last_executed_at timestamptz,
  next_execution_at timestamptz,
  error_count integer DEFAULT 0 NOT NULL,
  last_error_message text,
  last_error_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation rules"
  ON automation_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_project_id ON automation_rules(project_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_next_execution_at ON automation_rules(next_execution_at);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger_type ON automation_rules(trigger_type);