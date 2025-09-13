-- Add missing columns to raw_movies table
-- This migration adds quality, size, language, and image_data columns

ALTER TABLE raw_movies 
ADD COLUMN IF NOT EXISTS quality VARCHAR(50),
ADD COLUMN IF NOT EXISTS size VARCHAR(100),
ADD COLUMN IF NOT EXISTS language VARCHAR(100),
ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_raw_movies_quality ON raw_movies(quality);
CREATE INDEX IF NOT EXISTS idx_raw_movies_language ON raw_movies(language);

COMMIT;