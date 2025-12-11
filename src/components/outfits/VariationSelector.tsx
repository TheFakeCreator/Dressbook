'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ClothingItem {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  images: Array<{
    url: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
  tags: string[];
  colors: string[];
  parentItem?: string | ClothingItem;
}

interface VariationSelectorProps {
  itemId: string;
  onSelectVariation: (item: ClothingItem) => void;
  selectedItemId?: string;
}

export function VariationSelector({ itemId, onSelectVariation, selectedItemId }: VariationSelectorProps) {
  const [baseItem, setBaseItem] = useState<ClothingItem | null>(null);
  const [variations, setVariations] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchItemAndVariations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const fetchItemAndVariations = async () => {
    try {
      setLoading(true);
      
      // Fetch the base item
      const itemResponse = await fetch(`/api/items/${itemId}`);
      if (itemResponse.ok) {
        const itemData = await itemResponse.json();
        setBaseItem(itemData.data);
      }

      // Fetch variations
      const variationsResponse = await fetch(`/api/items/${itemId}/variations`);
      if (variationsResponse.ok) {
        const variationsData = await variationsResponse.json();
        setVariations(variationsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (item: ClothingItem) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url || null;
  };

  if (loading || !baseItem) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const hasVariations = variations.length > 0;
  const isSelected = (id: string) => id === selectedItemId;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header with base item info */}
      <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gray-200 relative shrink-0">
            {getPrimaryImage(baseItem) ? (
              <Image
                src={getPrimaryImage(baseItem)!}
                alt={baseItem.name}
                fill
                className="object-cover rounded"
                sizes="48px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                No Img
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {baseItem.name}
            </h4>
            <p className="text-xs text-gray-500">
              {hasVariations ? `${variations.length} variation${variations.length > 1 ? 's' : ''}` : 'No variations'}
            </p>
          </div>
        </div>
        {hasVariations && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 p-2 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse variations' : 'Expand variations'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expandable variations grid */}
      {isExpanded && hasVariations && (
        <div className="p-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            {/* Base item */}
            <button
              onClick={() => onSelectVariation(baseItem)}
              className={`relative border rounded-lg overflow-hidden text-left transition-all ${
                isSelected(baseItem._id)
                  ? 'ring-2 ring-blue-600'
                  : 'hover:shadow-md hover:border-blue-300'
              }`}
            >
              <div className="aspect-square bg-gray-100 relative">
                {getPrimaryImage(baseItem) ? (
                  <Image
                    src={getPrimaryImage(baseItem)!}
                    alt={baseItem.name}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                {isSelected(baseItem._id) && (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Selected
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">Original</p>
                {baseItem.colors.length > 0 && (
                  <p className="text-xs text-gray-500 truncate">{baseItem.colors.join(', ')}</p>
                )}
              </div>
            </button>

            {/* Variations */}
            {variations.map((variation) => (
              <button
                key={variation._id}
                onClick={() => onSelectVariation(variation)}
                className={`relative border rounded-lg overflow-hidden text-left transition-all ${
                  isSelected(variation._id)
                    ? 'ring-2 ring-blue-600'
                    : 'hover:shadow-md hover:border-blue-300'
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {getPrimaryImage(variation) ? (
                    <Image
                      src={getPrimaryImage(variation)!}
                      alt={variation.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {isSelected(variation._id) && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Selected
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{variation.name}</p>
                  {variation.colors.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">{variation.colors.join(', ')}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick select button when collapsed */}
      {!isExpanded && (
        <div className="p-2 bg-white border-t">
          <button
            onClick={() => onSelectVariation(baseItem)}
            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
              isSelected(baseItem._id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected(baseItem._id) ? 'Selected' : 'Select Original'}
          </button>
        </div>
      )}
    </div>
  );
}
