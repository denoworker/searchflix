import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateUserRole, getUserByEmail } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if current user is already an admin
    const isCurrentUserAdmin = isAdminEmail(session.user.email);
    if (!isCurrentUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = 'admin' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role
    await updateUserRole(user.id, role);

    return NextResponse.json({
      success: true,
      message: `User ${email} has been made an ${role}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role
      }
    });

  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current user's admin status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = isAdminEmail(session.user.email);
    const user = await getUserByEmail(session.user.email);

    return NextResponse.json({
      user: {
        email: session.user.email,
        name: session.user.name,
        isAdmin,
        role: user?.role || 'user'
      }
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}