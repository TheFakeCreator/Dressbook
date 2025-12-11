'use client';

import { useState, useEffect, useCallback } from 'react';
import { OutfitSuggestion } from '@/lib/outfitSuggestions';
import Image from 'next/image';
import Link from 'next/link';

interface OutfitSuggestionsProps {
  currentOutfitId?: string;
  tags?: string[];
  colors?: string[];
  historicalPeriod?: string;
  characterId?: string;
  limit?: number;
}

export default function OutfitSuggestions({
  currentOutfitId,
  tags = [],
  colors = [],
  historicalPeriod,
  characterId,
  limit = 5
}: OutfitSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (currentOutfitId) params.append('excludeId', currentOutfitId);
      if (characterId) params.append('characterId', characterId);
      if (tags.length > 0) params.append('tags', tags.join(','));
      if (colors.length > 0) params.append('colors', colors.join(','));
      if (historicalPeriod) params.append('historicalPeriod', historicalPeriod);
      params.append('limit', limit.toString());

      const res = await fetch(`/api/outfits/suggestions?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error fetching outfit suggestions:', err);
      setError('Unable to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [currentOutfitId, characterId, tags, colors, historicalPeriod, limit]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Similar Outfits
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Similar Outfits
        </h3>
        <p className="text-sm text-gray-500">
          No similar outfits found. Try adding more tags or creating more outfits.
        </p>
      </div>
    );
  }

  const displayedSuggestions = expanded ? suggestions : suggestions.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Similar Outfits
        </h3>
        <span className="text-sm text-gray-500">
          {suggestions.length} found
        </span>
      </div>

      <div className="space-y-4">
        {displayedSuggestions.map((suggestion) => (
          <Link
            key={suggestion.outfit._id?.toString()}
            href={`/outfits/${suggestion.outfit._id}`}
            className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
          >
            {/* Thumbnail */}
            <div className="shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
              {suggestion.outfit.items && 
               suggestion.outfit.items.length > 0 && 
               typeof suggestion.outfit.items[0].itemId === 'object' && 
               suggestion.outfit.items[0].itemId.images &&
               suggestion.outfit.items[0].itemId.images.length > 0 ? (
                <Image
                  src={suggestion.outfit.items[0].itemId.images[0].url}
                  alt={suggestion.outfit.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {suggestion.outfit.name}
                </h4>
                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-xs font-medium text-blue-600">
                    {Math.round(suggestion.score * 100)}% match
                  </span>
                </div>
              </div>

              {/* Match reasons */}
              {suggestion.reasons.length > 0 && (
                <div className="space-y-1">
                  {suggestion.reasons.slice(0, 2).map((reason, idx) => (
                    <p key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span className="line-clamp-1">{reason}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* Tags preview */}
              {suggestion.outfit.tags && suggestion.outfit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestion.outfit.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {suggestion.outfit.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500">
                      +{suggestion.outfit.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Expand/Collapse button */}
      {suggestions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {expanded ? (
            <>Show Less</>
          ) : (
            <>Show All ({suggestions.length - 3} more)</>
          )}
        </button>
      )}

      {/* Refresh button */}
      <button
        onClick={fetchSuggestions}
        className="mt-2 w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Suggestions
      </button>
    </div>
  );
}
