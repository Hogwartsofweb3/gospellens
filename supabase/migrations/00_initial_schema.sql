-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  auth_provider text,
  preferred_topics text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2. ministries
CREATE TABLE IF NOT EXISTS public.ministries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  banner_url text,
  website text,
  description text,
  is_verified boolean DEFAULT false,
  rss_feed_urls text[],
  youtube_channel_id text,
  podcast_feed_url text,
  category text,
  follower_count integer DEFAULT 0,
  display_as text,
  is_featured boolean DEFAULT false,
  content_count integer DEFAULT 0,
  last_ingested_at timestamptz,
  ingestion_error_count integer DEFAULT 0,
  topic_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. content
CREATE TABLE IF NOT EXISTS public.content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_id uuid REFERENCES public.ministries(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('article', 'video', 'podcast', 'audio')),
  source_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  published_at timestamptz,
  topic_tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES public.content(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- 5. user_follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ministry_id uuid REFERENCES public.ministries(id) ON DELETE CASCADE,
  followed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, ministry_id)
);


-- 7. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  body text,
  type text CHECK (type IN ('new_content', 'ministry', 'billing', 'system')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- users: users can only read/edit own row
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- ministries: all authenticated users can read
CREATE POLICY "Ministries are viewable by authenticated users" 
ON public.ministries FOR SELECT 
TO authenticated 
USING (true);

-- content: all authenticated users can read
CREATE POLICY "Content is viewable by authenticated users" 
ON public.content FOR SELECT 
TO authenticated 
USING (true);

-- bookmarks: users can only CRUD own bookmarks
CREATE POLICY "Users can view own bookmarks" 
ON public.bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" 
ON public.bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON public.bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- user_follows: users can only CRUD own follows
CREATE POLICY "Users can view own follows" 
ON public.user_follows FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follows" 
ON public.user_follows FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows" 
ON public.user_follows FOR DELETE 
USING (auth.uid() = user_id);

-- notifications: users can only CRUD own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- RPC Functions
CREATE OR REPLACE FUNCTION increment_view_count(content_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.content
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ingestion_error(min_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.ministries
  SET ingestion_error_count = ingestion_error_count + 1
  WHERE id = min_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_follower_count(min_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.ministries
  SET follower_count = follower_count + 1
  WHERE id = min_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_follower_count(min_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.ministries
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = min_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
