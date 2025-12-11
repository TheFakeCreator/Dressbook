import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TimelineEntryModel from '@/models/TimelineEntry';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ConflictIssue {
  type: 'multiple_outfits' | 'item_conflict' | 'missing_data';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details: {
    characterId?: string;
    characterName?: string;
    chapter?: string;
    scene?: string;
    outfitIds?: string[];
    outfitNames?: string[];
    itemId?: string;
    itemName?: string;
    entryIds?: string[];
  };
}

export async function GET() {
  try {
    await dbConnect();

    const entries = await TimelineEntryModel.find({})
      .populate('characterId', 'name')
      .populate({
        path: 'outfitId',
        select: 'name items',
        populate: {
          path: 'items.itemId',
          select: 'name category',
        },
      })
      .sort({ chapter: 1, scene: 1, page: 1 })
      .lean();

    const conflicts: ConflictIssue[] = [];

    // Check 1: Multiple outfits for same character in same scene
    const sceneMap = new Map<string, Map<string, any[]>>();

    entries.forEach((entry: any) => {
      if (!entry.chapter || !entry.characterId?._id) return;

      const sceneKey = `${entry.chapter}-${entry.scene || 'unspecified'}`;
      
      if (!sceneMap.has(sceneKey)) {
        sceneMap.set(sceneKey, new Map());
      }

      const characterMap = sceneMap.get(sceneKey)!;
      const charId = entry.characterId._id.toString();

      if (!characterMap.has(charId)) {
        characterMap.set(charId, []);
      }

      characterMap.get(charId)!.push(entry);
    });

    // Report conflicts where character has multiple different outfits in same scene
    sceneMap.forEach((characterMap, sceneKey) => {
      characterMap.forEach((sceneEntries, charId) => {
        if (sceneEntries.length > 1) {
          const uniqueOutfits = new Set(sceneEntries.map((e: any) => e.outfitId?._id?.toString()));
          
          if (uniqueOutfits.size > 1) {
            const [chapter, scene] = sceneKey.split('-');
            conflicts.push({
              type: 'multiple_outfits',
              severity: 'high',
              message: `Character wearing ${uniqueOutfits.size} different outfits in the same scene`,
              details: {
                characterId: charId,
                characterName: sceneEntries[0].characterId?.name,
                chapter,
                scene: scene !== 'unspecified' ? scene : undefined,
                outfitIds: Array.from(uniqueOutfits) as string[],
                outfitNames: sceneEntries.map((e: any) => e.outfitId?.name).filter(Boolean),
                entryIds: sceneEntries.map((e: any) => e._id.toString()),
              },
            });
          }
        }
      });
    });

    // Check 2: Items appearing in multiple outfits worn simultaneously
    const chapterSceneOutfits = new Map<string, Set<string>>();
    const outfitItems = new Map<string, Set<string>>();

    entries.forEach((entry: any) => {
      if (!entry.chapter || !entry.outfitId?._id) return;

      const sceneKey = `${entry.chapter}-${entry.scene || 'unspecified'}`;
      const outfitId = entry.outfitId._id.toString();

      if (!chapterSceneOutfits.has(sceneKey)) {
        chapterSceneOutfits.set(sceneKey, new Set());
      }
      chapterSceneOutfits.get(sceneKey)!.add(outfitId);

      // Map outfit to items
      const outfit = entry.outfitId;
      if (typeof outfit !== 'string' && outfit?.items && !outfitItems.has(outfitId)) {
        const itemIds = outfit.items
          .map((item: any) => item.itemId?._id?.toString())
          .filter(Boolean);
        outfitItems.set(outfitId, new Set(itemIds));
      }
    });

    // Check for item conflicts within each scene
    chapterSceneOutfits.forEach((outfits, sceneKey) => {
      if (outfits.size <= 1) return;

      const outfitArray = Array.from(outfits);
      const itemUsage = new Map<string, string[]>();

      outfitArray.forEach((outfitId) => {
        const items = outfitItems.get(outfitId);
        if (!items) return;

        items.forEach((itemId) => {
          if (!itemUsage.has(itemId)) {
            itemUsage.set(itemId, []);
          }
          itemUsage.get(itemId)!.push(outfitId);
        });
      });

      // Report items used in multiple outfits in the same scene
      itemUsage.forEach((outfitIds, itemId) => {
        if (outfitIds.length > 1) {
          const [chapter, scene] = sceneKey.split('-');
          
          // Find item details from any entry
          const sampleEntry = entries.find((e: any) => 
            outfitIds.includes(e.outfitId?._id?.toString())
          );
          
          const sampleOutfit = sampleEntry?.outfitId;
          const item = typeof sampleOutfit !== 'string' && sampleOutfit?.items
            ? sampleOutfit.items.find((i: any) => i.itemId?._id?.toString() === itemId)
            : undefined;

          conflicts.push({
            type: 'item_conflict',
            severity: 'medium',
            message: `Same clothing item used in multiple outfits in the same scene`,
            details: {
              chapter,
              scene: scene !== 'unspecified' ? scene : undefined,
              itemId,
              itemName: typeof item?.itemId !== 'string' ? item?.itemId?.name : undefined,
              outfitIds,
            },
          });
        }
      });
    });

    // Check 3: Missing critical data
    entries.forEach((entry: any) => {
      if (!entry.chapter) {
        conflicts.push({
          type: 'missing_data',
          severity: 'low',
          message: 'Timeline entry missing chapter information',
          details: {
            characterName: entry.characterId?.name,
            entryIds: [entry._id.toString()],
          },
        });
      }

      if (!entry.outfitId) {
        conflicts.push({
          type: 'missing_data',
          severity: 'high',
          message: 'Timeline entry missing outfit reference',
          details: {
            characterName: entry.characterId?.name,
            chapter: entry.chapter,
            scene: entry.scene,
            entryIds: [entry._id.toString()],
          },
        });
      }

      if (!entry.characterId) {
        conflicts.push({
          type: 'missing_data',
          severity: 'high',
          message: 'Timeline entry missing character reference',
          details: {
            chapter: entry.chapter,
            scene: entry.scene,
            entryIds: [entry._id.toString()],
          },
        });
      }
    });

    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    conflicts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({
      success: true,
      conflicts,
      summary: {
        total: conflicts.length,
        high: conflicts.filter((c) => c.severity === 'high').length,
        medium: conflicts.filter((c) => c.severity === 'medium').length,
        low: conflicts.filter((c) => c.severity === 'low').length,
        byType: {
          multiple_outfits: conflicts.filter((c) => c.type === 'multiple_outfits').length,
          item_conflict: conflicts.filter((c) => c.type === 'item_conflict').length,
          missing_data: conflicts.filter((c) => c.type === 'missing_data').length,
        },
      },
    });
  } catch (error) {
    console.error('Consistency check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check timeline consistency' },
      { status: 500 }
    );
  }
}
