'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

interface LayerVisualizationProps {
  items: OutfitItem[];
}

export function LayerVisualization({ items }: LayerVisualizationProps) {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [view, setView] = useState<'stacked' | 'exploded'>('stacked');

  // Sort items by layer (bottom to top)
  const sortedItems = [...items].sort((a, b) => a.layer - b.layer);

  const getPrimaryImage = (item: OutfitItem) => {
    const primaryImg = item.itemId.images?.find(img => img.isPrimary);
    return primaryImg?.url || item.itemId.images?.[0]?.url;
  };

  if (items.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">
          No items in this outfit yet
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Layer Visualization</h2>
        <div className="flex gap-2">
          <Button
            variant={view === 'stacked' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('stacked')}
          >
            Stacked
          </Button>
          <Button
            variant={view === 'exploded' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('exploded')}
          >
            Exploded
          </Button>
        </div>
      </div>

      {view === 'stacked' ? (
        <div className="relative">
          <div className="relative mx-auto" style={{ width: '400px', height: '500px' }}>
            {sortedItems.map((item, index) => {
              const imageUrl = getPrimaryImage(item);
              const isHovered = hoveredLayer === item.layer;
              const zIndex = isHovered ? 100 : index + 1;
              const scale = isHovered ? 1.05 : 1;
              
              return (
                <div
                  key={`${item.itemId._id}-${index}`}
                  className="absolute inset-0 transition-all duration-300 cursor-pointer"
                  style={{
                    zIndex,
                    transform: `scale(${scale})`,
                  }}
                  onMouseEnter={() => setHoveredLayer(item.layer)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  {imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={item.itemId.name}
                        fill
                        className={`object-contain transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-80'
                        }`}
                        sizes="400px"
                      />
                      {isHovered && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3 rounded-b">
                          <p className="font-semibold">{item.itemId.name}</p>
                          <p className="text-sm text-gray-300">
                            Layer {item.layer} • {item.itemId.category}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-400 text-6xl">👔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Layer Legend */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Layers (bottom to top):</p>
            {sortedItems.map((item, index) => (
              <div
                key={`legend-${item.itemId._id}-${index}`}
                className={`flex items-center gap-3 p-2 rounded transition-colors cursor-pointer ${
                  hoveredLayer === item.layer
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onMouseEnter={() => setHoveredLayer(item.layer)}
                onMouseLeave={() => setHoveredLayer(null)}
              >
                <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                  {item.layer}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.itemId.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.itemId.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Exploded View
        <div className="space-y-6">
          {sortedItems.map((item, index) => {
            const imageUrl = getPrimaryImage(item);
            return (
              <div
                key={`exploded-${item.itemId._id}-${index}`}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {item.layer}
                </div>
                <div className="shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.itemId.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                      👔
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.itemId.name}
                  </h3>
                  <p className="text-sm text-gray-600">{item.itemId.category}</p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> In stacked view, hover over the visualization to highlight individual layers. 
          Layer numbers indicate the order in which items are worn (1 = innermost, higher = outer layers).
        </p>
      </div>
    </Card>
  );
}
