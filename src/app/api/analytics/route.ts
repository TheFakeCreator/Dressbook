import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TimelineEntryModel from '@/models/TimelineEntry';
import OutfitModel from '@/models/Outfit';
import ClothingItemModel from '@/models/ClothingItem';
import CharacterModel from '@/models/Character';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET() {
  try {
    await dbConnect();

    // Get timeline entries with populated references
    const timelineEntries = await TimelineEntryModel.find({})
      .populate('characterId', 'name')
      .populate('outfitId', 'name')
      .lean();

    // 1. Most used outfits (by timeline appearances)
    const outfitUsage = new Map<string, { id: string; name: string; count: number }>();
    timelineEntries.forEach((entry: any) => {
      if (entry.outfitId?._id) {
        const id = entry.outfitId._id.toString();
        const existing = outfitUsage.get(id);
        if (existing) {
          existing.count++;
        } else {
          outfitUsage.set(id, {
            id,
            name: entry.outfitId.name || 'Unnamed Outfit',
            count: 1,
          });
        }
      }
    });
    const topOutfits = Array.from(outfitUsage.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2. Most active characters (by timeline appearances)
    const characterUsage = new Map<string, { id: string; name: string; count: number }>();
    timelineEntries.forEach((entry: any) => {
      if (entry.characterId?._id) {
        const id = entry.characterId._id.toString();
        const existing = characterUsage.get(id);
        if (existing) {
          existing.count++;
        } else {
          characterUsage.set(id, {
            id,
            name: entry.characterId.name || 'Unnamed Character',
            count: 1,
          });
        }
      }
    });
    const topCharacters = Array.from(characterUsage.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Most used items (by outfit appearances)
    const outfits = await OutfitModel.find({})
      .populate('items.itemId', 'name category')
      .lean();

    const itemUsage = new Map<string, { id: string; name: string; category: string; count: number }>();
    outfits.forEach((outfit: any) => {
      if (outfit.items) {
        outfit.items.forEach((item: any) => {
          if (item.itemId?._id) {
            const id = item.itemId._id.toString();
            const existing = itemUsage.get(id);
            if (existing) {
              existing.count++;
            } else {
              itemUsage.set(id, {
                id,
                name: item.itemId.name || 'Unnamed Item',
                category: item.itemId.category || 'Uncategorized',
                count: 1,
              });
            }
          }
        });
      }
    });
    const topItems = Array.from(itemUsage.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Category distribution
    const categoryDistribution = new Map<string, number>();
    const items = await ClothingItemModel.find({}, 'category').lean();
    items.forEach((item: any) => {
      const category = item.category || 'Uncategorized';
      categoryDistribution.set(category, (categoryDistribution.get(category) || 0) + 1);
    });
    const categoryStats = Array.from(categoryDistribution.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // 5. Timeline coverage by chapter
    const chapterCoverage = new Map<string, number>();
    timelineEntries.forEach((entry: any) => {
      if (entry.chapter) {
        const chapter = entry.chapter.toString();
        chapterCoverage.set(chapter, (chapterCoverage.get(chapter) || 0) + 1);
      }
    });
    const chapterStats = Array.from(chapterCoverage.entries())
      .map(([chapter, count]) => ({ chapter, count }))
      .sort((a, b) => {
        const chapterA = parseInt(a.chapter) || 0;
        const chapterB = parseInt(b.chapter) || 0;
        return chapterA - chapterB;
      });

    // 6. Overall statistics
    const totalItems = await ClothingItemModel.countDocuments();
    const totalOutfits = await OutfitModel.countDocuments();
    const totalCharacters = await CharacterModel.countDocuments();
    const totalTimelineEntries = await TimelineEntryModel.countDocuments();

    // 7. Outfit patterns (most common tags)
    const tagFrequency = new Map<string, number>();
    const allOutfits = await OutfitModel.find({}, 'tags').lean();
    allOutfits.forEach((outfit: any) => {
      if (outfit.tags) {
        outfit.tags.forEach((tag: string) => {
          tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
        });
      }
    });
    const topTags = Array.from(tagFrequency.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 8. Character wardrobe diversity (unique outfits per character)
    const characterWardrobe = new Map<string, Set<string>>();
    timelineEntries.forEach((entry: any) => {
      if (entry.characterId?._id && entry.outfitId?._id) {
        const charId = entry.characterId._id.toString();
        const outfitId = entry.outfitId._id.toString();
        if (!characterWardrobe.has(charId)) {
          characterWardrobe.set(charId, new Set());
        }
        characterWardrobe.get(charId)!.add(outfitId);
      }
    });
    const wardrobeStats = Array.from(characterWardrobe.entries())
      .map(([charId, outfits]) => {
        const charData = timelineEntries.find((e: any) => e.characterId?._id?.toString() === charId);
        const character = charData?.characterId;
        return {
          characterId: charId,
          characterName: typeof character !== 'string' ? character?.name || 'Unknown' : 'Unknown',
          uniqueOutfits: outfits.size,
        };
      })
      .sort((a, b) => b.uniqueOutfits - a.uniqueOutfits);

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalItems,
          totalOutfits,
          totalCharacters,
          totalTimelineEntries,
        },
        topOutfits,
        topCharacters,
        topItems,
        categoryDistribution: categoryStats,
        chapterCoverage: chapterStats,
        topTags,
        characterWardrobe: wardrobeStats,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
