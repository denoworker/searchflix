import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSitemapById, updateSitemap, deleteSitemap } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';
import { getUserByEmail } from '@/lib/database';

export const runtime = 'nodejs';

// GET - Fetch single sitemap
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sitemapId = parseInt(params.id);
    if (isNaN(sitemapId)) {
      return NextResponse.json(
        { error: 'Invalid sitemap ID' },
        { status: 400 }
      );
    }

    const sitemap = await getSitemapById(sitemapId);
    if (!sitemap) {
      return NextResponse.json(
        { error: 'Sitemap not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sitemap
    });

  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update sitemap
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sitemapId = parseInt(params.id);
    if (isNaN(sitemapId)) {
      return NextResponse.json(
        { error: 'Invalid sitemap ID' },
        { status: 400 }
      );
    }

    // Check if sitemap exists
    const existingSitemap = await getSitemapById(sitemapId);
    if (!existingSitemap) {
      return NextResponse.json(
        { error: 'Sitemap not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { site_name, url, status } = body;

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Update sitemap
    const updated = await updateSitemap(sitemapId, {
      site_name,
      url,
      status
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update sitemap' },
        { status: 500 }
      );
    }

    // Fetch updated sitemap
    const updatedSitemap = await getSitemapById(sitemapId);

    return NextResponse.json({
      success: true,
      message: 'Sitemap updated successfully',
      sitemap: updatedSitemap
    });

  } catch (error) {
    console.error('Error updating sitemap:', error);
    
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

// DELETE - Delete sitemap
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sitemapId = parseInt(params.id);
    if (isNaN(sitemapId)) {
      return NextResponse.json(
        { error: 'Invalid sitemap ID' },
        { status: 400 }
      );
    }

    // Check if sitemap exists
    const existingSitemap = await getSitemapById(sitemapId);
    if (!existingSitemap) {
      return NextResponse.json(
        { error: 'Sitemap not found' },
        { status: 404 }
      );
    }

    // Delete sitemap
    const deleted = await deleteSitemap(sitemapId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete sitemap' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sitemap deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting sitemap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}