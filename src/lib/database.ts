import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Export pool for use in other modules
export { pool }

export interface User {
  id: number
  google_id: string
  email: string
  name?: string
  image_url?: string
  created_at: Date
  updated_at: Date
  last_login: Date
  credits: number
  subscription_status: string
  subscription_id?: string
  subscription_end_date?: Date
  role?: string
}

export interface Sitemap {
  id: number
  site_name: string
  url: string
  created_at: Date
  updated_at: Date
  created_by: number
  status: string
}

export interface CreateSitemapData {
  site_name: string
  url: string
  created_by: number
  status?: string
}

export interface CreateUserData {
  google_id: string
  email: string
  name?: string
  image_url?: string
}

export interface UpdateUserData {
  name?: string
  image_url?: string
  last_login?: Date
}

// Create or update user on login
export async function upsertUser(userData: CreateUserData): Promise<User> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO users (google_id, email, name, image_url, last_login)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (google_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    
    const values = [
      userData.google_id,
      userData.email,
      userData.name || null,
      userData.image_url || null
    ]
    
    const result = await client.query(query, values)
    return result.rows[0] as User
  } finally {
    client.release()
  }
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    const query = 'SELECT * FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])
    
    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await client.query(query, [email])

    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Update user role
export async function updateUserRole(userId: number, role: string): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `
    const result = await client.query(query, [role, userId])
    return result.rowCount > 0
  } finally {
    client.release()
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE id = $1'
    const result = await client.query(query, [id])

    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Update user's last login
export async function updateUserLastLogin(googleId: string): Promise<void> {
  const client = await pool.connect()
  
  try {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = $1
    `
    await client.query(query, [googleId])
  } finally {
    client.release()
  }
}

// Get all users (for admin purposes)
export async function getAllUsers(): Promise<User[]> {
  const client = await pool.connect()
  
  try {
    const query = 'SELECT * FROM users ORDER BY created_at DESC'
    const result = await client.query(query)
    
    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get user statistics
export async function getUserStats() {
  const client = await pool.connect()
  
  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as active_today FROM users WHERE last_login >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as new_this_week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as new_this_month FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'')
    ])
    
    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      activeToday: parseInt(queries[1].rows[0].active_today),
      newThisWeek: parseInt(queries[2].rows[0].new_this_week),
      newThisMonth: parseInt(queries[3].rows[0].new_this_month)
    }
  } finally {
    client.release()
  }
}

// Admin Functions

// Delete user by ID (admin only)
export async function deleteUserById(userId: number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM users WHERE id = $1'
    const result = await client.query(query, [userId])

    return result.rowCount !== null && result.rowCount > 0
  } finally {
    client.release()
  }
}

// Delete user by Google ID (admin only)
export async function deleteUserByGoogleId(googleId: string): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])

    return result.rowCount !== null && result.rowCount > 0
  } finally {
    client.release()
  }
}



// Get recent user activity (admin only)
export async function getRecentUserActivity(limit: number = 50): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users ORDER BY last_login DESC LIMIT $1'
    const result = await client.query(query, [limit])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get users by date range (admin only)
export async function getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT * FROM users
      WHERE created_at >= $1 AND created_at <= $2
      ORDER BY created_at DESC
    `
    const result = await client.query(query, [startDate, endDate])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Search users by email or name (admin only)
export async function searchUsers(searchTerm: string): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT * FROM users
      WHERE email ILIKE $1 OR name ILIKE $1
      ORDER BY created_at DESC
    `
    const result = await client.query(query, [`%${searchTerm}%`])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get detailed user statistics (admin only)
export async function getDetailedUserStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as active_today FROM users WHERE last_login >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as active_week FROM users WHERE last_login >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as active_month FROM users WHERE last_login >= CURRENT_DATE - INTERVAL \'30 days\''),
      client.query('SELECT COUNT(*) as new_today FROM users WHERE created_at >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as new_week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as new_month FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''),
      client.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
    ])

    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      activeToday: parseInt(queries[1].rows[0].active_today),
      activeThisWeek: parseInt(queries[2].rows[0].active_week),
      activeThisMonth: parseInt(queries[3].rows[0].active_month),
      newToday: parseInt(queries[4].rows[0].new_today),
      newThisWeek: parseInt(queries[5].rows[0].new_week),
      newThisMonth: parseInt(queries[6].rows[0].new_month),
      dailySignups: queries[7].rows,
    }
  } finally {
    client.release()
  }
}

