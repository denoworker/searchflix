require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkRawMovies() {
  try {
    const result = await pool.query(`
      SELECT title, genre, rating, duration, director, "cast", created_at 
      FROM raw_movies 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('Recent movies in database:');
    console.log('========================');
    
    if (result.rows.length === 0) {
      console.log('No movies found in database.');
    } else {
      result.rows.forEach((movie, index) => {
        console.log(`\n${index + 1}. ${movie.title}`);
        console.log(`   Genre: ${movie.genre || 'Not extracted'}`);
        console.log(`   Rating: ${movie.rating || 'Not extracted'}`);
        console.log(`   Duration: ${movie.duration || 'Not extracted'}`);
        console.log(`   Director: ${movie.director || 'Not extracted'}`);
        console.log(`   Cast: ${movie.cast || 'Not extracted'}`);
        console.log(`   Created: ${movie.created_at}`);
      });
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await pool.end();
  }
}

checkRawMovies();