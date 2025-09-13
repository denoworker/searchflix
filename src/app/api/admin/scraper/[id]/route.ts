import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-auth'
import { deleteRawMovie, updateRawMovie, getRawMovieById } from '@/lib/database'

// GET - Get a raw movie by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAccess()
    
    const { id } = await params
    const movieId = parseInt(id)
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }
    
    const movie = await getRawMovieById(movieId)
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ movie })
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    )
  }
}

// PUT - Update a raw movie by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAccess()
    
    const { id } = await params
    const movieId = parseInt(id)
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const updatedMovie = await updateRawMovie(movieId, body)
    
    if (!updatedMovie) {
      return NextResponse.json(
        { error: 'Movie not found or could not be updated' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie
    })
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a raw movie by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAccess()
    
    const { id } = await params
    const movieId = parseInt(id)
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }
    
    const success = await deleteRawMovie(movieId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Movie not found or could not be deleted' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}