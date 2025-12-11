import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TimelineEntry from '@/models/TimelineEntry';

/**
 * GET /api/timeline/:id
 * Get a single timeline entry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const entry = await TimelineEntry.findById(id)
      .populate('characterId')
      .populate({
        path: 'outfitId',
        populate: {
          path: 'items.itemId',
        },
      })
      .lean();

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeline entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error fetching timeline entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch timeline entry',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/timeline/:id
 * Update a timeline entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const entry = await TimelineEntry.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate('characterId')
      .populate({
        path: 'outfitId',
        populate: {
          path: 'items.itemId',
        },
      })
      .lean();

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeline entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error updating timeline entry:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update timeline entry';
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
 * DELETE /api/timeline/:id
 * Delete a timeline entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const entry = await TimelineEntry.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeline entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Timeline entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting timeline entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete timeline entry',
      },
      { status: 500 }
    );
  }
}
