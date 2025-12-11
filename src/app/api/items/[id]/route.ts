import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';

/**
 * GET /api/items/:id
 * Get a single clothing item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const item = await ClothingItem.findById(id).lean();

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch item',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/items/:id
 * Update a clothing item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const item = await ClothingItem.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update item';
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
 * DELETE /api/items/:id
 * Delete a clothing item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const item = await ClothingItem.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete item',
      },
      { status: 500 }
    );
  }
}