// Credit Management Functions

// Get user credits by Google ID
export async function getUserCredits(googleId: string): Promise<number> {
  const client = await pool.connect()

  try {
    const query = 'SELECT credits FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])

    return result.rows[0]?.credits || 0
  } finally {
    client.release()
  }
}

// Deduct credits from user (for AI chat usage)
export async function deductCredits(googleId: string, amount: number = 1): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get current credits
    const currentResult = await client.query('SELECT credits FROM users WHERE google_id = $1', [googleId])
    const currentCredits = currentResult.rows[0]?.credits || 0

    if (currentCredits < amount) {
      await client.query('ROLLBACK')
      return { success: false, newBalance: currentCredits }
    }

    // Deduct credits
    const newBalance = currentCredits - amount
    await client.query(
      'UPDATE users SET credits = $1, updated_at = CURRENT_TIMESTAMP WHERE google_id = $2',
      [newBalance, googleId]
    )

    await client.query('COMMIT')
    return { success: true, newBalance }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Add credits to user (admin function)
export async function addCredits(userId: number, amount: number): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users
      SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `
    const result = await client.query(query, [amount, userId])

    if (result.rows.length === 0) {
      return { success: false, newBalance: 0 }
    }

    return { success: true, newBalance: result.rows[0].credits }
  } finally {
    client.release()
  }
}

// Set user credits (admin function)
export async function setUserCredits(userId: number, credits: number): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users
      SET credits = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `
    const result = await client.query(query, [credits, userId])

    if (result.rows.length === 0) {
      return { success: false, newBalance: 0 }
    }

    return { success: true, newBalance: result.rows[0].credits }
  } finally {
    client.release()
  }
}

// Get credit statistics (admin function)
export async function getCreditStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT AVG(credits) as avg_credits FROM users'),
      client.query('SELECT SUM(credits) as total_credits FROM users'),
      client.query('SELECT COUNT(*) as users_with_zero_credits FROM users WHERE credits = 0'),
      client.query('SELECT COUNT(*) as users_with_low_credits FROM users WHERE credits <= 5'),
      client.query('SELECT MAX(credits) as max_credits FROM users'),
      client.query('SELECT MIN(credits) as min_credits FROM users'),
    ])

    return {
      averageCredits: Math.round(parseFloat(queries[0].rows[0].avg_credits) || 0),
      totalCredits: parseInt(queries[1].rows[0].total_credits) || 0,
      usersWithZeroCredits: parseInt(queries[2].rows[0].users_with_zero_credits) || 0,
      usersWithLowCredits: parseInt(queries[3].rows[0].users_with_low_credits) || 0,
      maxCredits: parseInt(queries[4].rows[0].max_credits) || 0,
      minCredits: parseInt(queries[5].rows[0].min_credits) || 0,
    }
  } finally {
    client.release()
  }
}

// Billing Functions

