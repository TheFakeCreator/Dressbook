'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';

interface OutfitItem {
  itemId: {
    _id: string;
    name: string;
    category: string;
    images?: { url: string; thumbnail?: string; isPrimary?: boolean }[];
    colors?: string[];
  };
  layer: number;
  notes?: string;
}

interface Outfit {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  items: OutfitItem[];
  createdAt: string;
  updatedAt: string;
}

export default function ComparePageClient({ ids }: { ids?: string }) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }

    const fetchOutfits = async () => {
      const outfitIds = ids.split(',');
      
      try {
        setLoading(true);
        const promises = outfitIds.map(id =>
          fetch(`/api/outfits/${id}`).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        const fetchedOutfits = results
          .filter(result => result.success)
          .map(result => result.data);
        
        setOutfits(fetchedOutfits);
      } catch (err) {
        setError('Failed to fetch outfits for comparison');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, [ids]);

  const getPrimaryImage = (outfit: Outfit) => {
    const firstItem = outfit.items?.[0];
    const primaryImg = firstItem?.itemId?.images?.find(img => img.isPrimary);
    return primaryImg?.url || firstItem?.itemId?.images?.[0]?.url;
  };

  const getUniqueColors = (outfit: Outfit) => {
    const colors = new Set<string>();
    outfit.items.forEach(item => {
      const itemColors = item.itemId.colors || [];
      itemColors.forEach(c => colors.add(c));
    });
    return Array.from(colors);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ids || outfits.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link href="/outfits">
            <Button variant="outline" className="mb-4">← Back to Outfits</Button>
          </Link>
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {error || 'No outfits selected for comparison'}
              </p>
              <Link href="/outfits">
                <Button>Browse Outfits</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <Link href="/outfits">
          <Button variant="outline" className="mb-4">← Back to Outfits</Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Outfits</h1>
        <p className="text-gray-600 mb-8">
          Comparing {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} side-by-side
        </p>

        {/* Comparison Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(outfits.length, 3)}, minmax(0, 1fr))` }}>
          {outfits.map((outfit) => (
            <Card key={outfit._id} className="overflow-hidden">
              {/* Image */}
              <div className="aspect-square w-full bg-gray-100 relative">
                {getPrimaryImage(outfit) ? (
                  <Image
                    src={getPrimaryImage(outfit)!}
                    alt={outfit.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-gray-400">
                    👔
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4 space-y-4">
                {/* Name */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{outfit.name}</h2>
                  {outfit.description && (
                    <p className="text-sm text-gray-600 mt-1">{outfit.description}</p>
                  )}
                </div>

                {/* Tags */}
                {outfit.tags && outfit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {outfit.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">Items</div>
                    <div className="font-semibold">{outfit.items?.length || 0}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 text-xs">Layers</div>
                    <div className="font-semibold">
                      {Math.max(...outfit.items.map(i => i.layer), 0)}
                    </div>
                  </div>
                </div>

                {/* Colors */}
                {getUniqueColors(outfit).length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Color Palette</div>
                    <div className="flex flex-wrap gap-2">
                      {getUniqueColors(outfit).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Items</div>
                  <div className="space-y-2">
                    {outfit.items
                      .sort((a, b) => a.layer - b.layer)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                        >
                          <span className="text-xs text-gray-500">L{item.layer}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-white rounded border">
                            {item.itemId.category}
                          </span>
                          <span className="flex-1 truncate">{item.itemId.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Summary */}
        {outfits.length > 1 && (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Most Complex</div>
                <div className="font-semibold">
                  {outfits.reduce((max, o) => o.items.length > max.items.length ? o : max).name}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.max(...outfits.map(o => o.items.length))} items
                </div>
              </div>
              <div>
                <div className="text-gray-500">Most Layers</div>
                <div className="font-semibold">
                  {outfits.reduce((max, o) => {
                    const maxLayer = Math.max(...o.items.map(i => i.layer), 0);
                    const currentMax = Math.max(...max.items.map(i => i.layer), 0);
                    return maxLayer > currentMax ? o : max;
                  }).name}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Total Items Compared</div>
                <div className="font-semibold">
                  {outfits.reduce((sum, o) => sum + o.items.length, 0)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
