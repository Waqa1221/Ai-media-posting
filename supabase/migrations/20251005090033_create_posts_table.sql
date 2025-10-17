/*
  # Posts Table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key) - Unique post identifier
      - `user_id` (uuid, foreign key) - References profiles table
      - `project_id` (uuid, foreign key) - References client_projects (nullable)
      - `title` (text) - Post title
      - `content` (text, not null) - Post content/text
      - `content_type` (text) - Content type (default text)
      - `platforms` (text array) - Target platforms (default {})
      - `status` (text) - draft | scheduled | published | failed | archived (default draft)
      - `scheduled_for` (timestamptz) - Scheduled publish time
      - `published_at` (timestamptz) - Actual publish timestamp
      - `ai_generated` (boolean) - AI-generated flag (default false)
      - `ai_prompt` (text) - AI generation prompt
      - `ai_model_used` (text) - AI model identifier
      - `ai_generation_id` (uuid) - References ai_generations
      - `media_urls` (text array) - Media URLs (default {})
      - `media_metadata` (jsonb) - Media metadata (default {})
      - `hashtags` (text array) - Hashtags (default {})
      - `mentions` (text array) - Mentions (default {})
      - `location` (text) - Location tag
      - `engagement_data` (jsonb) - Engagement metrics (default {})
      - `performance_score` (numeric) - Performance rating (default 0)
      - `error_message` (text) - Error message if failed
      - `retry_count` (integer) - Retry attempts (default 0)
      - `last_retry_at` (timestamptz) - Last retry timestamp
      - `metadata` (jsonb) - Additional metadata (default {})
      - `tags` (text array) - Organization tags (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `posts` table
    - Add policy for users to manage their own posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES client_projects(id) ON DELETE SET NULL,
  title text,
  content text NOT NULL,
  content_type text DEFAULT 'text' NOT NULL,
  platforms text[] DEFAULT '{}'::text[] NOT NULL,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  ai_generated boolean DEFAULT false NOT NULL,
  ai_prompt text,
  ai_model_used text,
  ai_generation_id uuid,
  media_urls text[] DEFAULT '{}'::text[] NOT NULL,
  media_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  hashtags text[] DEFAULT '{}'::text[] NOT NULL,
  mentions text[] DEFAULT '{}'::text[] NOT NULL,
  location text,
  engagement_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  performance_score numeric DEFAULT 0 NOT NULL,
  error_message text,
  retry_count integer DEFAULT 0 NOT NULL,
  last_retry_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_project_id ON posts(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_ai_generation_id ON posts(ai_generation_id);