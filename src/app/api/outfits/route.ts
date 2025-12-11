import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outfit from '@/models/Outfit';

/**
 * GET /api/outfits
 * Get all outfits with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [outfits, total] = await Promise.all([
      Outfit.find(query)
        .populate('items.itemId', 'name category images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Outfit.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: outfits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch outfits',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/outfits
 * Create a new outfit
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outfit name is required',
        },
        { status: 400 }
      );
    }

    const newOutfit = await Outfit.create(body);

    // Fetch and populate for response
    // @ts-expect-error - Mongoose create type inference issue
    const outfit = await Outfit.findById(String(newOutfit._id))
      .populate('items.itemId', 'name category images')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: outfit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating outfit:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create outfit';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
