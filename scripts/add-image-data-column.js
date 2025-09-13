require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addImageDataColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding image_data column to raw_movies table...');
    
    await client.query(`
      ALTER TABLE raw_movies 
      ADD COLUMN IF NOT EXISTS image_data TEXT
    `);
    
    console.log('✓ Successfully added image_data column');
  } catch (error) {
    console.error('Error adding column:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addImageDataColumn();