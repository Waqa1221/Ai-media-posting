/*
  # Subscriptions Table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key) - Unique subscription identifier
      - `user_id` (uuid, foreign key) - References profiles table
      - `stripe_subscription_id` (text, unique, not null) - Stripe subscription ID
      - `stripe_price_id` (text, not null) - Stripe price ID
      - `status` (text) - active | trialing | canceled | past_due | incomplete | suspended (default active)
      - `current_period_start` (timestamptz, not null) - Current billing period start
      - `current_period_end` (timestamptz, not null) - Current billing period end
      - `trial_start` (timestamptz) - Trial start date
      - `trial_end` (timestamptz) - Trial end date
      - `cancel_at_period_end` (boolean) - Cancel at period end flag (default false)
      - `canceled_at` (timestamptz) - Cancellation timestamp
      - `cancellation_reason` (text) - Reason for cancellation
      - `amount_cents` (integer, not null) - Subscription amount in cents
      - `currency` (text) - Currency code (default USD)
      - `metadata` (jsonb) - Additional metadata (default {})
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for users to read their own subscriptions
    - Add policy for users to update their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id text NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'suspended')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  canceled_at timestamptz,
  cancellation_reason text,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);