import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-auth'
import { getAllRawMovies, getRawMovieStats, getSitemapById } from '@/lib/database'
import { MovieScraper, ScrapingProgress } from '@/lib/scraper'

// GET - Fetch all raw movies and stats
export async function GET() {
  try {
    await requireAdminAccess()
    
    const [rawMovies, stats] = await Promise.all([
      getAllRawMovies(),
      getRawMovieStats()
    ])
    
    return NextResponse.json({
      success: true,
      rawMovies,
      stats
    })
  } catch (error) {
    console.error('Error fetching scraper data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scraper data' },
      { status: 500 }
    )
  }
}

// POST - Start scraping process
export async function POST(request: NextRequest) {
  try {
    await requireAdminAccess()
    
    const { sitemapId, numberOfPosts, downloadImages = false } = await request.json()
    
    if (!sitemapId || !numberOfPosts) {
      return NextResponse.json(
        { error: 'Sitemap ID and number of posts are required' },
        { status: 400 }
      )
    }
    
    // Get sitemap details
    const sitemap = await getSitemapById(sitemapId)
    if (!sitemap) {
      return NextResponse.json(
        { error: 'Sitemap not found' },
        { status: 404 }
      )
    }
    
    // Validate HDHub4u URL
    if (!sitemap.url.includes('hdhub4u')) {
      return NextResponse.json(
        { error: 'This scraper only works with HDHub4u websites' },
        { status: 400 }
      )
    }
    
    // Create scraper instance with progress tracking
    let currentProgress: ScrapingProgress = {
      total: numberOfPosts,
      completed: 0,
      failed: 0,
      status: 'idle'
    }
    
    const scraper = new MovieScraper((progress) => {
      currentProgress = progress
      console.log(`Scraping progress: ${progress.completed}/${progress.total} (${progress.failed} failed)`);
    })
    
    // Start scraping process
    console.log(`Starting HDHub4u scraping from: ${sitemap.url}`);
    const result = await scraper.scrapeMovies(sitemap.url, numberOfPosts, sitemapId)
    
    // Process images if requested
    if (downloadImages && result.movies.length > 0) {
      console.log('Processing movie images...');
      // Note: Image processing is handled within the scraper
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully scraped ${result.success} movies (${result.failed} failed)`,
      scrapedCount: result.success,
      failedCount: result.failed,
      progress: currentProgress
    })
  } catch (error) {
    console.error('Error scraping movies:', error)
    return NextResponse.json(
      { error: 'Failed to scrape movies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}