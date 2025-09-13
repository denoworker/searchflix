const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration(sqlFile) {
  const client = await pool.connect();
  
  try {
    console.log(`🔄 Running migration: ${sqlFile}`);
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'sql-queries', sqlFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await client.query(sql);
    
    console.log(`✅ Migration completed: ${sqlFile}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${sqlFile}`);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Starting database migration...');
    console.log('');
    
    // Get migration file from command line argument
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('❌ Please provide a migration file name');
      console.log('Usage: node scripts/run-migration.js <migration-file.sql>');
      process.exit(1);
    }
    
    // Check if file exists
    const sqlPath = path.join(__dirname, '..', 'sql-queries', migrationFile);
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }
    
    await runMigration(migrationFile);
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
main();