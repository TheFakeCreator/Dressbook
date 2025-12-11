'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ItemSelector } from '@/components/outfits/ItemSelector';
import { LoadingSpinner } from '@/components/ui/Loading';

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
}

interface SelectedItem {
  itemId: string;
  layer: number;
  item: ClothingItem;
}

interface OutfitData {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  items: Array<{
    itemId: ClothingItem;
    layer: number;
  }>;
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

export default function EditOutfitPage() {
  const router = useRouter();
  const params = useParams();
  const outfitId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOutfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfitId]);

  const fetchOutfit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/outfits/${outfitId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch outfit');
      }
      const data: OutfitData = await response.json();

      setName(data.name);
      setDescription(data.description || '');
      setTags(data.tags?.join(', ') || '');
      
      // Transform outfit items to selected items format
      setSelectedItems(
        data.items.map(item => ({
          itemId: item.itemId._id,
          layer: item.layer,
          item: item.itemId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outfit');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: ClothingItem) => {
    // Determine the next layer number for this category
    const categoryItems = selectedItems.filter(si => si.item.category === item.category);
    const nextLayer = categoryItems.length > 0
      ? Math.max(...categoryItems.map(si => si.layer)) + 1
      : 1;

    setSelectedItems(prev => [
      ...prev,
      {
        itemId: item._id,
        layer: nextLayer,
        item,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(si => si.itemId !== itemId));
  };

  const handleLayerChange = (itemId: string, newLayer: number) => {
    setSelectedItems(prev =>
      prev.map(si =>
        si.itemId === itemId ? { ...si, layer: newLayer } : si
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an outfit name');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one item to the outfit');
      return;
    }

    setSaving(true);

    try {
      const outfitData = {
        name: name.trim(),
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        items: selectedItems.map(si => ({
          itemId: si.itemId,
          layer: si.layer,
        })),
      };

      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update outfit');
      }

      router.push(`/outfits/${outfitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outfit');
      setSaving(false);
    }
  };

  const getPrimaryImage = (item: ClothingItem) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url || null;
  };

  const groupItemsByCategory = () => {
    const grouped: Record<string, SelectedItem[]> = {};
    selectedItems.forEach(si => {
      const category = si.item.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(si);
    });
    // Sort by layer within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.layer - b.layer);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const groupedItems = groupItemsByCategory();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Outfit</h1>
          <p className="mt-2 text-gray-600">
            Update the outfit details and modify the selected items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form & Selected Items */}
          <div className="space-y-6">
            {/* Outfit Details Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Outfit Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Outfit Name *"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Casual Summer Look, Victorian Ball Gown"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the outfit, occasion, style..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Input
                    label="Tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="casual, summer, formal (comma-separated)"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>

            {/* Selected Items Display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Selected Items ({selectedItems.length})
                </h2>
                <Button
                  onClick={() => setShowSelector(!showSelector)}
                  variant={showSelector ? 'secondary' : 'primary'}
                >
                  {showSelector ? 'Hide Items' : 'Add Items'}
                </Button>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items selected yet</p>
                  <p className="text-sm mt-1">Click &quot;Add Items&quot; to start building your outfit</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {CATEGORIES.filter(cat => groupedItems[cat]).map(category => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        {category}
                        <span className="text-xs text-gray-500">
                          ({groupedItems[category].length} {groupedItems[category].length === 1 ? 'item' : 'items'})
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {groupedItems[category].map((selectedItem) => {
                          const imageUrl = getPrimaryImage(selectedItem.item);
                          return (
                            <div
                              key={selectedItem.itemId}
                              className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              {/* Image */}
                              <div className="relative w-16 h-16 bg-gray-100 rounded shrink-0">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={selectedItem.item.name}
                                    fill
                                    className="object-cover rounded"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              {/* Item Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {selectedItem.item.name}
                                </p>
                                {selectedItem.item.subcategory && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {selectedItem.item.subcategory}
                                  </p>
                                )}
                              </div>

                              {/* Layer Control */}
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Layer:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedItem.layer}
                                  onChange={(e) =>
                                    handleLayerChange(selectedItem.itemId, parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(selectedItem.itemId)}
                                className="text-red-600 hover:text-red-700 p-2"
                                title="Remove item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Item Selector */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {showSelector ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Items</h2>
                <ItemSelector
                  onSelectItem={handleSelectItem}
                  selectedItemIds={selectedItems.map(si => si.itemId)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                <p>Click &quot;Add Items&quot; to browse available clothing items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
