-- Migration: Add content_fetched column to content table
-- Run this in the Supabase SQL editor

-- Add column to track whether full article content has been fetched
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS content_fetched BOOLEAN NOT NULL DEFAULT FALSE;

-- Index to speed up the backfill query (finding un-enriched articles)
CREATE INDEX IF NOT EXISTS idx_content_not_fetched 
ON content (content_type, content_fetched, published_at DESC)
WHERE content_fetched = FALSE AND content_type = 'article';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'content' AND column_name = 'content_fetched';
