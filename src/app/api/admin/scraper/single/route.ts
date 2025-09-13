import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isCurrentUserAdmin } from '@/lib/admin-auth';
import { movieScraper } from '@/lib/scraper';
import { updateExtractedMovieStatus, createRawMovie, getExtractedMovie } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = await isCurrentUserAdmin();
    
    if (!session?.user || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { movieId, movieUrl } = await request.json();

    if (!movieId || !movieUrl) {
      return NextResponse.json(
        { error: 'Movie ID and URL are required' },
        { status: 400 }
      );
    }

    // Update status to processed (indicating it's being processed)
    await updateExtractedMovieStatus(movieId, 'processed');

    try {
      // Get extracted movie record to get sitemap_id
      const extractedMovie = await getExtractedMovie(movieId);
      if (!extractedMovie) {
        return NextResponse.json(
          { error: 'Extracted movie not found' },
          { status: 404 }
        );
      }

      // Scrape the movie data using the URL from extracted movie
      const movieData = await movieScraper.extractMovieDetails(extractedMovie.url);
      
      if (movieData) {
        // Save to raw_movies table
        try {
          await createRawMovie({
            ...movieData,
            scraped_from: extractedMovie.sitemap_id
          });
          
          // Update status to processed
          await updateExtractedMovieStatus(movieId, 'processed');
          
          return NextResponse.json({
            success: true,
            message: 'Movie scraped and saved successfully',
            data: movieData
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Update status back to active if database save failed
          await updateExtractedMovieStatus(movieId, 'active');
          
          return NextResponse.json(
            { error: 'Failed to save movie data to database' },
            { status: 500 }
          );
        }
      } else {
        // Update status back to active if scraping failed
        await updateExtractedMovieStatus(movieId, 'active');
        
        return NextResponse.json(
          { error: 'Failed to scrape movie data' },
          { status: 500 }
        );
      }
    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError);
      
      // Update status back to active if scraping failed
      await updateExtractedMovieStatus(movieId, 'active');
      
      return NextResponse.json(
        { error: 'Failed to scrape movie data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Single movie scraper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}