const { Pool } = require('pg')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Running migration to add missing columns...')
    
    const sql = fs.readFileSync('./sql-queries/add-missing-columns.sql', 'utf8')
    await pool.query(sql)
    
    console.log('✅ Migration completed successfully!')
    console.log('Added columns: quality, size, language, image_data')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()