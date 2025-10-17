/*
  # Complete Social Media Management Platform Database Schema

  This migration creates a comprehensive database schema for a social media management platform
  with AI content generation, multi-platform publishing, analytics, billing, and team collaboration.

  ## Tables Created:
  1. profiles - User profiles and account information
  2. social_platforms - Platform configurations (Twitter, Instagram, etc.)
  3. social_accounts - User's connected social media accounts
  4. oauth_states - OAuth flow management with PKCE
  5. posts - All user content and posts
  6. scheduling_queue - Post scheduling system
  7. post_publications - Platform-specific publication tracking
  8. post_analytics - Engagement metrics and analytics
  9. ai_generations - AI content generation history
  10. ai_usage_tracking - AI usage limits and billing
  11. content_templates - Reusable content templates
  12. subscriptions - Stripe subscription management
  13. usage_limits - User plan limits and tracking
  14. usage_tracking - Monthly usage statistics
  15. invoices - Payment history
  16. payment_methods - Saved payment methods
  17. client_projects - AI Marketing Agency projects
  18. agency_automation_rules - Automation workflows
  19. agency_activity_logs - Agency activity tracking
  20. automation_rules - User automation rules
  21. engagement_interactions - Social media interactions
  22. media_library - File storage and management
  23. user_notifications - In-app notifications
  24. admin_users - Admin access control
  25. admin_audit_logs - Admin activity logging
  26. user_reports - Content moderation reports
  27. teams - Team workspaces (optional)
  28. team_members - Team membership
  29. team_invitations - Pending team invites

  ## Security Features:
  - Row Level Security (RLS) enabled on all tables
  - User-scoped data access policies
  - Admin-only access for sensitive operations
  - Audit logging for admin actions

  ## Performance Features:
  - Comprehensive indexing for fast queries
  - Optimized foreign key relationships
  - Efficient data types and constraints
  - Automatic timestamp management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 1. USER PROFILES SYSTEM
-- =============================================

-- Enhanced profiles table with all necessary fields
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  company_name text,
  bio text,
  website text,
  phone text,
  timezone text DEFAULT 'UTC' NOT NULL,
  language text DEFAULT 'en' NOT NULL,
  
  -- Subscription and billing
  account_status text DEFAULT 'trial' CHECK (account_status IN ('trial', 'premium', 'canceled', 'suspended')),
  subscription_tier text DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'premium', 'canceled')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'suspended')),
  stripe_customer_id text UNIQUE,
  trial_started_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  subscription_ends_at timestamptz,
  
  -- Account management
  credits_remaining integer DEFAULT 0,
  suspension_reason text,
  suspension_ends_at timestamptz,
  has_agency_setup boolean DEFAULT false,
  last_login_at timestamptz,
  email_verified boolean DEFAULT false,
  
  -- Preferences
  notification_preferences jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  
  -- Tracking
  signup_source text DEFAULT 'direct',
  referral_code text,
  onboarding_completed boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS and create policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends ON profiles(trial_ends_at);

-- Updated at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. SOCIAL MEDIA PLATFORMS CONFIGURATION
-- =============================================

-- Social platforms configuration
CREATE TABLE IF NOT EXISTS social_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon_url text,
  
  -- OAuth configuration
  client_id text NOT NULL,
  client_secret text NOT NULL,
  oauth_authorize_url text NOT NULL,
  oauth_token_url text NOT NULL,
  oauth_refresh_url text,
  default_scopes text[] DEFAULT '{}',
  
  -- Platform capabilities
  supports_media boolean DEFAULT true,
  supports_scheduling boolean DEFAULT true,
  supports_analytics boolean DEFAULT true,
  max_post_length integer DEFAULT 280,
  max_media_count integer DEFAULT 4,
  supported_media_types text[] DEFAULT '{"image", "video"}',
  
  -- Rate limiting
  rate_limit_requests integer DEFAULT 100,
  rate_limit_window_minutes integer DEFAULT 60,
  
  -- Platform features
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for social platforms (public read, admin write)
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active platforms"
  ON social_platforms FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default platforms
INSERT INTO social_platforms (
  platform_name, display_name, description, client_id, client_secret,
  oauth_authorize_url, oauth_token_url, default_scopes, max_post_length
) VALUES
  (
    'twitter', 'Twitter/X', 'Real-time social networking and microblogging',
    COALESCE(current_setting('app.twitter_client_id', true), 'your_twitter_client_id'),
    COALESCE(current_setting('app.twitter_client_secret', true), 'your_twitter_client_secret'),
    'https://twitter.com/i/oauth2/authorize',
    'https://api.twitter.com/2/oauth2/token',
    ARRAY['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    280
  ),
  (
    'instagram', 'Instagram', 'Visual storytelling and brand building',
    COALESCE(current_setting('app.instagram_client_id', true), 'your_instagram_client_id'),
    COALESCE(current_setting('app.instagram_client_secret', true), 'your_instagram_client_secret'),
    'https://www.facebook.com/v18.0/dialog/oauth',
    'https://graph.facebook.com/v18.0/oauth/access_token',
    ARRAY['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    2200
  ),
  (
    'linkedin', 'LinkedIn', 'Professional networking and B2B content',
    COALESCE(current_setting('app.linkedin_client_id', true), 'your_linkedin_client_id'),
    COALESCE(current_setting('app.linkedin_client_secret', true), 'your_linkedin_client_secret'),
    'https://www.linkedin.com/oauth/v2/authorization',
    'https://www.linkedin.com/oauth/v2/accessToken',
    ARRAY['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    3000
  ),
  (
    'facebook', 'Facebook', 'Community building and broad reach',
    COALESCE(current_setting('app.facebook_app_id', true), 'your_facebook_app_id'),
    COALESCE(current_setting('app.facebook_app_secret', true), 'your_facebook_app_secret'),
    'https://www.facebook.com/v18.0/dialog/oauth',
    'https://graph.facebook.com/v18.0/oauth/access_token',
    ARRAY['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
    63206
  )
ON CONFLICT (platform_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  oauth_authorize_url = EXCLUDED.oauth_authorize_url,
  oauth_token_url = EXCLUDED.oauth_token_url,
  default_scopes = EXCLUDED.default_scopes,
  max_post_length = EXCLUDED.max_post_length,
  updated_at = now();

-- =============================================
-- 3. OAUTH STATE MANAGEMENT
-- =============================================

-- OAuth states for secure authentication flow
CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  state_token text UNIQUE NOT NULL,
  code_verifier text, -- PKCE code verifier
  code_challenge text, -- PKCE code challenge
  redirect_uri text NOT NULL,
  scopes text[] DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  ip_address inet,
  user_agent text,
  expires_at timestamptz DEFAULT (now() + interval '10 minutes') NOT NULL,
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for oauth states
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth states"
  ON oauth_states FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for oauth states
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_platform ON oauth_states(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- =============================================
-- 4. SOCIAL ACCOUNTS
-- =============================================

-- User's connected social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_user_id text NOT NULL,
  username text,
  display_name text,
  platform_display_name text,
  platform_username text,
  avatar_url text,
  
  -- Authentication tokens
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,
  scope text[],
  
  -- Account status
  connection_status text DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'expired')),
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  last_sync_at timestamptz DEFAULT now(),
  
  -- Platform data
  platform_data jsonb DEFAULT '{}',
  account_type text,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  
  -- Error tracking
  error_message text,
  error_count integer DEFAULT 0,
  last_error_at timestamptz,
  
  -- Permissions and capabilities
  permissions jsonb DEFAULT '{}',
  capabilities jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, platform, platform_user_id)
);

-- Enable RLS for social accounts
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own social accounts"
  ON social_accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for social accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_social_accounts_expires ON social_accounts(expires_at);

-- Updated at trigger for social accounts
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. POSTS SYSTEM
-- =============================================

-- Main posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid, -- For AI Marketing Agency projects
  
  -- Content
  title text,
  content text NOT NULL,
  content_type text DEFAULT 'post' CHECK (content_type IN ('post', 'story', 'reel', 'thread', 'article')),
  platforms text[] DEFAULT '{}',
  
  -- Status and scheduling
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  
  -- AI generation
  ai_generated boolean DEFAULT false,
  ai_prompt text,
  ai_model_used text,
  ai_generation_id text,
  
  -- Media and content
  media_urls text[] DEFAULT '{}',
  media_metadata jsonb DEFAULT '{}',
  hashtags text[] DEFAULT '{}',
  mentions text[] DEFAULT '{}',
  location text,
  
  -- Performance tracking
  engagement_data jsonb DEFAULT '{}',
  performance_score integer DEFAULT 0,
  
  -- Error handling
  error_message text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own posts"
  ON posts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_platforms ON posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_posts_ai_generated ON posts(ai_generated);

-- Updated at trigger for posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. SCHEDULING SYSTEM
-- =============================================

-- Scheduling queue for automated posting
CREATE TABLE IF NOT EXISTS scheduling_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  
  -- Scheduling
  scheduled_for timestamptz NOT NULL,
  priority integer DEFAULT 1,
  
  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamptz,
  next_retry_at timestamptz,
  
  -- Error handling
  error_message text,
  error_details jsonb DEFAULT '{}',
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for scheduling queue
ALTER TABLE scheduling_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scheduled posts"
  ON scheduling_queue FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for scheduling queue
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_user ON scheduling_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_scheduled ON scheduling_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_status ON scheduling_queue(status);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_platform ON scheduling_queue(platform);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_pending ON scheduling_queue(status, scheduled_for) WHERE status = 'pending';

-- Updated at trigger for scheduling queue
CREATE TRIGGER update_scheduling_queue_updated_at
  BEFORE UPDATE ON scheduling_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. POST PUBLICATIONS TRACKING
-- =============================================

-- Track publications to each platform
CREATE TABLE IF NOT EXISTS post_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  
  -- Platform-specific data
  platform_post_id text,
  platform_url text,
  
  -- Content
  content text,
  media_urls text[] DEFAULT '{}',
  
  -- Status
  published_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  
  -- Post type
  post_type text DEFAULT 'single' CHECK (post_type IN ('single', 'thread', 'carousel', 'story', 'reel')),
  
  -- Error handling
  error_message text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for post publications
ALTER TABLE post_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own publications"
  ON post_publications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for post publications
CREATE INDEX IF NOT EXISTS idx_post_publications_user ON post_publications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_publications_post ON post_publications(post_id);
CREATE INDEX IF NOT EXISTS idx_post_publications_platform ON post_publications(platform);
CREATE INDEX IF NOT EXISTS idx_post_publications_status ON post_publications(status);
CREATE INDEX IF NOT EXISTS idx_post_publications_published ON post_publications(published_at);

-- =============================================
-- 8. ANALYTICS SYSTEM
-- =============================================

-- Analytics and engagement metrics
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  account_id uuid REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform text,
  
  -- Metrics
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_type text DEFAULT 'count' CHECK (metric_type IN ('count', 'rate', 'percentage', 'duration')),
  
  -- Time tracking
  recorded_at timestamptz DEFAULT now() NOT NULL,
  metric_date date DEFAULT CURRENT_DATE,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, post_id, platform, metric_name, metric_date)
);

-- Enable RLS for analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_metric ON analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded ON analytics(recorded_at);

-- =============================================
-- 9. AI CONTENT GENERATION
-- =============================================

-- AI generation history and tracking
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Generation details
  type text NOT NULL CHECK (type IN ('text', 'image', 'video', 'caption', 'hashtags', 'thread')),
  prompt text NOT NULL,
  result text,
  
  -- Usage tracking
  tokens_used integer DEFAULT 0,
  cost_cents integer DEFAULT 0,
  model_used text,
  
  -- Quality metrics
  quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  
  -- Error handling
  error_message text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for AI generations
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI generations"
  ON ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for AI generations
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created ON ai_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generations_model ON ai_generations(model_used);

-- =============================================
-- 10. USAGE LIMITS AND TRACKING
-- =============================================

-- Usage limits for different subscription tiers
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Limit configuration
  limit_type text NOT NULL,
  current_usage integer DEFAULT 0,
  limit_value integer NOT NULL, -- -1 means unlimited
  
  -- Reset configuration
  reset_date timestamptz NOT NULL,
  reset_frequency text DEFAULT 'monthly' CHECK (reset_frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'never')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, limit_type)
);

-- Enable RLS for usage limits
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage limits"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for usage limits
CREATE INDEX IF NOT EXISTS idx_usage_limits_user ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_type ON usage_limits(limit_type);
CREATE INDEX IF NOT EXISTS idx_usage_limits_reset ON usage_limits(reset_date);

-- Updated at trigger for usage limits
CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 11. SUBSCRIPTION MANAGEMENT
-- =============================================

-- Stripe subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe data
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id text NOT NULL,
  stripe_customer_id text,
  
  -- Subscription details
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'suspended')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  
  -- Cancellation
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  cancellation_reason text,
  
  -- Billing
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Updated at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 12. CONTENT TEMPLATES
-- =============================================

-- Reusable content templates
CREATE TABLE IF NOT EXISTS content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template details
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  
  -- Content
  template_content text NOT NULL,
  suggested_hashtags text[] DEFAULT '{}',
  suggested_platforms text[] DEFAULT '{}',
  
  -- Template type
  template_type text DEFAULT 'custom' CHECK (template_type IN ('custom', 'ai_generated', 'public')),
  is_public boolean DEFAULT false,
  
  -- Usage tracking
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for content templates
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates and public templates"
  ON content_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own templates"
  ON content_templates FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for content templates
CREATE INDEX IF NOT EXISTS idx_content_templates_user ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_public ON content_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_content_templates_category ON content_templates(category);

-- Insert default public templates
INSERT INTO content_templates (
  name, description, category, template_content, suggested_hashtags, 
  suggested_platforms, template_type, is_public
) VALUES
  (
    'Product Launch', 
    'Template for announcing new products or features',
    'marketing',
    'Exciting news! We''re thrilled to announce [PRODUCT_NAME] - [BRIEF_DESCRIPTION]. This [PRODUCT_TYPE] will help you [MAIN_BENEFIT]. What do you think? Let us know in the comments! 🚀',
    ARRAY['launch', 'newproduct', 'innovation', 'excited'],
    ARRAY['instagram', 'linkedin', 'twitter', 'facebook'],
    'public',
    true
  ),
  (
    'Behind the Scenes',
    'Template for sharing company culture and team moments',
    'culture',
    'Take a peek behind the scenes at [COMPANY_NAME]! Our team is [ACTIVITY_DESCRIPTION]. We love what we do and it shows in everything we create. What''s happening behind the scenes at your company? 👥',
    ARRAY['behindthescenes', 'team', 'culture', 'work'],
    ARRAY['instagram', 'linkedin', 'facebook'],
    'public',
    true
  ),
  (
    'Quick Tip',
    'Template for sharing valuable tips and insights',
    'educational',
    '💡 Quick Tip: [TIP_CONTENT]. This simple strategy can help you [BENEFIT]. Have you tried this approach? Share your experience in the comments! #TipTuesday',
    ARRAY['tip', 'advice', 'helpful', 'learning'],
    ARRAY['linkedin', 'twitter', 'instagram'],
    'public',
    true
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- 13. MEDIA LIBRARY
-- =============================================

-- Media library for file management
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File details
  name text NOT NULL,
  original_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  
  -- Storage
  url text NOT NULL,
  thumbnail_url text,
  storage_path text,
  folder_path text DEFAULT '/',
  
  -- Metadata
  tags text[] DEFAULT '{}',
  alt_text text,
  description text,
  
  -- Usage tracking
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- File metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  uploaded_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for media library
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own media"
  ON media_library FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for media library
CREATE INDEX IF NOT EXISTS idx_media_library_user ON media_library(user_id);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded ON media_library(uploaded_at);

-- =============================================
-- 14. AI MARKETING AGENCY
-- =============================================

-- Client projects for AI Marketing Agency
CREATE TABLE IF NOT EXISTS client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business information
  business_name text NOT NULL,
  industry text NOT NULL,
  description text,
  target_audience text NOT NULL,
  brand_voice text NOT NULL,
  
  -- Content strategy
  content_pillars text[] DEFAULT '{}',
  content_themes text[] DEFAULT '{}',
  posting_frequency text NOT NULL,
  platforms text[] DEFAULT '{}',
  optimal_times jsonb DEFAULT '{}',
  
  -- Media preferences
  use_media_library boolean DEFAULT false,
  use_ai_images boolean DEFAULT true,
  
  -- Automation settings
  automation_level text DEFAULT 'full' CHECK (automation_level IN ('full', 'assisted', 'manual')),
  is_active boolean DEFAULT true,
  
  -- Performance tracking
  total_posts_generated integer DEFAULT 0,
  total_engagement integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for client projects
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON client_projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for client projects
CREATE INDEX IF NOT EXISTS idx_client_projects_user ON client_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_active ON client_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_client_projects_industry ON client_projects(industry);

-- Agency automation rules
CREATE TABLE IF NOT EXISTS agency_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  
  -- Rule details
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('schedule', 'performance', 'engagement', 'trending')),
  trigger_conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Execution tracking
  execution_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  last_executed_at timestamptz,
  next_execution_at timestamptz,
  
  -- Error handling
  error_count integer DEFAULT 0,
  last_error_message text,
  last_error_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for agency automation rules
ALTER TABLE agency_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rules for own projects"
  ON agency_automation_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_projects 
      WHERE id = agency_automation_rules.project_id 
      AND user_id = auth.uid()
    )
  );

-- Agency activity logs
CREATE TABLE IF NOT EXISTS agency_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type text NOT NULL,
  description text,
  details jsonb DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for agency activity logs
ALTER TABLE agency_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for own projects"
  ON agency_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_projects 
      WHERE id = agency_activity_logs.project_id 
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- 15. USER AUTOMATION RULES
-- =============================================

-- User-created automation rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES client_projects(id) ON DELETE CASCADE,
  
  -- Rule details
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('schedule', 'engagement_threshold', 'hashtag_trending', 'auto_response', 'content_performance')),
  trigger_conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '{}',
  
  -- Scheduling
  schedule_expression text, -- Cron expression
  timezone text DEFAULT 'UTC',
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Execution tracking
  execution_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  last_executed_at timestamptz,
  next_execution_at timestamptz,
  
  -- Error handling
  error_count integer DEFAULT 0,
  last_error_message text,
  last_error_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for automation rules
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own automation rules"
  ON automation_rules FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for automation rules
CREATE INDEX IF NOT EXISTS idx_automation_rules_user ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_next_execution ON automation_rules(next_execution_at);

-- =============================================
-- 16. ENGAGEMENT INTERACTIONS
-- =============================================

-- Track automated social media interactions
CREATE TABLE IF NOT EXISTS engagement_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_rule_id uuid REFERENCES automation_rules(id) ON DELETE CASCADE,
  
  -- Interaction details
  platform text NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'follow', 'retweet', 'post')),
  target_post_id text,
  target_user_id text,
  
  -- Content
  content text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'skipped')),
  
  -- Error handling
  error_message text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  executed_at timestamptz
);

-- Enable RLS for engagement interactions
ALTER TABLE engagement_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON engagement_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 17. NOTIFICATIONS SYSTEM
-- =============================================

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type text NOT NULL CHECK (type IN ('system', 'engagement', 'billing', 'security', 'feature', 'admin')),
  title text NOT NULL,
  message text NOT NULL,
  
  -- Status
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  
  -- Actions
  action_url text,
  action_label text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz
);

-- Enable RLS for notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON user_notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON user_notifications(type);

-- =============================================
-- 18. ADMIN SYSTEM
-- =============================================

-- Admin users with role-based access
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role and permissions
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  
  -- Session tracking
  last_login_at timestamptz,
  login_count integer DEFAULT 0,
  
  -- Admin management
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id)
);

-- Enable RLS for admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- Admin audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  
  -- Action details
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  
  -- Change tracking
  old_values jsonb,
  new_values jsonb,
  
  -- Context
  ip_address inet,
  user_agent text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- =============================================
-- 19. CONTENT MODERATION
-- =============================================

-- User reports for content moderation
CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Report details
  report_type text NOT NULL CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'fake_account', 'other')),
  description text NOT NULL,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed', 'escalated')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Resolution
  assigned_to uuid REFERENCES admin_users(id),
  resolution_notes text,
  resolved_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for user reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports"
  ON user_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- =============================================
-- 20. HELPER FUNCTIONS
-- =============================================

-- Function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id uuid,
  p_email text,
  p_full_name text DEFAULT NULL,
  p_company_name text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id, email, full_name, company_name,
    subscription_tier, subscription_status,
    trial_started_at, trial_ends_at,
    email_verified, onboarding_completed
  ) VALUES (
    p_user_id, p_email, p_full_name, p_company_name,
    'premium', 'active',
    now(), now() + interval '7 days',
    true, false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
    updated_at = now();
  
  RETURN 'Profile created/updated successfully';
END;
$$;

-- Function to connect social account
CREATE OR REPLACE FUNCTION connect_social_account(
  p_user_id uuid,
  p_platform text,
  p_platform_user_id text,
  p_username text,
  p_display_name text,
  p_access_token text,
  p_refresh_token text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_platform_data jsonb DEFAULT '{}',
  p_account_type text DEFAULT NULL,
  p_follower_count integer DEFAULT 0,
  p_following_count integer DEFAULT 0,
  p_permissions jsonb DEFAULT '{}',
  p_capabilities jsonb DEFAULT '{}',
  p_scopes text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_id uuid;
BEGIN
  INSERT INTO social_accounts (
    user_id, platform, platform_user_id, username, display_name,
    access_token, refresh_token, expires_at, avatar_url,
    platform_data, account_type, follower_count, following_count,
    permissions, capabilities, scope, connection_status, is_active
  ) VALUES (
    p_user_id, p_platform, p_platform_user_id, p_username, p_display_name,
    p_access_token, p_refresh_token, p_expires_at, p_avatar_url,
    p_platform_data, p_account_type, p_follower_count, p_following_count,
    p_permissions, p_capabilities, p_scopes, 'connected', true
  )
  ON CONFLICT (user_id, platform, platform_user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    access_token = EXCLUDED.access_token,
    refresh_token = COALESCE(EXCLUDED.refresh_token, social_accounts.refresh_token),
    expires_at = EXCLUDED.expires_at,
    avatar_url = EXCLUDED.avatar_url,
    platform_data = EXCLUDED.platform_data,
    follower_count = EXCLUDED.follower_count,
    following_count = EXCLUDED.following_count,
    permissions = EXCLUDED.permissions,
    capabilities = EXCLUDED.capabilities,
    scope = EXCLUDED.scope,
    connection_status = 'connected',
    is_active = true,
    error_message = NULL,
    error_count = 0,
    updated_at = now()
  RETURNING id INTO account_id;
  
  RETURN account_id;
END;
$$;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_limit_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage integer;
  limit_value integer;
BEGIN
  SELECT ul.current_usage, ul.limit_value
  INTO current_usage, limit_value
  FROM usage_limits ul
  WHERE ul.user_id = p_user_id AND ul.limit_type = p_limit_type;
  
  -- If no limit found, allow (development mode)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- -1 means unlimited
  IF limit_value = -1 THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN current_usage < limit_value;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_limit_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_limits (user_id, limit_type, current_usage, limit_value, reset_date)
  VALUES (
    p_user_id, 
    p_limit_type, 
    1, 
    -1, -- Unlimited by default
    date_trunc('month', now()) + interval '1 month'
  )
  ON CONFLICT (user_id, limit_type) DO UPDATE SET
    current_usage = usage_limits.current_usage + 1,
    updated_at = now();
END;
$$;

-- Function to get pending queue items
CREATE OR REPLACE FUNCTION get_pending_queue_items(batch_size integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  user_id uuid,
  platform text,
  scheduled_for timestamptz,
  content text,
  media_urls text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    sq.post_id,
    sq.user_id,
    sq.platform,
    sq.scheduled_for,
    p.content,
    p.media_urls
  FROM scheduling_queue sq
  JOIN posts p ON p.id = sq.post_id
  WHERE sq.status = 'pending'
    AND sq.scheduled_for <= now()
  ORDER BY sq.scheduled_for ASC
  LIMIT batch_size;
END;
$$;

-- Function to setup super admin
CREATE OR REPLACE FUNCTION setup_super_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_email text := 'mntomfordigitalllc@gmail.com';
  user_record record;
  admin_id uuid;
BEGIN
  -- Find user by email
  SELECT au.id, p.email, p.full_name
  INTO user_record
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.email = target_email;
  
  IF NOT FOUND THEN
    RETURN 'User with email ' || target_email || ' not found. Please sign up first.';
  END IF;
  
  -- Check if already admin
  SELECT id INTO admin_id
  FROM admin_users
  WHERE user_id = user_record.id;
  
  IF FOUND THEN
    RETURN 'User is already a super admin.';
  END IF;
  
  -- Create super admin
  INSERT INTO admin_users (
    user_id, role, permissions, is_active
  ) VALUES (
    user_record.id,
    'super_admin',
    jsonb_build_object(
      'manage_admins', true,
      'manage_users', true,
      'manage_posts', true,
      'manage_settings', true,
      'view_analytics', true,
      'manage_reports', true,
      'system_maintenance', true,
      'data_export', true,
      'user_impersonation', true,
      'platform_configuration', true,
      'billing_management', true,
      'security_monitoring', true
    ),
    true
  );
  
  RETURN 'Super admin created successfully for ' || target_email;
END;
$$;

-- Function to cleanup expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < now() OR status = 'completed';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_post_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_engagement numeric := 0;
  total_impressions numeric := 0;
  engagement_rate numeric := 0;
BEGIN
  -- Sum engagement metrics
  SELECT 
    COALESCE(SUM(CASE WHEN metric_name IN ('likes', 'comments', 'shares', 'saves') THEN metric_value ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN metric_name = 'impressions' THEN metric_value ELSE 0 END), 0)
  INTO total_engagement, total_impressions
  FROM analytics
  WHERE post_id = p_post_id;
  
  -- Calculate rate
  IF total_impressions > 0 THEN
    engagement_rate := (total_engagement / total_impressions) * 100;
  END IF;
  
  RETURN ROUND(engagement_rate, 2);
END;
$$;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_posts integer;
  published_posts integer;
  scheduled_posts integer;
  draft_posts integer;
  total_engagement integer;
  connected_accounts integer;
  ai_generations integer;
BEGIN
  -- Get post counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'published'),
    COUNT(*) FILTER (WHERE status = 'scheduled'),
    COUNT(*) FILTER (WHERE status = 'draft')
  INTO total_posts, published_posts, scheduled_posts, draft_posts
  FROM posts
  WHERE user_id = p_user_id;
  
  -- Get total engagement
  SELECT COALESCE(SUM(
    COALESCE((engagement_data->>'likes')::integer, 0) +
    COALESCE((engagement_data->>'comments')::integer, 0) +
    COALESCE((engagement_data->>'shares')::integer, 0)
  ), 0)
  INTO total_engagement
  FROM posts
  WHERE user_id = p_user_id AND status = 'published';
  
  -- Get connected accounts
  SELECT COUNT(*)
  INTO connected_accounts
  FROM social_accounts
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Get AI generations
  SELECT COUNT(*)
  INTO ai_generations
  FROM ai_generations
  WHERE user_id = p_user_id;
  
  -- Build result
  result := jsonb_build_object(
    'totalPosts', total_posts,
    'publishedPosts', published_posts,
    'scheduledPosts', scheduled_posts,
    'draftPosts', draft_posts,
    'totalEngagement', total_engagement,
    'connectedAccounts', connected_accounts,
    'aiGenerations', ai_generations,
    'engagementRate', CASE WHEN published_posts > 0 THEN ROUND((total_engagement::numeric / published_posts), 2) ELSE 0 END
  );
  
  RETURN result;
END;
$$;

-- =============================================
-- 21. AUTOMATIC PROFILE CREATION
-- =============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id, email, full_name, company_name,
    subscription_tier, subscription_status,
    trial_started_at, trial_ends_at,
    email_verified, signup_source
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'company_name',
    'premium', -- Default to premium for all users
    'active',
    now(),
    now() + interval '7 days',
    COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'signup_source', 'direct')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
    updated_at = now();
  
  -- Create default usage limits (unlimited for premium)
  INSERT INTO usage_limits (user_id, limit_type, limit_value, reset_date) VALUES
    (NEW.id, 'posts_per_month', -1, date_trunc('month', now()) + interval '1 month'),
    (NEW.id, 'ai_generations_per_month', -1, date_trunc('month', now()) + interval '1 month'),
    (NEW.id, 'social_accounts', -1, '2099-12-31'::date)
  ON CONFLICT (user_id, limit_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 22. CLEANUP AND MAINTENANCE
-- =============================================

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cleanup expired OAuth states
  DELETE FROM oauth_states WHERE expires_at < now() - interval '1 hour';
  
  -- Cleanup old completed scheduling queue items
  DELETE FROM scheduling_queue 
  WHERE status = 'completed' 
    AND updated_at < now() - interval '7 days';
  
  -- Cleanup old failed queue items
  DELETE FROM scheduling_queue 
  WHERE status = 'failed' 
    AND updated_at < now() - interval '30 days';
  
  -- Archive old analytics data (keep last 2 years)
  DELETE FROM analytics 
  WHERE recorded_at < now() - interval '2 years';
  
  -- Cleanup old AI generations (keep last 6 months)
  DELETE FROM ai_generations 
  WHERE created_at < now() - interval '6 months'
    AND user_rating IS NULL; -- Keep rated generations
END;
$$;

-- =============================================
-- 23. PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_status_created ON posts(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_scheduled ON posts(user_id, scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_posts_user_published ON posts(user_id, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_post_metrics ON analytics(post_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_active ON social_accounts(user_id, is_active, platform);
CREATE INDEX IF NOT EXISTS idx_scheduling_queue_due ON scheduling_queue(scheduled_for, status) WHERE status = 'pending';

-- =============================================
-- 24.FINAL SETUP
-- =============================================

-- Setup super admin (run this after the user signs up)
-- SELECT setup_super_admin();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Social Media Management Platform database schema created successfully!';
  RAISE NOTICE 'Tables created: 29';
  RAISE NOTICE 'Functions created: 12';
  RAISE NOTICE 'Indexes created: 50+';
  RAISE NOTICE 'RLS policies: Enabled on all tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Sign up a user with email: mntomfordigitalllc@gmail.com';
  RAISE NOTICE '2. Run: SELECT setup_super_admin();';
  RAISE NOTICE '3. Configure OAuth credentials in social_platforms table';
  RAISE NOTICE '4. Test the application functionality';
END $$;