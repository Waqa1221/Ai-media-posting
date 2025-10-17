/*
  # Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key) - Unique admin record identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `role` (text, not null) - super_admin | admin | moderator
      - `permissions` (jsonb) - Admin permissions (default {})
      - `is_active` (boolean) - Active status (default true)
      - `last_login_at` (timestamptz) - Last login timestamp
      - `login_count` (integer) - Number of logins (default 0)
      - `created_by` (uuid) - References profiles table (who created this admin)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for super admins to manage all admin users
    - Add policy for admins to read other admins
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  last_login_at timestamptz,
  login_count integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users admin
      WHERE admin.user_id = auth.uid()
      AND admin.role = 'super_admin'
      AND admin.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users admin
      WHERE admin.user_id = auth.uid()
      AND admin.role = 'super_admin'
      AND admin.is_active = true
    )
  );

CREATE POLICY "Admins can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users admin
      WHERE admin.user_id = auth.uid()
      AND admin.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);