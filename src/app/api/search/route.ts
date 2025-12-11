import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClothingItemModel from '@/models/ClothingItem';
import OutfitModel from '@/models/Outfit';
import CharacterModel from '@/models/Character';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, items, outfits, characters
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const gender = searchParams.get('gender');
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    const geographicOrigin = searchParams.get('geographicOrigin');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const results: Record<string, any> = {
      query,
      page,
      limit,
      items: { data: [], total: 0 },
      outfits: { data: [], total: 0 },
      characters: { data: [], total: 0 },
    };

    // Search Items
    if (type === 'all' || type === 'items') {
      const itemFilter: Record<string, any> = {};

      // Text search
      if (query) {
        itemFilter.$text = { $search: query };
      }

      // Category filter
      if (category) {
        itemFilter.category = category;
      }

      // Tags filter
      if (tags && tags.length > 0) {
        itemFilter.tags = { $in: tags };
      }

      // Gender filter
      if (gender) {
        itemFilter.gender = gender;
      }

      // Historical period filter
      if (periodStart || periodEnd) {
        itemFilter['realWorldReference.periodStart'] = {};
        if (periodStart) {
          itemFilter['realWorldReference.periodStart'].$gte = parseInt(periodStart);
        }
        if (periodEnd) {
          itemFilter['realWorldReference.periodEnd'] = {};
          itemFilter['realWorldReference.periodEnd'].$lte = parseInt(periodEnd);
        }
      }

      // Geographic origin filter
      if (geographicOrigin) {
        itemFilter['realWorldReference.geographicOrigin'] = {
          $regex: geographicOrigin,
          $options: 'i',
        };
      }

      const itemsQuery = ClothingItemModel.find(itemFilter)
        .select('name category subcategory description tags images realWorldReference')
        .limit(limit)
        .skip(skip)
        .lean();

      // Add text score sorting if text search is used
      if (query) {
        itemsQuery.select({ score: { $meta: 'textScore' } });
        itemsQuery.sort({ score: { $meta: 'textScore' } });
      } else {
        itemsQuery.sort({ createdAt: -1 });
      }

      const [items, itemsTotal] = await Promise.all([
        itemsQuery.exec(),
        ClothingItemModel.countDocuments(itemFilter),
      ]);

      results.items = {
        data: items,
        total: itemsTotal,
        pages: Math.ceil(itemsTotal / limit),
      };
    }

    // Search Outfits
    if (type === 'all' || type === 'outfits') {
      const outfitFilter: Record<string, any> = {};

      // Text search
      if (query) {
        outfitFilter.$text = { $search: query };
      }

      // Tags filter
      if (tags && tags.length > 0) {
        outfitFilter.tags = { $in: tags };
      }

      const outfitsQuery = OutfitModel.find(outfitFilter)
        .select('name description tags occasion season items')
        .populate({
          path: 'items.itemId',
          select: 'name category images',
        })
        .limit(limit)
        .skip(skip);

      // Add text score sorting if text search is used
      if (query) {
        outfitsQuery.select({ score: { $meta: 'textScore' } });
        outfitsQuery.sort({ score: { $meta: 'textScore' } });
      } else {
        outfitsQuery.sort({ createdAt: -1 });
      }

      const [outfits, outfitsTotal] = await Promise.all([
        outfitsQuery.lean().exec(),
        OutfitModel.countDocuments(outfitFilter),
      ]);

      results.outfits = {
        data: outfits,
        total: outfitsTotal,
        pages: Math.ceil(outfitsTotal / limit),
      };
    }

    // Search Characters
    if (type === 'all' || type === 'characters') {
      const characterFilter: Record<string, any> = {};

      // Text search
      if (query) {
        characterFilter.$text = { $search: query };
      }

      const charactersQuery = CharacterModel.find(characterFilter)
        .select('name description role physicalTraits defaultOutfit')
        .populate({
          path: 'defaultOutfit',
          select: 'name',
        })
        .limit(limit)
        .skip(skip);

      // Add text score sorting if text search is used
      if (query) {
        charactersQuery.select({ score: { $meta: 'textScore' } });
        charactersQuery.sort({ score: { $meta: 'textScore' } });
      } else {
        charactersQuery.sort({ createdAt: -1 });
      }

      const [characters, charactersTotal] = await Promise.all([
        charactersQuery.lean().exec(),
        CharacterModel.countDocuments(characterFilter),
      ]);

      results.characters = {
        data: characters,
        total: charactersTotal,
        pages: Math.ceil(charactersTotal / limit),
      };
    }

    // Calculate total results
    results.totalResults =
      results.items.total + results.outfits.total + results.characters.total;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