// Update user subscription status
export async function updateUserSubscription(
  userId: number,
  subscriptionData: {
    subscription_status: string
    subscription_id?: string
    subscription_end_date?: Date
  }
): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users 
      SET subscription_status = $1,
          subscription_id = $2,
          subscription_end_date = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `
    
    const result = await client.query(query, [
      subscriptionData.subscription_status,
      subscriptionData.subscription_id || null,
      subscriptionData.subscription_end_date || null,
      userId
    ])

    return result.rowCount !== null && result.rowCount > 0
  } finally {
    client.release()
  }
}

// Get subscription statistics (admin function)
export async function getSubscriptionStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as free_users FROM users WHERE subscription_status = \'free\''),
      client.query('SELECT COUNT(*) as pro_users FROM users WHERE subscription_status = \'pro\''),
      client.query('SELECT COUNT(*) as active_subscriptions FROM users WHERE subscription_status = \'pro\' AND (subscription_end_date IS NULL OR subscription_end_date > CURRENT_TIMESTAMP)'),
      client.query('SELECT SUM(CASE WHEN subscription_status = \'pro\' THEN 99 ELSE 0 END) as total_revenue FROM users'),
    ])

    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      freeUsers: parseInt(queries[1].rows[0].free_users),
      proUsers: parseInt(queries[2].rows[0].pro_users),
      activeSubscriptions: parseInt(queries[3].rows[0].active_subscriptions),
      totalRevenue: parseInt(queries[4].rows[0].total_revenue) || 0,
    }
  } finally {
    client.release()
  }
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT subscription_status, subscription_end_date
      FROM users
      WHERE id = $1
    `
    const result = await client.query(query, [userId])

    if (result.rows.length === 0) return false

    const user = result.rows[0]
    if (user.subscription_status !== 'pro') return false

    // If no end date, it's active (one-time payment)
    if (!user.subscription_end_date) return true

    // Check if subscription hasn't expired
    return new Date(user.subscription_end_date) > new Date()
  } finally {
    client.release()
  }
}

// Analytics Functions

// Get comprehensive analytics data
export async function getAnalyticsData() {
  const client = await pool.connect()

  try {
    // User analytics
    const userQueries = await Promise.all([
      // Total users
      client.query('SELECT COUNT(*) as total FROM users'),
      // Users by subscription status
      client.query(`
        SELECT
          subscription_status,
          COUNT(*) as count
        FROM users
        GROUP BY subscription_status
      `),
      // New users by day (last 30 days)
      client.query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
      // New users by month (last 12 months)
      client.query(`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `),
      // Active users (logged in last 30 days)
      client.query(`
        SELECT COUNT(*) as active_users
        FROM users
        WHERE last_login >= CURRENT_DATE - INTERVAL '30 days'
      `),
    ])

    // Revenue analytics
    const revenueQueries = await Promise.all([
      // Total revenue (Pro users * $99)
      client.query(`
        SELECT
          COUNT(*) as pro_users,
          COUNT(*) * 99 as total_revenue
        FROM users
        WHERE subscription_status = 'pro'
      `),
      // Revenue by month
      client.query(`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as pro_signups,
          COUNT(*) * 99 as revenue
        FROM users
        WHERE subscription_status = 'pro'
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `),
    ])

    // Credit analytics
    const creditQueries = await Promise.all([
      // Total credits in system
      client.query('SELECT SUM(credits) as total_credits FROM users'),
      // Average credits per user
      client.query('SELECT AVG(credits) as avg_credits FROM users'),
      // Credits distribution (simplified)
      client.query(`
        SELECT
          CASE
            WHEN credits = 0 THEN '0'
            WHEN credits <= 10 THEN '1-10'
            WHEN credits <= 50 THEN '11-50'
            WHEN credits <= 100 THEN '51-100'
            WHEN credits <= 500 THEN '101-500'
            WHEN credits <= 1000 THEN '501-1000'
            ELSE '1000+'
          END as credit_range,
          COUNT(*) as user_count
        FROM users
        GROUP BY
          CASE
            WHEN credits = 0 THEN '0'
            WHEN credits <= 10 THEN '1-10'
            WHEN credits <= 50 THEN '11-50'
            WHEN credits <= 100 THEN '51-100'
            WHEN credits <= 500 THEN '101-500'
            WHEN credits <= 1000 THEN '501-1000'
            ELSE '1000+'
          END
        ORDER BY user_count DESC
      `),
    ])

    return {
      users: {
        total: parseInt(userQueries[0].rows[0].total),
        byStatus: userQueries[1].rows,
        dailySignups: userQueries[2].rows,
        monthlySignups: userQueries[3].rows,
        activeUsers: parseInt(userQueries[4].rows[0].active_users),
      },
      revenue: {
        total: parseInt(revenueQueries[0].rows[0].total_revenue) || 0,
        proUsers: parseInt(revenueQueries[0].rows[0].pro_users),
        monthlyRevenue: revenueQueries[1].rows,
      },
      credits: {
        total: parseInt(creditQueries[0].rows[0].total_credits) || 0,
        average: parseFloat(creditQueries[1].rows[0].avg_credits) || 0,
        distribution: creditQueries[2].rows,
      },
    }
  } finally {
    client.release()
  }
}

