-- Create sitemaps table for admin management
CREATE TABLE IF NOT EXISTS sitemaps (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sitemaps_site_name ON sitemaps(site_name);
CREATE INDEX IF NOT EXISTS idx_sitemaps_status ON sitemaps(status);
CREATE INDEX IF NOT EXISTS idx_sitemaps_created_at ON sitemaps(created_at);
CREATE INDEX IF NOT EXISTS idx_sitemaps_created_by ON sitemaps(created_by);

-- Add unique constraint to prevent duplicate URLs
ALTER TABLE sitemaps ADD CONSTRAINT unique_sitemap_url UNIQUE (url);

COMMIT;