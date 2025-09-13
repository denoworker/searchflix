"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { 
  ExternalLink, 
  Search,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Link2,
  Globe,
  Calendar,
  Loader2
} from "lucide-react"

interface ExtractedMovie {
  id: number
  sitemap_id: number
  title: string
  url: string
  site_name?: string
  extracted_at: string
  created_at: string
  updated_at: string
  status: string
}

interface UrlsClientProps {
  initialMovies: ExtractedMovie[]
  initialStats: any
}

export function UrlsClient({ 
  initialMovies, 
  initialStats 
}: UrlsClientProps) {
  const [movies, setMovies] = React.useState<ExtractedMovie[]>(initialMovies)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sitemapFilter, setSitemapFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(25)
  const [isLoading, setIsLoading] = React.useState(false)
  const [scrapingMovieId, setScrapingMovieId] = React.useState<number | null>(null)
  const [selectedMovies, setSelectedMovies] = React.useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = React.useState(false)

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

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sitemapFilter])

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL Copied",
        description: "Movie URL has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Are you sure you want to delete this movie URL?")) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/sitemap-movies/${movieId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete movie')
      }

      setMovies(prev => prev.filter(movie => movie.id !== movieId))
      toast({
        title: "Movie Deleted",
        description: "Movie URL has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete movie URL",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScrapeMovie = async (movieId: number, movieUrl: string) => {
    setScrapingMovieId(movieId)
    
    try {
      const response = await fetch('/api/admin/scraper/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieUrl,
          movieId,
          downloadImages: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully scraped movie data from URL`
        })
        
        // Update movie status to processed
        setMovies(prev => 
          prev.map(movie => 
            movie.id === movieId 
              ? { ...movie, status: 'processed' }
              : movie
          )
        )
      } else {
        throw new Error(data.error || 'Failed to scrape movie')
      }
    } catch (error) {
      console.error('Error scraping movie:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to scrape movie',
        variant: "destructive"
      })
    } finally {
      setScrapingMovieId(null)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/sitemap-movies')
      if (response.ok) {
        const data = await response.json()
        setMovies(data.movies)
        toast({
          title: "Refreshed",
          description: "Movie URLs have been refreshed",
        })
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh movie URLs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allMovieIds = new Set(paginatedMovies.map(movie => movie.id))
      setSelectedMovies(allMovieIds)
    } else {
      setSelectedMovies(new Set())
    }
  }

  const handleSelectMovie = (movieId: number, checked: boolean) => {
    const newSelected = new Set(selectedMovies)
    if (checked) {
      newSelected.add(movieId)
    } else {
      newSelected.delete(movieId)
    }
    setSelectedMovies(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedMovies.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedMovies.size} selected movie URLs?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const deletePromises = Array.from(selectedMovies).map(movieId =>
        fetch(`/api/admin/sitemap-movies/${movieId}`, {
          method: 'DELETE',
        })
      )

      const results = await Promise.allSettled(deletePromises)
      const failedCount = results.filter(result => result.status === 'rejected').length
      
      if (failedCount === 0) {
        setMovies(prev => prev.filter(movie => !selectedMovies.has(movie.id)))
        setSelectedMovies(new Set())
        toast({
          title: "Movies Deleted",
          description: `Successfully deleted ${selectedMovies.size} movie URLs`,
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${selectedMovies.size - failedCount} of ${selectedMovies.size} movie URLs`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected movie URLs",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'processed': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movie URLs</CardTitle>
              <CardDescription>
                Manage extracted movie URLs from sitemaps
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedMovies.size > 0 && (
                <Button 
                  onClick={handleBulkDelete} 
                  disabled={isDeleting} 
                  variant="destructive"
                  size="sm"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete ({selectedMovies.size})
                </Button>
              )}
              <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <div className="text-sm text-muted-foreground mb-4">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMovies.length)} of {filteredMovies.length} URLs
          </div>

          {/* URLs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMovies.size === paginatedMovies.length && paginatedMovies.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Link2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" || sitemapFilter !== "all" 
                            ? "No URLs match your filters" 
                            : "No movie URLs found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovies.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMovies.has(movie.id)}
                          onCheckedChange={(checked) => handleSelectMovie(movie.id, checked as boolean)}
                          aria-label={`Select ${movie.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[300px]" title={movie.title}>
                          {movie.title || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{movie.site_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={movie.status === 'active' ? 'default' : movie.status === 'processed' ? 'secondary' : 'outline'}>
                          {movie.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(movie.url, '_blank')}
                            title="Open URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleScrapeMovie(movie.id, movie.url)}
                            disabled={scrapingMovieId === movie.id || movie.status === 'processed'}
                            title="Scrape Movie"
                          >
                            {scrapingMovieId === movie.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMovie(movie.id)}
                            title="Delete Movie"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}