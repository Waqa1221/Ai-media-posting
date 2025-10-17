/*
  # Complete Posts and Scheduling System

  1. New Tables
    - `posts` - Main posts table with all content
    - `scheduling_queue` - Queue for scheduled posts
    - `post_publications` - Track publications per platform
    - `post_analytics` - Store engagement metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for user-scoped access

  3. Functions
    - Helper functions for queue management
    - Usage tracking functions
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid DEFAULT NULL,
  title text,
  content text NOT NULL,
  content_type text DEFAULT 'post',
  platforms text[] DEFAULT '{}',
  status text CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')) DEFAULT 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  ai_generated boolean DEFAULT false,
  ai_prompt text,
  ai_model_used text,
  ai_generation_id text,
  media_urls text[] DEFAULT '{}',
  media_metadata jsonb DEFAULT '{}',
  hashtags text[] DEFAULT '{}',
  mentions text[] DEFAULT '{}',
  location text,
  engagement_data jsonb DEFAULT '{}',
  performance_score integer DEFAULT 0,
  error_message text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  metadata jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create scheduling queue table
CREATE TABLE IF NOT EXISTS scheduling_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  priority integer DEFAULT 1,
  status text CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamptz,
  next_retry_at timestamptz,
  error_message text,
  error_details jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create post publications table
CREATE TABLE IF NOT EXISTS post_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  platform_post_id text,
  platform_url text,
  content text,
  media_urls text[] DEFAULT '{}',
  published_at timestamptz,
  status text CHECK (status IN ('published', 'failed', 'deleted')) DEFAULT 'published',
  error_message text,
  post_type text DEFAULT 'post',
  location text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create post analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date NOT NULL,
  recorded_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, platform, metric_name, metric_date)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
CREATE POLICY "Users can view own posts"
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
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for scheduling_queue
CREATE POLICY "Users can view own queue items"
  ON scheduling_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items"
  ON scheduling_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue items"
  ON scheduling_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue items"
  ON scheduling_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for post_publications
CREATE POLICY "Users can view own publications"
  ON post_publications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publications"
  ON post_publications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own publications"
  ON post_publications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for post_analytics
CREATE POLICY "Users can view own analytics"
  ON post_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON post_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduling_queue_user_id ON scheduling_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_status ON scheduling_queue(status);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_scheduled_for ON scheduling_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_platform ON scheduling_queue(platform);

CREATE INDEX IF NOT EXISTS idx_post_publications_user_id ON post_publications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_publications_platform ON post_publications(platform);
CREATE INDEX IF NOT EXISTS idx_post_publications_published_at ON post_publications(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON post_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_metric_date ON post_analytics(metric_date DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduling_queue_updated_at ON scheduling_queue;
CREATE TRIGGER update_scheduling_queue_updated_at
  BEFORE UPDATE ON scheduling_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get pending queue items
CREATE OR REPLACE FUNCTION get_pending_queue_items(batch_size integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  user_id uuid,
  platform text,
  scheduled_for timestamptz,
  post_content text,
  post_media_urls text[],
  attempts integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    sq.post_id,
    sq.user_id,
    sq.platform,
    sq.scheduled_for,
    p.content as post_content,
    p.media_urls as post_media_urls,
    sq.attempts
  FROM scheduling_queue sq
  JOIN posts p ON sq.post_id = p.id
  WHERE sq.status = 'pending'
    AND sq.scheduled_for <= now()
  ORDER BY sq.scheduled_for ASC, sq.priority DESC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_likes integer,
  p_comments integer,
  p_shares integer,
  p_impressions integer
)
RETURNS numeric AS $$
BEGIN
  IF p_impressions > 0 THEN
    RETURN ROUND(((p_likes + p_comments + p_shares)::numeric / p_impressions::numeric) * 100, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get post statistics
CREATE OR REPLACE FUNCTION get_post_stats(p_user_id uuid)
RETURNS TABLE (
  total_posts bigint,
  published_posts bigint,
  scheduled_posts bigint,
  draft_posts bigint,
  failed_posts bigint,
  total_engagement bigint,
  avg_engagement_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'published') as published_posts,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_posts,
    COUNT(*) FILTER (WHERE status = 'draft') as draft_posts,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_posts,
    COALESCE(SUM(
      COALESCE((engagement_data->>'likes')::integer, 0) +
      COALESCE((engagement_data->>'comments')::integer, 0) +
      COALESCE((engagement_data->>'shares')::integer, 0)
    ), 0) as total_engagement,
    COALESCE(AVG(
      CASE 
        WHEN COALESCE((engagement_data->>'impressions')::integer, 0) > 0 THEN
          ((COALESCE((engagement_data->>'likes')::integer, 0) +
            COALESCE((engagement_data->>'comments')::integer, 0) +
            COALESCE((engagement_data->>'shares')::integer, 0))::numeric /
           COALESCE((engagement_data->>'impressions')::integer, 1)::numeric) * 100
        ELSE 0
      END
    ), 0) as avg_engagement_rate
  FROM posts
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;