import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin-config'
import { getUserByEmail, getAllExtractedMovies, getExtractedMovieStats } from '@/lib/database'
import { UrlsClient } from '@/components/admin/urls-client'

export const metadata: Metadata = {
  title: 'Movie URLs - Admin | SearchFLIX',
  description: 'View and manage extracted movie URLs from scraper',
}

export default async function AdminUrlsPage() {
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
      <UrlsClient 
        initialMovies={movies}
        initialStats={stats}
      />
    </div>
  )
}