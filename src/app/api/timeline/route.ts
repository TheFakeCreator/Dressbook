import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TimelineEntry from '@/models/TimelineEntry';

/**
 * GET /api/timeline
 * Get timeline entries with filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const characterId = searchParams.get('characterId');
    const chapter = searchParams.get('chapter');

    // Build query
    const query: Record<string, unknown> = {};

    if (characterId) {
      query.characterId = characterId;
    }

    if (chapter) {
      query.chapter = chapter;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      TimelineEntry.find(query)
        .populate('characterId', 'name')
        .populate({
          path: 'outfitId',
          populate: {
            path: 'items.itemId',
            select: 'name category images',
          },
        })
        .sort({ chapter: 1, scene: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TimelineEntry.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch timeline entries',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timeline
 * Create a new timeline entry
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.characterId || !body.outfitId || !body.chapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Character, outfit, and chapter are required',
        },
        { status: 400 }
      );
    }

    const newEntry = await TimelineEntry.create(body);

    // Fetch and populate for response
    // @ts-expect-error - Mongoose create type inference issue
    const entry = await TimelineEntry.findById(String(newEntry._id))
      .populate([
        { path: 'characterId', select: 'name' },
        {
          path: 'outfitId',
          populate: {
            path: 'items.itemId',
            select: 'name category images',
          },
        },
      ])
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating timeline entry:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create timeline entry';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
