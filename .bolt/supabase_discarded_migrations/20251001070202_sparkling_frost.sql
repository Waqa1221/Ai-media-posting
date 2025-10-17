/*
  # Usage Tracking Functions

  1. Functions
    - `increment_usage` - Increment user usage counters
    - `check_usage_limit` - Check if user can perform action
    - `reset_monthly_usage` - Reset usage counters monthly

  2. Tables
    - `usage_limits` - User usage limits and current usage
*/

-- Create usage_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  limit_type text NOT NULL,
  current_usage integer DEFAULT 0,
  limit_value integer NOT NULL, -- -1 means unlimited
  reset_date timestamptz NOT NULL,
  reset_frequency text DEFAULT 'monthly',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, limit_type)
);

-- Enable RLS
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own usage limits"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits"
  ON usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits"
  ON usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_type ON usage_limits(limit_type);
CREATE INDEX IF NOT EXISTS idx_usage_limits_reset_date ON usage_limits(reset_date);

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_limit_type text
)
RETURNS void AS $$
BEGIN
  -- Insert or update usage record
  INSERT INTO usage_limits (
    user_id,
    limit_type,
    current_usage,
    limit_value,
    reset_date
  ) VALUES (
    p_user_id,
    p_limit_type,
    1,
    -1, -- Unlimited by default
    date_trunc('month', now()) + interval '1 month'
  )
  ON CONFLICT (user_id, limit_type)
  DO UPDATE SET
    current_usage = usage_limits.current_usage + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_limit_type text
)
RETURNS boolean AS $$
DECLARE
  v_limit_record usage_limits%ROWTYPE;
BEGIN
  -- Get usage limit record
  SELECT * INTO v_limit_record
  FROM usage_limits
  WHERE user_id = p_user_id AND limit_type = p_limit_type;
  
  -- If no limit record exists, allow the action (unlimited)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If limit is -1, it's unlimited
  IF v_limit_record.limit_value = -1 THEN
    RETURN true;
  END IF;
  
  -- Check if current usage is below limit
  RETURN v_limit_record.current_usage < v_limit_record.limit_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE usage_limits
  SET 
    current_usage = 0,
    reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE reset_date <= now()
    AND reset_frequency = 'monthly';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_usage_limits_updated_at ON usage_limits;
CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();