import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';

// GET /api/items/:id/family - Get entire item family tree
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

    // Determine the base item ID (root of the family tree)
    const baseId = item.baseItemId || item.parentItem || itemId;

    // Find the base item
    const baseItem = await ClothingItem.findById(baseId)
      .populate('variations')
      .lean();

    if (!baseItem) {
      return NextResponse.json(
        { error: 'Base item not found' },
        { status: 404 }
      );
    }

    // Build the family tree recursively
    const buildTree = async (itemId: string, depth = 0): Promise<Record<string, unknown> | null> => {
      const currentItem = await ClothingItem.findById(itemId)
        .populate('variations')
        .lean();

      if (!currentItem) return null;

      const children = currentItem.variations || [];
      const childTrees = await Promise.all(
        children.map((childId) => buildTree(childId.toString(), depth + 1))
      );

      return {
        ...currentItem,
        depth,
        children: childTrees.filter(Boolean),
      };
    };

    const familyTree = await buildTree(baseId.toString());

    // Also get flat list of all family members
    const allMembers = await ClothingItem.find({
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
      data: {
        tree: familyTree,
        flatList: allMembers,
        baseItem: baseItem,
        totalVariations: allMembers.length - 1, // Exclude base item
      },
    });
  } catch (error) {
    console.error('Error fetching item family:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item family' },
      { status: 500 }
    );
  }
}
