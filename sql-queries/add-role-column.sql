-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create index on role column for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Add constraint to ensure role is not null
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_user_role 
  CHECK (role IN ('user', 'admin', 'moderator', 'premium'));

COMMIT;