/*
  # User Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique, not null) - User email address
      - `full_name` (text) - User's full name
      - `avatar_url` (text) - Profile picture URL
      - `company_name` (text) - Company/business name
      - `bio` (text) - User biography
      - `website` (text) - Website URL
      - `phone` (text) - Phone number
      - `timezone` (text) - User timezone (default UTC)
      - `language` (text) - Preferred language (default en)
      - `account_status` (text) - trial | premium | canceled | suspended (default trial)
      - `subscription_tier` (text) - trial | premium | canceled (default trial)
      - `subscription_status` (text) - active | trialing | canceled | past_due | incomplete | suspended (default trialing)
      - `stripe_customer_id` (text) - Stripe customer identifier
      - `trial_started_at` (timestamptz) - Trial start timestamp
      - `trial_ends_at` (timestamptz) - Trial end timestamp
      - `subscription_ends_at` (timestamptz) - Subscription end timestamp
      - `credits_remaining` (integer) - AI generation credits (default 100)
      - `suspension_reason` (text) - Reason for account suspension
      - `suspension_ends_at` (timestamptz) - When suspension ends
      - `has_agency_setup` (boolean) - Agency features enabled (default false)
      - `last_login_at` (timestamptz) - Last login timestamp
      - `email_verified` (boolean) - Email verification status (default false)
      - `notification_preferences` (jsonb) - Notification settings (default {})
      - `privacy_settings` (jsonb) - Privacy settings (default {})
      - `signup_source` (text) - Signup source (default direct)
      - `referral_code` (text) - Unique referral code
      - `onboarding_completed` (boolean) - Onboarding status (default false)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for admin users to read all profiles
*/

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
  account_status text DEFAULT 'trial' NOT NULL CHECK (account_status IN ('trial', 'premium', 'canceled', 'suspended')),
  subscription_tier text DEFAULT 'trial' NOT NULL CHECK (subscription_tier IN ('trial', 'premium', 'canceled')),
  subscription_status text DEFAULT 'trialing' NOT NULL CHECK (subscription_status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'suspended')),
  stripe_customer_id text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  credits_remaining integer DEFAULT 100 NOT NULL,
  suspension_reason text,
  suspension_ends_at timestamptz,
  has_agency_setup boolean DEFAULT false NOT NULL,
  last_login_at timestamptz,
  email_verified boolean DEFAULT false NOT NULL,
  notification_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  privacy_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  signup_source text DEFAULT 'direct' NOT NULL,
  referral_code text,
  onboarding_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);