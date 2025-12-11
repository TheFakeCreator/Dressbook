import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';

// GET /api/items/:id/variations - Get all variations of an item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const itemId = params.id;

    // Find the item
    const item = await ClothingItem.findById(itemId).lean();

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Determine the base item ID
    const baseId = item.baseItemId || item.parentItem || itemId;

    // Find all items with the same base ID (including the base item itself)
    const variations = await ClothingItem.find({
      $or: [
        { _id: baseId },
        { baseItemId: baseId },
        { parentItem: baseId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: variations,
      count: variations.length,
    });
  } catch (error) {
    console.error('Error fetching variations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variations' },
      { status: 500 }
    );
  }
}

// POST /api/items/:id/variations - Create a new variation of an item
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const parentId = params.id;
    const body = await req.json();

    // Find the parent item
    const parentItem = await ClothingItem.findById(parentId);

    if (!parentItem) {
      return NextResponse.json(
        { error: 'Parent item not found' },
        { status: 404 }
      );
    }

    // Determine the base item ID
    const baseId = parentItem.baseItemId || parentItem.parentItem || parentId;

    // Create the variation
    const newVariation = await ClothingItem.create({
      ...body,
      parentItem: parentId,
      baseItemId: baseId,
    });

    // Handle both single document and array return from create()
    const variationDoc = Array.isArray(newVariation) ? newVariation[0] : newVariation;
    const variationId = variationDoc._id.toString();

    // Add this variation to the parent's variations array
    await ClothingItem.findByIdAndUpdate(parentId, {
      $addToSet: { variations: variationId },
    });

    // Populate and return the created variation
    const populatedVariation = await ClothingItem.findById(variationId)
      .populate('parentItem', 'name category')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedVariation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating variation:', error);
    return NextResponse.json(
      { error: 'Failed to create variation' },
      { status: 500 }
    );
  }
}
