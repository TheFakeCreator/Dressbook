'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { ClothingItem } from '@/types';

export default function CompareItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const itemIds = searchParams.get('items')?.split(',') || [];
    if (itemIds.length > 0) {
      fetchItems(itemIds);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async (itemIds: string[]) => {
    try {
      setLoading(true);
      const promises = itemIds.map(id =>
        fetch(`/api/items/${id}`).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const fetchedItems = results
        .filter(result => result.success)
        .map(result => result.data);
      
      setItems(fetchedItems);
    } catch (err) {
      setError('Failed to fetch items for comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (item: ClothingItem) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url || null;
  };

  const compareFields = [
    { key: 'category', label: 'Category' },
    { key: 'subcategory', label: 'Subcategory' },
    { key: 'colors', label: 'Colors', isArray: true },
    { key: 'materials', label: 'Materials', isArray: true },
    { key: 'gender', label: 'Gender' },
    { key: 'tags', label: 'Tags', isArray: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'No items to compare'}
              </h3>
              <p className="text-gray-600 mb-4">
                Select items from the variations page to compare them side-by-side
              </p>
              <Button onClick={() => router.push('/variations')}>
                Browse Variations
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/items" className="hover:text-blue-600">Items</Link>
            <span>/</span>
            <span className="text-gray-900">Compare</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Items</h1>
              <p className="text-gray-600 mt-1">
                Side-by-side comparison of {items.length} items
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-100 p-4 text-left font-semibold text-gray-900 border-b-2 border-gray-300 w-48">
                  Property
                </th>
                {items.map((item) => (
                  <th key={item._id} className="bg-gray-50 p-4 text-left border-b-2 border-gray-300 min-w-64">
                    <Link href={`/items/${item._id}`} className="group">
                      <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                        {getPrimaryImage(item) ? (
                          <Image
                            src={getPrimaryImage(item)!}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="256px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-4xl text-gray-400">
                            👔
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {item.name}
                      </h3>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Description */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">
                  Description
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {item.description || '-'}
                  </td>
                ))}
              </tr>

              {/* Dynamic fields */}
              {compareFields.map((field) => (
                <tr key={field.key} className="border-b border-gray-200">
                  <td className="p-4 font-medium text-gray-700 bg-gray-50">
                    {field.label}
                  </td>
                  {items.map((item) => {
                    const value = item[field.key as keyof ClothingItem];
                    
                    return (
                      <td key={item._id} className="p-4 text-sm text-gray-900">
                        {field.isArray && Array.isArray(value) ? (
                          value.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {value.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                >
                                  {String(v)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )
                        ) : (
                          String(value || '-')
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Historical Period */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">
                  Historical Period
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {item.realWorldReference?.historicalPeriod || '-'}
                  </td>
                ))}
              </tr>

              {/* Geographic Origin */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">
                  Geographic Origin
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {item.realWorldReference?.geographicOrigin || '-'}
                  </td>
                ))}
              </tr>

              {/* Cultural Context */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">
                  Cultural Context
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {item.realWorldReference?.culturalContext || '-'}
                  </td>
                ))}
              </tr>

              {/* Variation Attributes */}
              <tr className="border-b border-gray-200 bg-purple-50">
                <td className="p-4 font-medium text-gray-700 bg-purple-100">
                  Variation Attributes
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {item.variationAttributes && Object.keys(item.variationAttributes).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.variationAttributes).map(([key, value]) => (
                          value && (
                            <span
                              key={key}
                              className="inline-block px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium"
                            >
                              {key}: {String(value)}
                            </span>
                          )
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>

              {/* Created Date */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-medium text-gray-700 bg-gray-50">
                  Created
                </td>
                {items.map((item) => (
                  <td key={item._id} className="p-4 text-sm text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          {items.map((item) => (
            <Link key={item._id} href={`/items/${item._id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                View {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
