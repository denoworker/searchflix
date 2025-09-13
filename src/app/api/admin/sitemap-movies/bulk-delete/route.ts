import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteExtractedMovie } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';

export const runtime = 'nodejs';

// POST /api/admin/sitemap-movies/bulk-delete - Delete multiple extracted movies
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { movieIds } = await request.json();

    if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return NextResponse.json(
        { error: 'Movie IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const validIds = movieIds.filter(id => typeof id === 'number' && !isNaN(id));
    if (validIds.length !== movieIds.length) {
      return NextResponse.json(
        { error: 'All movie IDs must be valid numbers' },
        { status: 400 }
      );
    }

    // Delete movies one by one and track results
    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const movieId of validIds) {
      try {
        const deleted = await deleteExtractedMovie(movieId);
        if (deleted) {
          results.deleted++;
        } else {
          results.failed++;
          results.errors.push(`Movie ID ${movieId} not found`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to delete movie ID ${movieId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk delete completed: ${results.deleted} deleted, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Error in bulk delete extracted movies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}