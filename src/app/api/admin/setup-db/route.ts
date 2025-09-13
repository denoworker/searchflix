import { NextRequest, NextResponse } from 'next/server';
import { createRawMoviesTable } from '@/lib/database';
import { requireAdminAccess } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the raw_movies table
    await createRawMoviesTable();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Raw movies table created successfully' 
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      error: 'Failed to create table', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}