/**
 * Outfit Suggestion Algorithm
 * Analyzes tags, colors, historical periods, and usage patterns to suggest relevant outfits
 */

import type { Outfit } from '@/types';

export interface OutfitSuggestion {
  outfit: Outfit;
  score: number;
  reasons: string[];
}

export interface SuggestionParams {
  tags?: string[];
  colors?: string[];
  historicalPeriod?: string;
  excludeOutfitIds?: string[];
  limit?: number;
}

/**
 * Calculate similarity score between two tag arrays
 */
function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  if (!tags1.length || !tags2.length) return 0;
  
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  
  const intersection = [...set1].filter(t => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;
  
  return intersection / union; // Jaccard similarity
}

/**
 * Calculate color similarity (basic implementation)
 */
function calculateColorSimilarity(colors1: string[], colors2: string[]): number {
  if (!colors1.length || !colors2.length) return 0;
  
  const set1 = new Set(colors1.map(c => c.toLowerCase()));
  const set2 = new Set(colors2.map(c => c.toLowerCase()));
  
  const intersection = [...set1].filter(c => set2.has(c)).length;
  
  return intersection / Math.max(set1.size, set2.size);
}

/**
 * Analyze an outfit and generate a suggestion score based on similarity
 */
function analyzeOutfit(
  outfit: Outfit,
  params: SuggestionParams
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Tag similarity (40% weight)
  if (params.tags && params.tags.length > 0) {
    const tagSimilarity = calculateTagSimilarity(params.tags, outfit.tags || []);
    if (tagSimilarity > 0) {
      score += tagSimilarity * 0.4;
      const matchedTags = (outfit.tags || []).filter((t: string) => 
        params.tags!.some(pt => pt.toLowerCase() === t.toLowerCase())
      );
      if (matchedTags.length > 0) {
        reasons.push(`Shares ${matchedTags.length} tag(s): ${matchedTags.slice(0, 3).join(', ')}`);
      }
    }
  }
  
  // Color similarity (30% weight)
  if (params.colors && params.colors.length > 0) {
    // Extract colors from outfit items
    const outfitColors: string[] = [];
    if (outfit.items && Array.isArray(outfit.items)) {
      outfit.items.forEach((item) => {
        if (item?.itemId && typeof item.itemId === 'object' && 'color' in item.itemId && item.itemId.color) {
          outfitColors.push(item.itemId.color as string);
        }
      });
    }
    
    if (outfitColors.length > 0) {
      const colorSimilarity = calculateColorSimilarity(params.colors, outfitColors);
      if (colorSimilarity > 0) {
        score += colorSimilarity * 0.3;
        const matchedColors = outfitColors.filter(c => 
          params.colors!.some(pc => pc.toLowerCase() === c.toLowerCase())
        );
        if (matchedColors.length > 0) {
          reasons.push(`Matching colors: ${[...new Set(matchedColors)].slice(0, 3).join(', ')}`);
        }
      }
    }
  }
  
  // Historical period match (20% weight)
  if (params.historicalPeriod && outfit.occasion) { // Using occasion as a proxy since we don't have historicalContext in the type
    if (outfit.occasion.toLowerCase().includes(params.historicalPeriod.toLowerCase())) {
      score += 0.2;
      reasons.push(`Related occasion: ${outfit.occasion}`);
    }
  }
  
  // Season/occasion bonus (10% weight)
  if (outfit.season && params.tags) {
    const contextTags = [outfit.season, outfit.occasion]
      .filter(Boolean)
      .map(t => t!.toLowerCase());
    
    const matchingContext = params.tags.filter(t => 
      contextTags.includes(t.toLowerCase())
    );
    
    if (matchingContext.length > 0) {
      score += 0.1;
      reasons.push(`Suitable for: ${matchingContext.slice(0, 2).join(', ')}`);
    }
  }
  
  return { score, reasons };
}

/**
 * Generate outfit suggestions based on parameters
 */
export function generateOutfitSuggestions(
  allOutfits: Outfit[],
  params: SuggestionParams
): OutfitSuggestion[] {
  const suggestions: OutfitSuggestion[] = [];
  
  // Filter out excluded outfits
  const excludeSet = new Set(params.excludeOutfitIds || []);
  const candidateOutfits = allOutfits.filter(
    outfit => !excludeSet.has(outfit._id?.toString() || '')
  );
  
  // Analyze each outfit
  for (const outfit of candidateOutfits) {
    const { score, reasons } = analyzeOutfit(outfit, params);
    
    // Only include outfits with meaningful similarity (score > 0.1)
    if (score > 0.1) {
      suggestions.push({
        outfit,
        score,
        reasons
      });
    }
  }
  
  // Sort by score (descending)
  suggestions.sort((a, b) => b.score - a.score);
  
  // Limit results
  const limit = params.limit || 5;
  return suggestions.slice(0, limit);
}

/**
 * Extract relevant parameters from an existing outfit for suggestions
 */
export function extractSuggestionParams(outfit: Outfit): SuggestionParams {
  const params: SuggestionParams = {
    tags: outfit.tags || [],
    excludeOutfitIds: [outfit._id?.toString() || '']
  };
  
  // Extract colors from outfit items
  if (outfit.items && Array.isArray(outfit.items)) {
    const colors: string[] = [];
    outfit.items.forEach((item) => {
      if (item?.itemId && typeof item.itemId === 'object' && 'color' in item.itemId && item.itemId.color) {
        colors.push(item.itemId.color as string);
      }
    });
    if (colors.length > 0) {
      params.colors = [...new Set(colors)];
    }
  }
  
  // Add season/occasion if available
  if (outfit.season) {
    params.historicalPeriod = outfit.season;
  }
  
  return params;
}

/**
 * Get suggestions based on a character's outfits
 */
export function getCharacterBasedSuggestions(
  characterOutfits: Outfit[],
  allOutfits: Outfit[],
  limit: number = 5
): OutfitSuggestion[] {
  if (characterOutfits.length === 0) return [];
  
  // Aggregate tags and colors from all character outfits
  const allTags: string[] = [];
  const allColors: string[] = [];
  let mostCommonSeason: string | undefined;
  
  const seasonCount: { [key: string]: number } = {};
  
  characterOutfits.forEach(outfit => {
    if (outfit.tags) allTags.push(...outfit.tags);
    
    if (outfit.items && Array.isArray(outfit.items)) {
      outfit.items.forEach((item) => {
        if (item?.itemId && typeof item.itemId === 'object' && 'color' in item.itemId && item.itemId.color) {
          allColors.push(item.itemId.color as string);
        }
      });
    }
    
    if (outfit.season) {
      const season = outfit.season;
      seasonCount[season] = (seasonCount[season] || 0) + 1;
    }
  });
  
  // Find most common season
  if (Object.keys(seasonCount).length > 0) {
    mostCommonSeason = Object.entries(seasonCount)
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  
  const params: SuggestionParams = {
    tags: [...new Set(allTags)],
    colors: [...new Set(allColors)],
    historicalPeriod: mostCommonSeason,
    excludeOutfitIds: characterOutfits.map(o => o._id?.toString() || ''),
    limit
  };
  
  return generateOutfitSuggestions(allOutfits, params);
}
