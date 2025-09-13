"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Globe,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Sitemap {
  id: number
  site_name: string
  url: string
  status: string
  created_at: string
  updated_at: string
  created_by: number
  creator_name?: string
  creator_email?: string
}

interface SitemapManagementClientProps {
  initialSitemaps: Sitemap[]
  initialStats: any
}

export function SitemapManagementClient({ 
  initialSitemaps, 
  initialStats 
}: SitemapManagementClientProps) {
  const [sitemaps, setSitemaps] = React.useState<Sitemap[]>(initialSitemaps)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [editingSitemap, setEditingSitemap] = React.useState<Sitemap | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = React.useState({
    site_name: "",
    url: "",
    status: "active"
  })

  // Filter sitemaps based on search and status
  const filteredSitemaps = React.useMemo(() => {
    return sitemaps.filter(sitemap => {
      const matchesSearch = 
        sitemap.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sitemap.url.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || sitemap.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [sitemaps, searchTerm, statusFilter])

  // Reset form
  const resetForm = () => {
    setFormData({
      site_name: "",
      url: "",
      status: "active"
    })
    setEditingSitemap(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingSitemap 
        ? `/api/admin/sitemaps/${editingSitemap.id}`
        : '/api/admin/sitemaps'
      
      const method = editingSitemap ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save sitemap')
      }

      // Refresh sitemaps list
      await refreshSitemaps()
      
      // Show success message with movie extraction info
      let description = data.message || `Sitemap ${editingSitemap ? 'updated' : 'created'} successfully`
      
      if (!editingSitemap && data.movieCount !== undefined) {
        if (data.movieCount > 0) {
          description += `. Found and stored ${data.movieCount} movie URLs.`
        } else {
          description += `. No movie URLs were found in the sitemap.`
        }
        
        if (data.parseError) {
          description += ` Warning: ${data.parseError}`
        }
      }
      
      toast({
        title: "Success",
        description,
      })

      // Close dialog and reset form
      setIsAddDialogOpen(false)
      resetForm()

    } catch (error) {
      console.error('Error saving sitemap:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save sitemap',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (sitemapId: number) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/sitemaps/${sitemapId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete sitemap')
      }

      // Refresh sitemaps list
      await refreshSitemaps()
      
      toast({
        title: "Success",
        description: "Sitemap deleted successfully",
      })

    } catch (error) {
      console.error('Error deleting sitemap:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete sitemap',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh sitemaps from server
  const refreshSitemaps = async () => {
    try {
      const response = await fetch('/api/admin/sitemaps')
      const data = await response.json()
      
      if (response.ok) {
        setSitemaps(data.sitemaps || [])
      }
    } catch (error) {
      console.error('Error refreshing sitemaps:', error)
    }
  }

  // Handle edit
  const handleEdit = (sitemap: Sitemap) => {
    setEditingSitemap(sitemap)
    setFormData({
      site_name: sitemap.site_name,
      url: sitemap.url,
      status: sitemap.status
    })
    setIsAddDialogOpen(true)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Sitemap Button and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sitemaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Sitemap Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sitemap
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSitemap ? 'Edit Sitemap' : 'Add New Sitemap'}
                </DialogTitle>
                <DialogDescription>
                  {editingSitemap 
                    ? 'Update the sitemap information below.'
                    : 'Add a new sitemap to manage website indexing.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder="e.g., My Website"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="url">Sitemap URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/sitemap.xml"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingSitemap ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sitemaps Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSitemaps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "No sitemaps match your filters" 
                        : "No sitemaps found. Add your first sitemap to get started."
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSitemaps.map((sitemap) => (
                <TableRow key={sitemap.id}>
                  <TableCell className="font-medium">
                    {sitemap.site_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]" title={sitemap.url}>
                        {sitemap.url}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(sitemap.url, '_blank')}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(sitemap.status)}>
                      {sitemap.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(sitemap.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sitemap)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Sitemap</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the sitemap for "{sitemap.site_name}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sitemap.id)}
                              className="bg-red-600 hover:bg-red-700"
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

      {/* Results Summary */}
      {filteredSitemaps.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredSitemaps.length} of {sitemaps.length} sitemaps
        </div>
      )}
    </div>
  )
}