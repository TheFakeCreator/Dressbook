import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Character from '@/models/Character';

/**
 * GET /api/characters/:id
 * Get a single character by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const character = await Character.findById(id)
      .populate('defaultOutfit')
      .lean();

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: 'Character not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: character,
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch character',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/characters/:id
 * Update a character
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const character = await Character.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate('defaultOutfit')
      .lean();

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: 'Character not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: character,
    });
  } catch (error) {
    console.error('Error updating character:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update character';
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
 * DELETE /api/characters/:id
 * Delete a character
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const character = await Character.findByIdAndDelete(id);

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: 'Character not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Character deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete character',
      },
      { status: 500 }
    );
  }
}
