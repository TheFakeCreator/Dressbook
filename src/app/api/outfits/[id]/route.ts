import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outfit from '@/models/Outfit';

/**
 * GET /api/outfits/:id
 * Get a single outfit by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const outfit = await Outfit.findById(id)
      .populate('items.itemId')
      .lean();

    if (!outfit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outfit not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: outfit,
    });
  } catch (error) {
    console.error('Error fetching outfit:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch outfit',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/outfits/:id
 * Update an outfit
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const outfit = await Outfit.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate('items.itemId')
      .lean();

    if (!outfit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outfit not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: outfit,
    });
  } catch (error) {
    console.error('Error updating outfit:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update outfit';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/outfits/:id
 * Delete an outfit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const outfit = await Outfit.findByIdAndDelete(id);

    if (!outfit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outfit not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Outfit deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete outfit',
      },
      { status: 500 }
    );
  }
}