// Get growth metrics
export async function getGrowthMetrics() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      // Growth rate (users this month vs last month)
      client.query(`
        SELECT
          COUNT(*) as current_month
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      client.query(`
        SELECT
          COUNT(*) as last_month
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      `),
      // Conversion rate (pro users / total users)
      client.query(`
        SELECT
          COUNT(CASE WHEN subscription_status = 'pro' THEN 1 END) as pro_users,
          COUNT(*) as total_users
        FROM users
      `),
      // Retention (users who logged in this month that were created last month)
      client.query(`
        SELECT
          COUNT(*) as retained_users
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
          AND last_login >= DATE_TRUNC('month', CURRENT_DATE)
      `),
    ])

    const currentMonth = parseInt(queries[0].rows[0].current_month)
    const lastMonth = parseInt(queries[1].rows[0].last_month)
    const proUsers = parseInt(queries[2].rows[0].pro_users)
    const totalUsers = parseInt(queries[2].rows[0].total_users)
    const retainedUsers = parseInt(queries[3].rows[0].retained_users)

    const growthRate = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0
    const retentionRate = lastMonth > 0 ? (retainedUsers / lastMonth) * 100 : 0

    return {
      growthRate: Math.round(growthRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      currentMonth,
      lastMonth,
      proUsers,
      totalUsers,
      retainedUsers,
    }
  } finally {
    client.release()
  }
}

// Close the pool (for cleanup)
// Sitemap management functions
export async function createSitemap(sitemapData: CreateSitemapData): Promise<Sitemap> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO sitemaps (site_name, url, created_by, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    const values = [
      sitemapData.site_name,
      sitemapData.url,
      sitemapData.created_by,
      sitemapData.status || 'active'
    ]
    
    const result = await client.query(query, values)
    return result.rows[0] as Sitemap
  } finally {
    client.release()
  }
}

export async function getAllSitemaps(): Promise<Sitemap[]> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT s.*, u.name as creator_name, u.email as creator_email
      FROM sitemaps s
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.created_at DESC
    `
    const result = await client.query(query)
    return result.rows as Sitemap[]
  } finally {
    client.release()
  }
}

export async function getSitemapById(id: number): Promise<Sitemap | null> {
  const client = await pool.connect()
  
  try {
    const query = 'SELECT * FROM sitemaps WHERE id = $1'
    const result = await client.query(query, [id])
    return result.rows[0] as Sitemap || null
  } finally {
    client.release()
  }
}

export async function updateSitemap(id: number, updateData: Partial<CreateSitemapData>): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    const fields = []
    const values = []
    let paramCount = 1
    
    if (updateData.site_name !== undefined) {
      fields.push(`site_name = $${paramCount++}`)
      values.push(updateData.site_name)
    }
    
    if (updateData.url !== undefined) {
      fields.push(`url = $${paramCount++}`)
      values.push(updateData.url)
    }
    
    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(updateData.status)
    }
    
    if (fields.length === 0) return false
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)
    
    const query = `
      UPDATE sitemaps 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
    `
    
    const result = await client.query(query, values)
    return result.rowCount > 0
  } finally {
    client.release()
  }
}

export async function deleteSitemap(id: number): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    const query = 'DELETE FROM sitemaps WHERE id = $1'
    const result = await client.query(query, [id])
    return result.rowCount > 0
  } finally {
    client.release()
  }
}

export async function getSitemapStats() {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT 
        COUNT(*) as total_sitemaps,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sitemaps,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_sitemaps,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_sitemaps,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as created_today
      FROM sitemaps
    `
    const result = await client.query(query)
    return result.rows[0]
  } finally {
    client.release()
  }
}

export async function closePool(): Promise<void> {
  await pool.end()
}
