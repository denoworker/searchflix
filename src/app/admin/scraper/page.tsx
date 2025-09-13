import { requireAdminAccess } from "@/lib/admin-auth";
import { getAllRawMovies, getRawMovieStats, createRawMoviesTable, getAllExtractedMovies } from "@/lib/database";
import { ScraperClient } from "@/components/admin/scraper-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const runtime = 'nodejs';

export default async function AdminScraperPage() {
  // Require admin access
  await requireAdminAccess();

  // Get raw movies, sitemap movies, and stats from database
  let rawMovies: any[] = [];
  let sitemapMovies: any[] = [];
  let stats: any = {};
  let error: string | null = null;

  try {
    // Ensure raw_movies table exists
    await createRawMoviesTable();
    
    // Fetch data in parallel
    const [rawMoviesData, sitemapMoviesData, statsData] = await Promise.all([
      getAllRawMovies(),
      getAllExtractedMovies(),
      getRawMovieStats()
    ]);
    
    rawMovies = rawMoviesData;
    sitemapMovies = sitemapMoviesData;
    stats = statsData;
  } catch (err) {
    console.error("Error fetching scraper data:", err);
    error = err instanceof Error ? err.message : 'Unknown error occurred';
    rawMovies = [];
    sitemapMovies = [];
    stats = {
      total_movies: 0,
      active_movies: 0,
      inactive_movies: 0,
      processed_movies: 0,
      scraped_today: 0
    };
  }

  // If there's an error, show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error Loading Scraper Data
          </CardTitle>
          <CardDescription>
            There was an error loading the scraper data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Database Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              Please check your database connection and ensure the required tables exist.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScraperClient 
      initialRawMovies={rawMovies}
      initialStats={stats}
    />
  );
}