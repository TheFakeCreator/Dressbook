'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OutfitGridSkeleton } from '@/components/LoadingSkeleton';
import { NoOutfitsFound, NoSearchResults } from '@/components/EmptyState';
import ErrorDisplay from '@/components/ErrorDisplay';

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
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutfits, setSelectedOutfits] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  const toggleSelectOutfit = (id: string) => {
    const newSelected = new Set(selectedOutfits);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOutfits(newSelected);
  };

  const handleCompare = () => {
    if (selectedOutfits.size < 2) {
      alert('Please select at least 2 outfits to compare');
      return;
    }
    if (selectedOutfits.size > 4) {
      alert('Please select at most 4 outfits to compare');
      return;
    }
    const ids = Array.from(selectedOutfits).join(',');
    router.push(`/outfits/compare?ids=${ids}`);
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
          <div className="flex gap-2">
            <Button
              variant={isSelectionMode ? 'secondary' : 'outline'}
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedOutfits(new Set());
              }}
            >
              {isSelectionMode ? 'Cancel Selection' : 'Compare Outfits'}
            </Button>
            <Link href="/outfits/new">
              <Button>
                <span className="mr-2">+</span>
                Create Outfit
              </Button>
            </Link>
          </div>
        </div>

        {/* Compare Toolbar */}
        {isSelectionMode && selectedOutfits.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <span className="text-sm font-medium text-gray-900">
              {selectedOutfits.size} outfit{selectedOutfits.size !== 1 ? 's' : ''} selected (select 2-4 to compare)
            </span>
            <Button
              onClick={handleCompare}
              disabled={selectedOutfits.size < 2 || selectedOutfits.size > 4}
              size="sm"
            >
              Compare Selected
            </Button>
          </div>
        )}

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
        {loading && <OutfitGridSkeleton count={6} />}

        {/* Error State */}
        {!loading && error && (
          <ErrorDisplay
            title="Failed to load outfits"
            message={error}
            onRetry={fetchOutfits}
          />
        )}

        {/* Empty State */}
        {!loading && !error && outfits.length === 0 && (
          <>
            {searchQuery ? (
              <NoSearchResults onClear={() => {
                setSearchQuery('');
                setPage(1);
              }} />
            ) : (
              <NoOutfitsFound />
            )}
          </>
        )}

        {/* Outfits Grid */}
        {!loading && !error && outfits.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outfits.map((outfit) => (
                <div key={outfit._id} className="relative">
                  {isSelectionMode ? (
                    <Card
                      className="h-full transition-all hover:shadow-lg cursor-pointer"
                      onClick={() => toggleSelectOutfit(outfit._id)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute left-4 top-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedOutfits.has(outfit._id)}
                          onChange={() => toggleSelectOutfit(outfit._id)}
                          className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>

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
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                  ) : (
                    <Link href={`/outfits/${outfit._id}`}>
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
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                  )}
                </div>
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
