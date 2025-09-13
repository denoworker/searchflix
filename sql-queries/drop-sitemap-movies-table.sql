-- Drop sitemap_movies table as it's being replaced by extracted_movies
DROP TABLE IF EXISTS sitemap_movies CASCADE;

-- Drop related functions and triggers
DROP FUNCTION IF EXISTS update_sitemap_movies_updated_at() CASCADE;

COMMIT;