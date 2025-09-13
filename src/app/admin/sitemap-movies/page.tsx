import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin-config'
import { getUserByEmail, getAllExtractedMovies, getExtractedMovieStats } from '@/lib/database'
import { SitemapMoviesClient } from '@/components/admin/sitemap-movies-client'

export const metadata: Metadata = {
  title: 'Sitemap Movies - Admin | SearchFLIX',
  description: 'Manage extracted movie URLs from sitemaps',
}

export default async function SitemapMoviesPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/api/auth/signin')
  }

  // Check if user is admin
  if (!isAdminEmail(session.user.email)) {
    redirect('/')
  }

  // Get user from database
  const user = await getUserByEmail(session.user.email)
  if (!user) {
    redirect('/api/auth/signin')
  }

  // Fetch extracted movies and stats
  const [movies, stats] = await Promise.all([
    getAllExtractedMovies(),
    getExtractedMovieStats()
  ])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sitemap Movies</h1>
        <p className="text-muted-foreground">
          View and manage movie URLs extracted from sitemaps
        </p>
      </div>

      <SitemapMoviesClient 
        initialMovies={movies}
        initialStats={stats}
      />
    </div>
  )
}