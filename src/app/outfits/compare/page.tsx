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

export default function OutfitComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ ids?: string } | null>(null);

  useEffect(() => {
    searchParams.then(setResolvedParams);
  }, [searchParams]);

  useEffect(() => {
    if (resolvedParams?.ids) {
      fetchOutfits();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams]);

  const fetchOutfits = async () => {
    if (!resolvedParams?.ids) return;

    const outfitIds = resolvedParams.ids.split(',');
    
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

  const getPrimaryImage = (outfit: Outfit) => {
    const firstItem = outfit.items?.[0];
    const primaryImg = firstItem?.itemId?.images?.find(img => img.isPrimary);
    return primaryImg?.url || firstItem?.itemId?.images?.[0]?.url;
  };

  const getUniqueColors = (outfit: Outfit) => {
    const colors = new Set<string>();
    outfit.items.forEach(item => {
      const itemColors = (item.itemId as unknown as { colors?: string[] }).colors || [];
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

  if (!resolvedParams?.ids || outfits.length === 0) {
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

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{outfit.name}</h2>
                {outfit.description && (
                  <p className="text-sm text-gray-600 mb-4">{outfit.description}</p>
                )}

                {/* Tags */}
                {outfit.tags && outfit.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {outfit.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Count */}
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-gray-900">{outfit.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Layers:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.max(...outfit.items.map(i => i.layer), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Colors:</span>
                    <span className="font-semibold text-gray-900">
                      {getUniqueColors(outfit).length}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Items:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {outfit.items
                      .sort((a, b) => a.layer - b.layer)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded"
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600 font-medium shrink-0">
                            {item.layer}
                          </div>
                          <span className="text-gray-900 truncate">{item.itemId.name}</span>
                          <span className="text-gray-500 text-xs ml-auto shrink-0">
                            {item.itemId.category}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href={`/outfits/${outfit._id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Summary */}
        {outfits.length > 1 && (
          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparison Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Most Items */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">Most Items</p>
                <p className="text-lg font-bold text-blue-900">
                  {outfits.reduce((max, o) => o.items.length > max.items.length ? o : max).name}
                </p>
                <p className="text-sm text-blue-600">
                  {Math.max(...outfits.map(o => o.items.length))} items
                </p>
              </div>

              {/* Most Layers */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 font-medium mb-1">Most Layers</p>
                <p className="text-lg font-bold text-purple-900">
                  {outfits.reduce((max, o) => {
                    const maxLayer = Math.max(...o.items.map(i => i.layer), 0);
                    const currentMax = Math.max(...max.items.map(i => i.layer), 0);
                    return maxLayer > currentMax ? o : max;
                  }).name}
                </p>
                <p className="text-sm text-purple-600">
                  {Math.max(...outfits.map(o => Math.max(...o.items.map(i => i.layer), 0)))} layers
                </p>
              </div>

              {/* Most Colorful */}
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-700 font-medium mb-1">Most Colorful</p>
                <p className="text-lg font-bold text-pink-900">
                  {outfits.reduce((max, o) => 
                    getUniqueColors(o).length > getUniqueColors(max).length ? o : max
                  ).name}
                </p>
                <p className="text-sm text-pink-600">
                  {Math.max(...outfits.map(o => getUniqueColors(o).length))} colors
                </p>
              </div>
            </div>

            {/* Common Tags */}
            {(() => {
              const tagCounts = new Map<string, number>();
              outfits.forEach(o => {
                o.tags?.forEach(tag => {
                  tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
              });
              const commonTags = Array.from(tagCounts.entries())
                .filter(([, count]) => count > 1)
                .sort((a, b) => b[1] - a[1]);

              return commonTags.length > 0 ? (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium mb-2">Common Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {tag} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
