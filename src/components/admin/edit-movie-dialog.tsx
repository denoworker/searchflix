"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface RawMovie {
  id: number
  title: string
  url: string
  description?: string
  image_url?: string
  image_data?: string
  release_date?: string
  genre?: string
  rating?: string
  duration?: string
  director?: string
  cast?: string
  quality?: string
  size?: string
  language?: string
  scraped_from: number
  status: string
  sitemap_name?: string
}

interface Sitemap {
  id: number
  site_name: string
  url: string
  status: string
}

interface EditMovieDialogProps {
  isOpen: boolean
  onClose: () => void
  movieId: number | null
  onMovieUpdated: (updatedMovie: RawMovie) => void
}

export function EditMovieDialog({
  isOpen,
  onClose,
  movieId,
  onMovieUpdated
}: EditMovieDialogProps) {
  const [movie, setMovie] = useState<RawMovie | null>(null)
  const [sitemaps, setSitemaps] = useState<Sitemap[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    image_url: '',
    release_date: '',
    genre: '',
    rating: '',
    duration: '',
    director: '',
    cast: '',
    quality: '',
    size: '',
    language: '',
    scraped_from: '',
    status: 'active'
  })

  // Fetch movie data and sitemaps when dialog opens
  useEffect(() => {
    if (isOpen && movieId) {
      fetchMovieData()
      fetchSitemaps()
    }
  }, [isOpen, movieId])

  // Update form data when movie data is loaded
  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        url: movie.url || '',
        description: movie.description || '',
        image_url: movie.image_url || '',
        release_date: movie.release_date || '',
        genre: movie.genre || '',
        rating: movie.rating || '',
        duration: movie.duration || '',
        director: movie.director || '',
        cast: movie.cast || '',
        quality: movie.quality || '',
        size: movie.size || '',
        language: movie.language || '',
        scraped_from: movie.scraped_from.toString(),
        status: movie.status || 'active'
      })
    }
  }, [movie])

  const fetchMovieData = async () => {
    if (!movieId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/scraper/${movieId}`)
      
      if (response.ok) {
        const data = await response.json()
        setMovie(data.movie)
      } else {
        throw new Error(`Failed to fetch movie data: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching movie:', error)
      toast({
        title: "Error",
        description: "Failed to load movie data.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSitemaps = async () => {
    try {
      const response = await fetch('/api/admin/sitemaps')
      if (response.ok) {
        const data = await response.json()
        setSitemaps(data.sitemaps || [])
      }
    } catch (error) {
      console.error('Error fetching sitemaps:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!movieId) return
    
    setIsSaving(true)
    try {
      const updateData = {
        ...formData,
        scraped_from: parseInt(formData.scraped_from)
      }
      
      const response = await fetch(`/api/admin/scraper/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "Movie updated successfully."
        })
        onMovieUpdated(data.movie)
        onClose()
      } else {
        throw new Error('Failed to update movie')
      }
    } catch (error) {
      console.error('Error updating movie:', error)
      toast({
        title: "Error",
        description: "Failed to update movie.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setMovie(null)
    setFormData({
      title: '',
      url: '',
      description: '',
      image_url: '',
      release_date: '',
      genre: '',
      rating: '',
      duration: '',
      director: '',
      cast: '',
      quality: '',
      size: '',
      language: '',
      scraped_from: '',
      status: 'active'
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Movie</DialogTitle>
          <DialogDescription>
            Update the movie information. All fields are optional except title, URL, and source sitemap.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading movie data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Movie title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="Movie URL"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Movie description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="Movie poster URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scraped_from">Source Sitemap *</Label>
                <Select
                  value={formData.scraped_from}
                  onValueChange={(value) => handleInputChange('scraped_from', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sitemap" />
                  </SelectTrigger>
                  <SelectContent>
                    {sitemaps.map((sitemap) => (
                      <SelectItem key={sitemap.id} value={sitemap.id.toString()}>
                        {sitemap.site_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Movie Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Movie Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  value={formData.release_date}
                  onChange={(e) => handleInputChange('release_date', e.target.value)}
                  placeholder="e.g., 2024, January 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  placeholder="e.g., Action, Comedy, Drama"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="e.g., 8.5/10, PG-13"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 120 min, 2h 30m"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => handleInputChange('director', e.target.value)}
                  placeholder="Director name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cast">Cast</Label>
                <Textarea
                  id="cast"
                  value={formData.cast}
                  onChange={(e) => handleInputChange('cast', e.target.value)}
                  placeholder="Main cast members"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Input
                  id="quality"
                  value={formData.quality}
                  onChange={(e) => handleInputChange('quality', e.target.value)}
                  placeholder="e.g., HD, 4K, 1080p"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">File Size</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., 2.5GB, 1.2TB"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  placeholder="e.g., English, Hindi, Spanish"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}