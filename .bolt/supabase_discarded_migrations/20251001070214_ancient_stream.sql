/*
  # Social Accounts System

  1. New Tables
    - `social_accounts` - Connected social media accounts
    - `social_platforms` - Platform configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for user-scoped access
*/

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  platform_user_id text NOT NULL,
  username text,
  display_name text,
  avatar_url text,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,
  scope text[],
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  connection_status text DEFAULT 'connected',
  last_sync_at timestamptz DEFAULT now(),
  platform_data jsonb DEFAULT '{}',
  account_type text,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  error_message text,
  error_count integer DEFAULT 0,
  last_error_at timestamptz,
  permissions jsonb DEFAULT '{}',
  capabilities jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform, platform_user_id)
);

-- Create social_platforms table
CREATE TABLE IF NOT EXISTS social_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  client_id text,
  client_secret text,
  oauth_authorize_url text NOT NULL,
  oauth_token_url text NOT NULL,
  default_scopes text[] DEFAULT '{}',
  max_post_length integer DEFAULT 280,
  supports_media boolean DEFAULT true,
  supports_scheduling boolean DEFAULT true,
  rate_limit_per_hour integer DEFAULT 100,
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_accounts
CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for social_platforms (read-only for users)
CREATE POLICY "Users can view social platforms"
  ON social_platforms FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_platforms_name ON social_platforms(platform_name);

-- Create triggers
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_platforms_updated_at ON social_platforms;
CREATE TRIGGER update_social_platforms_updated_at
  BEFORE UPDATE ON social_platforms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default social platforms
INSERT INTO social_platforms (
  platform_name,
  display_name,
  description,
  oauth_authorize_url,
  oauth_token_url,
  default_scopes,
  max_post_length,
  supports_media,
  supports_scheduling
) VALUES 
(
  'twitter',
  'Twitter/X',
  'Real-time social networking platform',
  'https://twitter.com/i/oauth2/authorize',
  'https://api.twitter.com/2/oauth2/token',
  ARRAY['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  280,
  true,
  true
),
(
  'instagram',
  'Instagram',
  'Visual content sharing platform',
  'https://www.facebook.com/v18.0/dialog/oauth',
  'https://graph.facebook.com/v18.0/oauth/access_token',
  ARRAY['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
  2200,
  true,
  true
),
(
  'linkedin',
  'LinkedIn',
  'Professional networking platform',
  'https://www.linkedin.com/oauth/v2/authorization',
  'https://www.linkedin.com/oauth/v2/accessToken',
  ARRAY['r_liteprofile', 'r_emailaddress', 'w_member_social'],
  3000,
  true,
  true
),
(
  'facebook',
  'Facebook',
  'Social networking platform',
  'https://www.facebook.com/v18.0/dialog/oauth',
  'https://graph.facebook.com/v18.0/oauth/access_token',
  ARRAY['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
  63206,
  true,
  true
)
ON CONFLICT (platform_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  oauth_authorize_url = EXCLUDED.oauth_authorize_url,
  oauth_token_url = EXCLUDED.oauth_token_url,
  default_scopes = EXCLUDED.default_scopes,
  max_post_length = EXCLUDED.max_post_length,
  supports_media = EXCLUDED.supports_media,
  supports_scheduling = EXCLUDED.supports_scheduling,
  updated_at = now();