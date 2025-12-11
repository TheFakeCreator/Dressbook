import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outfit from '@/models/Outfit';
import TimelineEntry from '@/models/TimelineEntry';
import { generateOutfitSuggestions, getCharacterBasedSuggestions, SuggestionParams } from '@/lib/outfitSuggestions';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    const excludeId = searchParams.get('excludeId');
    const characterId = searchParams.get('characterId');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const historicalPeriod = searchParams.get('historicalPeriod');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Fetch all outfits with populated items
    const allOutfits = await Outfit.find()
      .populate({
        path: 'items.itemId',
        select: 'name color imageUrl'
      })
      .lean();

    let suggestions;

    if (characterId) {
      // Get character's outfits from timeline entries
      const timelineEntries = await TimelineEntry.find({ characterId })
        .select('outfitId')
        .lean();
      
      const characterOutfitIds = new Set(
        timelineEntries.map(entry => entry.outfitId?.toString()).filter(Boolean)
      );
      
      const characterOutfits = allOutfits.filter(
        outfit => characterOutfitIds.has(outfit._id.toString())
      );
      
      suggestions = getCharacterBasedSuggestions(
        characterOutfits,
        allOutfits,
        limit
      );
    } else {
      // Get parameter-based suggestions
      const params: SuggestionParams = {
        tags: tags.length > 0 ? tags : undefined,
        colors: colors.length > 0 ? colors : undefined,
        historicalPeriod: historicalPeriod || undefined,
        excludeOutfitIds: excludeId ? [excludeId] : undefined,
        limit
      };

      suggestions = generateOutfitSuggestions(allOutfits, params);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching outfit suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outfit suggestions' },
      { status: 500 }
    );
  }
}
