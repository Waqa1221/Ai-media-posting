/*
  # Media Library Table

  1. New Tables
    - `media_library`
      - `id` (uuid, primary key) - Unique media identifier
      - `user_id` (uuid, foreign key, not null) - References profiles table
      - `name` (text, not null) - Display name
      - `original_name` (text, not null) - Original filename
      - `type` (text, not null) - image | video | audio | document
      - `mime_type` (text, not null) - File MIME type
      - `size_bytes` (bigint, not null) - File size in bytes
      - `url` (text, not null) - Media URL
      - `thumbnail_url` (text) - Thumbnail URL
      - `storage_path` (text) - Storage location path
      - `folder_path` (text) - Organization folder path (default /)
      - `tags` (text array) - Media tags (default {})
      - `alt_text` (text) - Accessibility alt text
      - `description` (text) - Media description
      - `usage_count` (integer) - Times used in posts (default 0)
      - `last_used_at` (timestamptz) - Last usage timestamp
      - `metadata` (jsonb) - Additional file metadata (default {})
      - `uploaded_at` (timestamptz) - Upload timestamp (default now)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `media_library` table
    - Add policy for users to manage their own media files
*/

CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  storage_path text,
  folder_path text DEFAULT '/' NOT NULL,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  alt_text text,
  description text,
  usage_count integer DEFAULT 0 NOT NULL,
  last_used_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  uploaded_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own media"
  ON media_library FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON media_library FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_media_library_user_id ON media_library(user_id);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder_path ON media_library(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_at ON media_library(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN (tags);