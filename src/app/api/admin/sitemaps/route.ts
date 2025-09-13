import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSitemap, getAllSitemaps, getSitemapStats, createExtractedMoviesBatch } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';
import { getUserByEmail } from '@/lib/database';
import { parseSitemapForMovies } from '@/lib/sitemap-parser';

export const runtime = 'nodejs';

// GET - Fetch all sitemaps
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check admin access
    const isEmailAdmin = isAdminEmail(session.user.email);
    const user = await getUserByEmail(session.user.email);
    const isDatabaseAdmin = user?.role === 'admin';
    
    if (!isEmailAdmin && !isDatabaseAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch sitemaps and stats
    const [sitemaps, stats] = await Promise.all([
      getAllSitemaps(),
      getSitemapStats()
    ]);

    return NextResponse.json({
      success: true,
      sitemaps,
      stats
    });

  } catch (error) {
    console.error('Error fetching sitemaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new sitemap
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check admin access
    const isEmailAdmin = isAdminEmail(session.user.email);
    const user = await getUserByEmail(session.user.email);
    const isDatabaseAdmin = user?.role === 'admin';
    
    if (!isEmailAdmin && !isDatabaseAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { site_name, url, status = 'active' } = body;

    // Validate required fields
    if (!site_name || !url) {
      return NextResponse.json(
        { error: 'Site name and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create sitemap first
    const sitemap = await createSitemap({
      site_name,
      url,
      created_by: user.id,
      status
    });

    // Parse sitemap and extract movie URLs
    let movieCount = 0;
    let parseError = null;
    
    try {
      console.log(`Parsing sitemap for movies: ${url}`);
      const parsedMovies = await parseSitemapForMovies(url);
      
      if (parsedMovies.length > 0) {
        const extractedMovies = parsedMovies.map(movie => ({
          sitemap_id: sitemap.id,
          title: movie.title,
          url: movie.url,
          site_name: site_name,
          status: 'active'
        }));
        const createdMovies = await createExtractedMoviesBatch(extractedMovies);
        movieCount = createdMovies.length;
        console.log(`Successfully stored ${movieCount} movies from sitemap`);
      } else {
        console.log('No movies found in sitemap');
      }
    } catch (error) {
      console.error('Error parsing sitemap for movies:', error);
      parseError = error instanceof Error ? error.message : 'Unknown parsing error';
    }

    return NextResponse.json({
      success: true,
      message: `Sitemap created successfully${movieCount > 0 ? ` with ${movieCount} movies extracted` : ''}`,
      sitemap,
      movieCount,
      parseError
    });

  } catch (error) {
    console.error('Error creating sitemap:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique_sitemap_url')) {
      return NextResponse.json(
        { error: 'A sitemap with this URL already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}