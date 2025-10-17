/*
  # Social Accounts Table

  1. New Tables
    - `social_accounts`
      - `id` (uuid, primary key) - Unique account identifier
      - `user_id` (uuid, foreign key) - References profiles table
      - `platform` (text, not null) - twitter | linkedin | facebook | instagram | tiktok | youtube | pinterest
      - `platform_user_id` (text, not null) - External platform user ID
      - `username` (text) - Platform username
      - `display_name` (text) - Display name on platform
      - `avatar_url` (text) - Profile picture URL
      - `access_token` (text, not null) - OAuth access token
      - `refresh_token` (text) - OAuth refresh token
      - `token_type` (text) - Token type (default Bearer)
      - `expires_at` (timestamptz) - Token expiration timestamp
      - `is_active` (boolean) - Active status (default true)
      - `is_verified` (boolean) - Verification status (default false)
      - `connection_status` (text) - Connection health status (default connected)
      - `last_sync_at` (timestamptz) - Last sync timestamp (default now)
      - `platform_data` (jsonb) - Additional platform-specific data (default {})
      - `account_type` (text) - Account type (personal, business, etc.)
      - `follower_count` (integer) - Number of followers (default 0)
      - `following_count` (integer) - Number of following (default 0)
      - `posts_count` (integer) - Number of posts (default 0)
      - `error_message` (text) - Last error message
      - `error_count` (integer) - Number of errors (default 0)
      - `last_error_at` (timestamptz) - Last error timestamp
      - `permissions` (jsonb) - Account permissions (default {})
      - `capabilities` (jsonb) - Account capabilities (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `social_accounts` table
    - Add policy for users to read their own social accounts
    - Add policy for users to manage their own social accounts
*/

CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'pinterest')),
  platform_user_id text NOT NULL,
  username text,
  display_name text,
  avatar_url text,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer' NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  is_verified boolean DEFAULT false NOT NULL,
  connection_status text DEFAULT 'connected' NOT NULL,
  last_sync_at timestamptz DEFAULT now() NOT NULL,
  platform_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  account_type text,
  follower_count integer DEFAULT 0 NOT NULL,
  following_count integer DEFAULT 0 NOT NULL,
  posts_count integer DEFAULT 0 NOT NULL,
  error_message text,
  error_count integer DEFAULT 0 NOT NULL,
  last_error_at timestamptz,
  permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
  capabilities jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform, platform_user_id)
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own social accounts"
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
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_is_active ON social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_user_id ON social_accounts(platform_user_id);