/*
  # Fix profiles table schema

  1. Schema Updates
    - Add missing columns to profiles table
    - Update trial-related columns
    - Add proper defaults and constraints

  2. Data Migration
    - Update existing profiles with default values
    - Ensure compatibility with existing code
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add account_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'trial' CHECK (account_status IN ('trial', 'premium', 'canceled', 'suspended'));
  END IF;

  -- Add trial_started_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_started_at timestamptz DEFAULT now();
  END IF;

  -- Add trial_ends_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '7 days');
  END IF;

  -- Update subscription_tier column to match expected values
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
    
    -- Add new constraint with correct values
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('trial', 'premium', 'canceled'));
  END IF;

  -- Update subscription_status column to match expected values
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
    
    -- Add new constraint with correct values
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
    CHECK (subscription_status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'suspended'));
  END IF;
END $$;

-- Update existing profiles to have proper default values
UPDATE profiles 
SET 
  account_status = COALESCE(account_status, 'trial'),
  subscription_tier = COALESCE(subscription_tier, 'trial'),
  subscription_status = COALESCE(subscription_status, 'trialing'),
  trial_started_at = COALESCE(trial_started_at, created_at),
  trial_ends_at = COALESCE(trial_ends_at, created_at + interval '7 days')
WHERE 
  account_status IS NULL 
  OR subscription_tier IS NULL 
  OR subscription_status IS NULL 
  OR trial_started_at IS NULL 
  OR trial_ends_at IS NULL;

-- Create or replace the create_user_profile function
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id uuid,
  p_email text,
  p_full_name text DEFAULT NULL,
  p_company_name text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_end timestamptz;
BEGIN
  -- Calculate trial end date (7 days from now)
  v_trial_end := now() + interval '7 days';
  
  -- Insert the profile with all required fields
  INSERT INTO profiles (
    id,
    email,
    full_name,
    company_name,
    account_status,
    subscription_tier,
    subscription_status,
    trial_started_at,
    trial_ends_at,
    email_verified,
    onboarding_completed,
    has_agency_setup,
    credits_remaining,
    timezone,
    language
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_company_name,
    'trial',
    'trial',
    'trialing',
    now(),
    v_trial_end,
    false,
    false,
    false,
    100,
    'UTC',
    'en'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name),
    updated_at = now();
  
  RETURN 'Profile created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;