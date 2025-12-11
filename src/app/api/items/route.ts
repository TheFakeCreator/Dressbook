import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';

/**
 * GET /api/items
 * Get all clothing items with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest';
    const includeVariations = searchParams.get('includeVariations') === 'true';
    const onlyBase = searchParams.get('onlyBase') === 'true';

    // Build query
    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Variation filtering
    if (onlyBase) {
      // Only show base items (items without a parent)
      query.parentItem = { $exists: false };
    } else if (!includeVariations) {
      // Default behavior: exclude variations from results
      query.parentItem = { $exists: false };
    }
    // If includeVariations is true, show everything (no filter)

    // Build sort object
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first
    
    switch (sort) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'name-asc':
        sortObj = { name: 1 };
        break;
      case 'name-desc':
        sortObj = { name: -1 };
        break;
      case 'category':
        sortObj = { category: 1, name: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ClothingItem.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      ClothingItem.countDocuments(query),
    ]);

    // Add variation counts to items
    const itemsWithVariationCounts = await Promise.all(
      items.map(async (item) => {
        const variationCount = await ClothingItem.countDocuments({
          parentItem: item._id,
        });
        return {
          ...item,
          variationCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: itemsWithVariationCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clothing items',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new clothing item
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and category are required',
        },
        { status: 400 }
      );
    }

    const item = await ClothingItem.create(body);

    return NextResponse.json(
      {
        success: true,
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create clothing item';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
