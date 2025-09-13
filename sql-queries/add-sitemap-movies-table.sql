-- Create sitemap_movies table for storing individual movie URLs from sitemaps
CREATE TABLE IF NOT EXISTS sitemap_movies (
  id SERIAL PRIMARY KEY,
  sitemap_id INTEGER REFERENCES sitemaps(id) ON DELETE CASCADE,
  movie_title VARCHAR(500) NOT NULL,
  movie_url TEXT NOT NULL,
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sitemap_movies_sitemap_id ON sitemap_movies(sitemap_id);
CREATE INDEX IF NOT EXISTS idx_sitemap_movies_title ON sitemap_movies(movie_title);
CREATE INDEX IF NOT EXISTS idx_sitemap_movies_url ON sitemap_movies(movie_url);
CREATE INDEX IF NOT EXISTS idx_sitemap_movies_status ON sitemap_movies(status);
CREATE INDEX IF NOT EXISTS idx_sitemap_movies_extracted_at ON sitemap_movies(extracted_at);

-- Add unique constraint to prevent duplicate URLs from same sitemap
ALTER TABLE sitemap_movies ADD CONSTRAINT unique_movie_url_sitemap UNIQUE (movie_url, sitemap_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_sitemap_movies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sitemap_movies_updated_at_trigger
    BEFORE UPDATE ON sitemap_movies
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_movies_updated_at();

COMMIT;