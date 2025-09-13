import { auth } from "./auth";
import { isAdminEmail, hasAdminPermission, type AdminPermission } from "./admin-config";
import { getUserByEmail } from "./database";
import { redirect } from "next/navigation";

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  
  // Check both email-based admin config and database role
  const isEmailAdmin = isAdminEmail(session.user.email);
  
  try {
    const user = await getUserByEmail(session.user.email);
    const isDatabaseAdmin = user?.role === 'admin';
    
    return isEmailAdmin || isDatabaseAdmin;
  } catch (error) {
    console.error('Error checking database admin status:', error);
    // Fallback to email-based check if database fails
    return isEmailAdmin;
  }
}

// Get current admin user info
export async function getCurrentAdminUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const isEmailAdmin = isAdminEmail(session.user.email);
  
  try {
    const user = await getUserByEmail(session.user.email);
    const isDatabaseAdmin = user?.role === 'admin';
    const isAdmin = isEmailAdmin || isDatabaseAdmin;
    
    if (!isAdmin) return null;
    
    return {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      isAdmin: true,
      role: user?.role || 'admin',
      userId: user?.id
    };
  } catch (error) {
    console.error('Error getting admin user info:', error);
    
    // Fallback to email-based check
    if (!isEmailAdmin) return null;
    
    return {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      isAdmin: true,
      role: 'admin'
    };
  }
}

// Require admin access - redirect if not admin
export async function requireAdminAccess() {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized - Please sign in');
  }
  
  // Check both email-based admin config and database role
  const isEmailAdmin = isAdminEmail(session.user.email);
  
  try {
    const user = await getUserByEmail(session.user.email);
    const isDatabaseAdmin = user?.role === 'admin';
    
    if (!isEmailAdmin && !isDatabaseAdmin) {
      throw new Error('Forbidden - Admin access required');
    }
    
    return session.user;
  } catch (error) {
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      throw error;
    }
    console.error('Error checking admin access:', error);
    // Fallback to email-based check if database fails
    if (!isEmailAdmin) {
      throw new Error('Forbidden - Admin access required');
    }
    return session.user;
  }
}

// Require specific admin permission
export async function requireAdminPermission(permission: AdminPermission) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  
  if (!hasAdminPermission(session.user.email, permission)) {
    redirect("/dashboard?error=insufficient_permissions");
  }
  
  return session.user;
}

// Check admin access without redirect (for API routes)
export async function checkAdminAccess(): Promise<{ isAdmin: boolean; user: any | null }> {
  const session = await auth();
  
  if (!session?.user) {
    return { isAdmin: false, user: null };
  }
  
  const isAdmin = isAdminEmail(session.user.email);
  return { isAdmin, user: session.user };
}
