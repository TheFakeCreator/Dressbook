'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';

interface OutfitItem {
  itemId: {
    _id: string;
    name: string;
    category: string;
    colors?: string[];
    images?: { url: string; thumbnail?: string; isPrimary?: boolean }[];
  };
  layer: number;
  notes?: string;
}

interface ColorSchemeAnalyzerProps {
  items: OutfitItem[];
}

interface ColorInfo {
  color: string;
  count: number;
  items: string[];
}

export function ColorSchemeAnalyzer({ items }: ColorSchemeAnalyzerProps) {
  const colorAnalysis = useMemo(() => {
    const colorMap = new Map<string, ColorInfo>();

    items.forEach(item => {
      const colors = item.itemId.colors || [];
      colors.forEach(color => {
        const normalizedColor = color.trim().toLowerCase();
        if (!colorMap.has(normalizedColor)) {
          colorMap.set(normalizedColor, {
            color: normalizedColor,
            count: 0,
            items: [],
          });
        }
        const colorInfo = colorMap.get(normalizedColor)!;
        colorInfo.count++;
        colorInfo.items.push(item.itemId.name);
      });
    });

    return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  }, [items]);

  const totalColors = colorAnalysis.reduce((sum, c) => sum + c.count, 0);

  // Basic color harmony analysis
  const getColorHarmony = () => {
    if (colorAnalysis.length === 0) return null;
    if (colorAnalysis.length === 1) return 'Monochromatic';
    if (colorAnalysis.length === 2) return 'Complementary';
    if (colorAnalysis.length === 3) return 'Triadic';
    return 'Polychromatic';
  };

  // Get color hex approximation for common color names
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#FBBF24',
      orange: '#F97316',
      purple: '#A855F7',
      pink: '#EC4899',
      brown: '#92400E',
      black: '#1F2937',
      white: '#F9FAFB',
      gray: '#6B7280',
      grey: '#6B7280',
      beige: '#D4AF37',
      navy: '#1E3A8A',
      maroon: '#7C2D12',
      gold: '#FBBF24',
      silver: '#9CA3AF',
      burgundy: '#7C2D12',
      teal: '#14B8A6',
      turquoise: '#06B6D4',
      lavender: '#C4B5FD',
      ivory: '#FFFEF7',
      cream: '#FEF3C7',
    };

    // Check if it's already a hex code
    if (colorName.startsWith('#')) return colorName;
    
    // Try to match color name
    const normalized = colorName.toLowerCase();
    for (const [name, hex] of Object.entries(colorMap)) {
      if (normalized.includes(name)) return hex;
    }

    return '#9CA3AF'; // Default gray
  };

  if (items.length === 0 || colorAnalysis.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Scheme</h2>
        <p className="text-center text-gray-500 py-8">
          No color information available for this outfit
        </p>
      </Card>
    );
  }

  const harmony = getColorHarmony();

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Scheme Analysis</h2>

      {/* Harmony Type */}
      {harmony && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-900">
            Color Harmony: <span className="font-bold">{harmony}</span>
          </p>
          <p className="text-xs text-purple-700 mt-1">
            {harmony === 'Monochromatic' && 'Single color family creates unity and elegance'}
            {harmony === 'Complementary' && 'Two colors create dynamic contrast'}
            {harmony === 'Triadic' && 'Three colors provide balanced variety'}
            {harmony === 'Polychromatic' && 'Multiple colors create rich, vibrant look'}
          </p>
        </div>
      )}

      {/* Color Palette */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Color Palette</h3>
        <div className="flex flex-wrap gap-3">
          {colorAnalysis.map((colorInfo, index) => {
            const hex = getColorHex(colorInfo.color);
            const percentage = ((colorInfo.count / totalColors) * 100).toFixed(0);
            
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                style={{ minWidth: '120px' }}
              >
                <div
                  className="w-20 h-20 rounded-lg shadow-inner border-2 border-gray-300"
                  style={{ backgroundColor: hex }}
                  title={colorInfo.color}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {colorInfo.color}
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage}% ({colorInfo.count} {colorInfo.count === 1 ? 'item' : 'items'})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Distribution */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Color Distribution</h3>
        <div className="space-y-3">
          {colorAnalysis.map((colorInfo, index) => {
            const percentage = (colorInfo.count / totalColors) * 100;
            const hex = getColorHex(colorInfo.color);
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {colorInfo.color}
                  </span>
                  <span className="text-sm text-gray-500">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: hex,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used in: {colorInfo.items.join(', ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{colorAnalysis.length}</p>
          <p className="text-xs text-gray-600">Unique Colors</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{colorAnalysis[0]?.count || 0}</p>
          <p className="text-xs text-gray-600">Most Used</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {colorAnalysis[0]?.color || 'N/A'}
          </p>
          <p className="text-xs text-gray-600">Dominant Color</p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Color Theory Tip:</strong> {colorAnalysis.length <= 3
            ? 'A limited color palette creates a cohesive, professional look.'
            : 'With many colors, ensure one or two dominant colors anchor the outfit.'}
        </p>
      </div>
    </Card>
  );
}
