import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllExtractedMovies, getExtractedMovieStats, deleteExtractedMovie } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';
import { getUserByEmail } from '@/lib/database';

export const runtime = 'nodejs';

// GET /api/admin/extracted-movies - Get all extracted movies
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';

    let movies;
    let stats = null;

    // Get all extracted movies
    movies = await getAllExtractedMovies();

    if (includeStats) {
      stats = await getExtractedMovieStats();
    }

    return NextResponse.json({
      success: true,
      movies,
      stats,
      count: movies.length
    });

  } catch (error) {
    console.error('Error fetching extracted movies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/extracted-movies - Delete an extracted movie
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('id');

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteExtractedMovie(parseInt(movieId));

    if (!deleted) {
      return NextResponse.json(
        { error: 'Movie not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Extracted movie deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting extracted movie:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}