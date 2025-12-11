'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/Loading';
import { VariationSelector } from './VariationSelector';

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
  variationCount?: number;
}

interface ItemSelectorProps {
  onSelectItem: (item: ClothingItem) => void;
  selectedItemIds: string[];
}

const CATEGORIES = [
  'Headwear',
  'Top',
  'Bottom',
  'Outerwear',
  'Footwear',
  'Accessories',
  'Full Body',
  'Undergarments',
];

export function ItemSelector({ onSelectItem, selectedItemIds }: ItemSelectorProps) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const filterItems = useCallback(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.colors.some(color => color.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items?limit=100&includeVariations=true');
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (item: ClothingItem) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url || null;
  };

  const isSelected = (itemId: string) => selectedItemIds.includes(itemId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b">
        <Input
          type="text"
          placeholder="Search items by name, tags, or colors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((category) => {
          const count = items.filter(item => item.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No items found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show expanded variation selector if an item is expanded */}
          {expandedItemId && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Select Variation</h3>
                <button
                  onClick={() => setExpandedItemId(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
              <VariationSelector
                itemId={expandedItemId}
                onSelectVariation={(item) => {
                  onSelectItem(item);
                  setExpandedItemId(null);
                }}
                selectedItemId={selectedItemIds.find(id => 
                  filteredItems.find(i => i._id === expandedItemId)
                )}
              />
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const imageUrl = getPrimaryImage(item);
            const selected = isSelected(item._id);
            const hasVariations = item.variationCount && item.variationCount > 0;

            return (
              <div
                key={item._id}
                className={`relative border rounded-lg overflow-hidden transition-all ${
                  selected
                    ? 'ring-2 ring-blue-600 opacity-50'
                    : 'hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div 
                  onClick={() => !selected && !hasVariations && onSelectItem(item)}
                  className={`aspect-square bg-gray-100 relative ${
                    !selected && !hasVariations ? 'cursor-pointer' : ''
                  }`}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {selected && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Selected
                      </div>
                    </div>
                  )}
                  {hasVariations && !selected && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {item.variationCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-2">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {item.category}
                    {item.subcategory && ` • ${item.subcategory}`}
                  </p>
                  {item.colors.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.colors.slice(0, 3).map((color, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  {!selected && (
                    <div className="mt-2 flex gap-1">
                      {hasVariations ? (
                        <button
                          onClick={() => setExpandedItemId(item._id)}
                          className="flex-1 py-1.5 px-2 text-xs font-medium rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          Choose Variation
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectItem(item)}
                          className="flex-1 py-1.5 px-2 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
