import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Character from '@/models/Character';

/**
 * GET /api/characters
 * Get all characters with pagination
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [characters, total] = await Promise.all([
      Character.find({})
        .populate('defaultOutfit', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Character.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: characters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch characters',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/characters
 * Create a new character
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
          error: 'Character name is required',
        },
        { status: 400 }
      );
    }

    const newCharacter = await Character.create(body);

    // Fetch and populate for response
    // @ts-expect-error - Mongoose create type inference issue
    const character = await Character.findById(String(newCharacter._id))
      .populate('defaultOutfit', 'name images')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: character,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating character:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create character';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
