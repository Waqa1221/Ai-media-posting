/*
  # AI Generations Table

  1. New Tables
    - `ai_generations`
      - `id` (uuid, primary key) - Unique generation identifier
      - `user_id` (uuid, foreign key) - References profiles table
      - `type` (text, not null) - text | image | video | caption | hashtags | thread
      - `prompt` (text, not null) - User's AI prompt
      - `result` (text) - Generated content
      - `tokens_used` (integer) - OpenAI tokens consumed (default 0)
      - `cost_cents` (integer) - Generation cost in cents (default 0)
      - `model_used` (text) - AI model identifier
      - `quality_score` (numeric) - Content quality rating (0-100)
      - `user_rating` (integer) - User feedback rating (1-5)
      - `error_message` (text) - Error message if failed
      - `metadata` (jsonb) - Additional generation metadata (default {})
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `ai_generations` table
    - Add policy for users to read their own AI generations
    - Add policy for users to insert their own AI generations
    - Add policy for users to update their own AI generations
*/

CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('text', 'image', 'video', 'caption', 'hashtags', 'thread')),
  prompt text NOT NULL,
  result text,
  tokens_used integer DEFAULT 0 NOT NULL,
  cost_cents integer DEFAULT 0 NOT NULL,
  model_used text,
  quality_score numeric CHECK (quality_score >= 0 AND quality_score <= 100),
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI generations"
  ON ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI generations"
  ON ai_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);