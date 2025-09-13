-- Create raw_movies table for storing scraped movie data
CREATE TABLE IF NOT EXISTS raw_movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  release_date VARCHAR(100),
  genre VARCHAR(200),
  rating VARCHAR(50),
  duration VARCHAR(50),
  director VARCHAR(200),
  cast TEXT,
  scraped_from INTEGER REFERENCES sitemaps(id),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raw_movies_title ON raw_movies(title);
CREATE INDEX IF NOT EXISTS idx_raw_movies_scraped_from ON raw_movies(scraped_from);
CREATE INDEX IF NOT EXISTS idx_raw_movies_scraped_at ON raw_movies(scraped_at);
CREATE INDEX IF NOT EXISTS idx_raw_movies_status ON raw_movies(status);
CREATE INDEX IF NOT EXISTS idx_raw_movies_created_at ON raw_movies(created_at);

-- Add unique constraint to prevent duplicate URLs from same sitemap
ALTER TABLE raw_movies ADD CONSTRAINT unique_movie_url_sitemap UNIQUE (url, scraped_from);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_raw_movies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_raw_movies_updated_at
    BEFORE UPDATE ON raw_movies
    FOR EACH ROW
    EXECUTE FUNCTION update_raw_movies_updated_at();

COMMIT;