'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { ClothingItem } from '@/types';

interface ItemWithVariations extends ClothingItem {
  variationCount?: number;
}

export default function VariationsPage() {
  const [items, setItems] = useState<ItemWithVariations[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithVariations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items?limit=100');
      const data = await response.json();
      
      if (data.success) {
        // Only show items that have variations
        const itemsWithVariations = data.data.filter(
          (item: ItemWithVariations) => item.variationCount && item.variationCount > 0
        );
        setItems(itemsWithVariations);
        setFilteredItems(itemsWithVariations);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.colors?.some(color => color.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  };

  const categories = [...new Set(items.map(item => item.category))];

  const getPrimaryImage = (item: ClothingItem) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url || null;
  };

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
            <span className="text-gray-900">Variations</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clothing Variations</h1>
              <p className="text-gray-600 mt-1">
                Browse items with multiple variations
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by name, tags, or colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredItems.length} of {items.length} items with variations
            </span>
          </div>
        </Card>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || categoryFilter !== 'all' ? 'No variations found' : 'No items with variations yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create variations of items to see them here'}
              </p>
              {(searchQuery || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const imageUrl = getPrimaryImage(item);
              
              return (
                <Link
                  key={item._id}
                  href={`/items/${item._id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden mb-3">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-6xl text-gray-400">
                          👔
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                          {item.variationCount} {item.variationCount === 1 ? 'variation' : 'variations'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {item.category}
                        </span>
                        {item.subcategory && (
                          <span className="text-gray-400">• {item.subcategory}</span>
                        )}
                      </div>

                      {item.colors && item.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.colors.slice(0, 4).map((color, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                            >
                              {color}
                            </span>
                          ))}
                          {item.colors.length > 4 && (
                            <span className="text-xs px-2 py-1 text-gray-500">
                              +{item.colors.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
