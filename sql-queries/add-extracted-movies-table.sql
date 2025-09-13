-- Create extracted_movies table for storing movie URLs extracted from sitemaps
CREATE TABLE IF NOT EXISTS extracted_movies (
  id SERIAL PRIMARY KEY,
  sitemap_id INTEGER REFERENCES sitemaps(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  site_name VARCHAR(255),
  extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_extracted_movies_sitemap_id ON extracted_movies(sitemap_id);
CREATE INDEX IF NOT EXISTS idx_extracted_movies_title ON extracted_movies(title);
CREATE INDEX IF NOT EXISTS idx_extracted_movies_url ON extracted_movies(url);
CREATE INDEX IF NOT EXISTS idx_extracted_movies_status ON extracted_movies(status);
CREATE INDEX IF NOT EXISTS idx_extracted_movies_extracted_at ON extracted_movies(extracted_at);

-- Add unique constraint to prevent duplicate URLs from same sitemap
ALTER TABLE extracted_movies ADD CONSTRAINT unique_extracted_movie_url_sitemap UNIQUE (url, sitemap_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_extracted_movies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_extracted_movies_updated_at_trigger
    BEFORE UPDATE ON extracted_movies
    FOR EACH ROW
    EXECUTE FUNCTION update_extracted_movies_updated_at();

COMMIT;