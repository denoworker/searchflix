"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { EditMovieDialog } from "@/components/admin/edit-movie-dialog"
import { 
  Trash2, 
  Calendar,
  Search,
  Database,
  Edit
} from "lucide-react"

interface ScraperClientProps {
  initialRawMovies: any[]
  initialStats: any
}

export function ScraperClient({ initialRawMovies, initialStats }: ScraperClientProps) {
  const [rawMovies, setRawMovies] = React.useState(initialRawMovies)
  const [stats, setStats] = React.useState(initialStats)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedMovies, setSelectedMovies] = React.useState<number[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [editingMovieId, setEditingMovieId] = React.useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  // Filter movies based on search term
  const filteredMovies = rawMovies.filter(movie => {
    if (!movie) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      (movie.title && movie.title.toLowerCase().includes(searchLower)) ||
      (movie.genre && movie.genre.toLowerCase().includes(searchLower)) ||
      (movie.director && movie.director.toLowerCase().includes(searchLower))
    )
  })

  // Handle select all movies
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMovies(filteredMovies.map(movie => movie.id))
    } else {
      setSelectedMovies([])
    }
  }

  // Handle individual movie selection
  const handleSelectMovie = (movieId: number, checked: boolean) => {
    if (checked) {
      setSelectedMovies(prev => [...prev, movieId])
    } else {
      setSelectedMovies(prev => prev.filter(id => id !== movieId))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedMovies.length === 0) return
    
    setIsDeleting(true)
    try {
      const deletePromises = selectedMovies.map(movieId => 
        fetch(`/api/admin/scraper/${movieId}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const failedDeletes = results.filter(result => !result.ok)
      
      if (failedDeletes.length === 0) {
        toast({
          title: "Success",
          description: `${selectedMovies.length} movies deleted successfully.`
        })
        
        // Remove from local state
        setRawMovies(prev => prev.filter(movie => !selectedMovies.includes(movie.id)))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total_movies: prev.total_movies - selectedMovies.length,
          active_movies: prev.active_movies - selectedMovies.length
        }))
        
        setSelectedMovies([])
      } else {
        throw new Error(`Failed to delete ${failedDeletes.length} movies`)
      }
    } catch (error) {
      console.error('Error deleting movies:', error)
      toast({
        title: "Error",
        description: "Failed to delete some movies.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit movie
  const handleEditMovie = (movieId: number) => {
    setEditingMovieId(movieId)
    setIsEditDialogOpen(true)
  }

  // Handle movie updated
  const handleMovieUpdated = (updatedMovie: any) => {
    setRawMovies(prev => prev.map(movie => 
      movie.id === updatedMovie.id ? updatedMovie : movie
    ))
  }

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
    setEditingMovieId(null)
  }





  // Delete raw movie
  const handleDeleteRawMovie = async (movieId: number) => {
    try {
      const response = await fetch(`/api/admin/scraper/${movieId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Movie deleted successfully."
        })
        
        // Remove from local state
        setRawMovies(prev => prev.filter(movie => movie.id !== movieId))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total_movies: prev.total_movies - 1,
          active_movies: prev.active_movies - 1
        }))
      } else {
        throw new Error('Failed to delete movie')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast({
        title: "Error",
        description: "Failed to delete movie.",
        variant: "destructive"
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'processed':
        return 'secondary'
      case 'inactive':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Raw Movies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Scraped Movies ({filteredMovies.length})
              </CardTitle>
              <CardDescription>
                Detailed movie data scraped from movie pages. This is the final processed data.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedMovies.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedMovies.length})
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scraped movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredMovies.length > 0 && selectedMovies.length === filteredMovies.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all movies"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {rawMovies.length === 0 
                            ? "No movies scraped yet. Use the scraper below to extract movie data."
                            : "No movies match your search criteria."
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovies.slice(0, 20).map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMovies.includes(movie.id)}
                          onCheckedChange={(checked) => handleSelectMovie(movie.id, checked as boolean)}
                          aria-label={`Select ${movie.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="truncate max-w-[250px]" title={movie.title}>
                            {movie.title}
                          </div>
                          {movie.director && (
                            <div className="text-xs text-muted-foreground">
                              Dir: {movie.director}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{movie.genre || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(movie.status)}>
                          {movie.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMovie(movie.id)}
                            title="Edit Movie"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRawMovie(movie.id)}
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
          {filteredMovies.length > 20 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing first 20 of {filteredMovies.length} movies. Use search to find specific movies.
              </p>
            </div>
          )}
        </CardContent>
      </Card>




      {/* Edit Movie Dialog */}
       <EditMovieDialog
         isOpen={isEditDialogOpen}
         onClose={handleEditDialogClose}
         movieId={editingMovieId}
         onMovieUpdated={handleMovieUpdated}
       />
    </div>
  )
}