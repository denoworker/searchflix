const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function makeUserAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();

  try {
    console.log('Making user admin...');

    // Get the email from command line arguments or use a default
    const email = process.argv[2] || 'filmipovdomains@gmail.com';
    
    console.log(`Looking for user with email: ${email}`);

    // Check if user exists
    const userResult = await client.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User with email ${email} not found`);
      console.log('\nAvailable users:');
      const allUsers = await client.query('SELECT id, email, name, role FROM users ORDER BY id');
      console.table(allUsers.rows);
      return;
    }

    const user = userResult.rows[0];
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('✓ User is already an admin!');
      return;
    }

    // Update user role to admin
    await client.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['admin', user.id]
    );

    console.log(`✅ Successfully made ${user.name} (${user.email}) an admin!`);
    
    // Verify the update
    const updatedUser = await client.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [user.id]
    );
    
    console.log('\nUpdated user info:');
    console.table(updatedUser.rows);

    console.log('\n🎉 Admin setup completed!');
    console.log(`\nThe user ${email} can now access the admin panel at: http://localhost:3000/admin`);

  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js user@example.com');
  console.log('\nIf no email is provided, will use: filmipovdomains@gmail.com');
}

makeUserAdmin();