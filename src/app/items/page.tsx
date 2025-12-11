'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { ClothingItem } from '@/types';
import { CLOTHING_CATEGORIES } from '@/types';

export default function ItemsPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [page, selectedCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/items?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clothing Items</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and manage your clothing database
            </p>
          </div>
          <Link href="/items/new">
            <Button>
              <span className="mr-2">+</span>
              Add New Item
            </Button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {CLOTHING_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <Card className="py-12 text-center">
            <div className="mb-4 text-6xl">👕</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No items yet
            </h3>
            <p className="mb-4 text-gray-600">
              Start building your wardrobe database by adding your first clothing item.
            </p>
            <Link href="/items/new">
              <Button>Add First Item</Button>
            </Link>
          </Card>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Link key={item._id} href={`/items/${item._id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    {/* Image */}
                    <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images.find((img) => img.isPrimary)?.url || item.images[0].url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                          👔
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="mb-1 text-xs font-medium text-blue-600">
                        {item.category}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Real-world reference indicator */}
                      {item.realWorldReference?.historicalPeriod && (
                        <div className="mt-2 text-xs text-gray-500">
                          📅 {item.realWorldReference.historicalPeriod}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
