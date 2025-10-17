/*
  # Client Projects Table

  1. New Tables
    - `client_projects`
      - `id` (uuid, primary key) - Unique project identifier
      - `user_id` (uuid, foreign key) - References profiles (agency owner)
      - `business_name` (text, not null) - Client business name
      - `industry` (text, not null) - Business industry
      - `description` (text) - Project description
      - `target_audience` (text, not null) - Target audience description
      - `brand_voice` (text, not null) - Brand voice/tone
      - `content_pillars` (text array) - Content strategy pillars (default {})
      - `content_themes` (text array) - Content themes (default {})
      - `posting_frequency` (text, not null) - Posting schedule frequency
      - `platforms` (text array) - Target platforms (default {})
      - `optimal_times` (jsonb) - Best posting times by platform (default {})
      - `use_media_library` (boolean) - Use media library (default true)
      - `use_ai_images` (boolean) - Use AI-generated images (default false)
      - `automation_level` (text) - Automation level (default manual)
      - `is_active` (boolean) - Active status (default true)
      - `total_posts_generated` (integer) - Total posts created (default 0)
      - `total_engagement` (integer) - Total engagement count (default 0)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `client_projects` table
    - Add policy for users to manage their own client projects
*/

CREATE TABLE IF NOT EXISTS client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  industry text NOT NULL,
  description text,
  target_audience text NOT NULL,
  brand_voice text NOT NULL,
  content_pillars text[] DEFAULT '{}'::text[] NOT NULL,
  content_themes text[] DEFAULT '{}'::text[] NOT NULL,
  posting_frequency text NOT NULL,
  platforms text[] DEFAULT '{}'::text[] NOT NULL,
  optimal_times jsonb DEFAULT '{}'::jsonb NOT NULL,
  use_media_library boolean DEFAULT true NOT NULL,
  use_ai_images boolean DEFAULT false NOT NULL,
  automation_level text DEFAULT 'manual' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  total_posts_generated integer DEFAULT 0 NOT NULL,
  total_engagement integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own client projects"
  ON client_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client projects"
  ON client_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client projects"
  ON client_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client projects"
  ON client_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_client_projects_user_id ON client_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_is_active ON client_projects(is_active);