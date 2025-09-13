require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createRawMoviesTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS raw_movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        release_date VARCHAR(50),
        genre VARCHAR(100),
        rating VARCHAR(20),
        duration VARCHAR(50),
        director VARCHAR(200),
        "cast" TEXT,
        scraped_from INTEGER REFERENCES sitemaps(id),
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        UNIQUE(url, scraped_from)
      );
      
      CREATE INDEX IF NOT EXISTS idx_raw_movies_scraped_from ON raw_movies(scraped_from);
      CREATE INDEX IF NOT EXISTS idx_raw_movies_status ON raw_movies(status);
      CREATE INDEX IF NOT EXISTS idx_raw_movies_scraped_at ON raw_movies(scraped_at);
      
      CREATE OR REPLACE FUNCTION update_raw_movies_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_raw_movies_updated_at_trigger ON raw_movies;
      CREATE TRIGGER update_raw_movies_updated_at_trigger
        BEFORE UPDATE ON raw_movies
        FOR EACH ROW
        EXECUTE FUNCTION update_raw_movies_updated_at();
    `;
    
    await pool.query(query);
    console.log('✅ Raw movies table created successfully!');
  } catch (error) {
    console.error('❌ Error creating raw movies table:', error.message);
    console.error('Full error details:', error);
  } finally {
    await pool.end();
  }
}

createRawMoviesTable();