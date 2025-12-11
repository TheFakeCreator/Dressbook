'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/Loading';

interface Outfit {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  items: {
    itemId: {
      _id: string;
      name: string;
      category: string;
      images?: { url: string; isPrimary?: boolean }[];
    };
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOutfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const fetchOutfits = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/outfits?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch outfits');
      }

      const data = await response.json();
      setOutfits(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    fetchOutfits();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Outfits</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your outfit combinations
            </p>
          </div>
          <Link href="/outfits/new">
            <Button>
              <span className="mr-2">+</span>
              Create Outfit
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search outfits by name or tags..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <LoadingSkeleton className="h-48" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && outfits.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {searchQuery ? 'No outfits found' : 'No outfits yet'}
            </h3>
            <p className="mb-4 text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first outfit to get started'}
            </p>
            {!searchQuery && (
              <Link href="/outfits/new">
                <Button>Create Your First Outfit</Button>
              </Link>
            )}
          </div>
        )}

        {/* Outfits Grid */}
        {!loading && !error && outfits.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outfits.map((outfit) => (
                <Link key={outfit._id} href={`/outfits/${outfit._id}`}>
                  <Card className="h-full transition-all hover:shadow-lg">
                    {/* Item Preview */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {outfit.items.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative"
                        >
                          {item.itemId.images && item.itemId.images.length > 0 ? (
                            <Image
                              src={
                                item.itemId.images.find((img) => img.isPrimary)
                                  ?.url || item.itemId.images[0].url
                              }
                              alt={item.itemId.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-3xl text-gray-400">
                              👔
                            </div>
                          )}
                        </div>
                      ))}
                      {outfit.items.length > 4 && (
                        <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                          +{outfit.items.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Outfit Info */}
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {outfit.name}
                    </h3>
                    
                    {outfit.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {outfit.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{outfit.items.length} items</span>
                      {outfit.tags && outfit.tags.length > 0 && (
                        <div className="flex gap-1">
                          {outfit.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {outfit.tags.length > 2 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              +{outfit.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
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
