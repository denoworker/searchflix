"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  ExternalLink, 
  Trash2, 
  Film,
  Calendar,
  Globe,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExtractedMovie {
  id: number
  sitemap_id: number
  title: string
  url: string
  site_name: string
  extracted_at: string
  created_at: string
  updated_at: string
  status: string
}

interface SitemapMoviesClientProps {
  initialMovies: ExtractedMovie[]
  initialStats: any
}

export function SitemapMoviesClient({ 
  initialMovies, 
  initialStats 
}: SitemapMoviesClientProps) {
  const [movies, setMovies] = React.useState<ExtractedMovie[]>(initialMovies)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sitemapFilter, setSitemapFilter] = React.useState<string>("all")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  // Get unique sitemaps for filter
  const uniqueSitemaps = React.useMemo(() => {
    const sitemaps = new Map()
    movies.forEach(movie => {
      if (movie.site_name && !sitemaps.has(movie.sitemap_id)) {
        sitemaps.set(movie.sitemap_id, movie.site_name)
      }
    })
    return Array.from(sitemaps.entries()).map(([id, name]) => ({ id, name }))
  }, [movies])

  // Filter movies based on search, status, and sitemap
  const filteredMovies = React.useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.site_name && movie.site_name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === "all" || movie.status === statusFilter
      const matchesSitemap = sitemapFilter === "all" || movie.sitemap_id.toString() === sitemapFilter
      
      return matchesSearch && matchesStatus && matchesSitemap
    })
  }, [movies, searchTerm, statusFilter, sitemapFilter])

  // Handle delete
  const handleDelete = async (movieId: number) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/extracted-movies?id=${movieId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete movie')
      }

      // Remove movie from local state
      setMovies(prev => prev.filter(movie => movie.id !== movieId))
      
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      })

    } catch (error) {
      console.error('Error deleting movie:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete movie',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'processed': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats?.total_movies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Extracted from sitemaps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Movies</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats?.active_movies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready for processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats?.processed_movies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Already scraped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitemaps</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats?.total_sitemaps_with_movies || 0}</div>
            <p className="text-xs text-muted-foreground">
              With extracted movies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search movies, URLs, or sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sitemapFilter} onValueChange={setSitemapFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by sitemap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sitemaps</SelectItem>
            {uniqueSitemaps.map(sitemap => (
              <SelectItem key={sitemap.id} value={sitemap.id.toString()}>
                {sitemap.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMovies.length} of {movies.length} movies
      </div>

      {/* Movies Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie Title</TableHead>
              <TableHead>Sitemap</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Extracted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Film className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || sitemapFilter !== "all" 
                        ? "No movies match your filters" 
                        : "No movies found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovies.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {movie.url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movie.site_name || `Sitemap ${movie.sitemap_id}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(movie.status)}>
                      {movie.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(movie.extracted_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(movie.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{movie.movie_title}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(movie.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}