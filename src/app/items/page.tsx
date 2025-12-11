'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ItemGridSkeleton } from '@/components/LoadingSkeleton';
import { NoItemsFound, NoSearchResults } from '@/components/EmptyState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { FavoriteButton } from '@/components/FavoriteButton';
import { bulkDeleteItems, bulkExportData, downloadBlob } from '@/lib/bulkOperations';
import type { ClothingItem } from '@/types';
import { CLOTHING_CATEGORIES } from '@/types';

export default function ItemsPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showVariations, setShowVariations] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, sortBy, showVariations]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy,
        includeVariations: showVariations.toString(),
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/items?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination.pages);
        setTotalItems(data.pagination.total);
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

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item._id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedItems.size} items?`)) return;
    
    setLoading(true);
    const result = await bulkDeleteItems(Array.from(selectedItems));
    
    if (result.failedCount === 0) {
      alert(`Successfully deleted ${result.successCount} items`);
      setSelectedItems(new Set());
      setIsSelectionMode(false);
      fetchItems();
    } else {
      alert(`Deleted ${result.successCount} items. Failed: ${result.failedCount}`);
    }
    setLoading(false);
  };

  const handleBulkExport = async () => {
    const selectedIds = Array.from(selectedItems);
    const blob = await bulkExportData(selectedIds, 'items', 'json');
    downloadBlob(blob, `items-export-${Date.now()}.json`);
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
          <div className="flex gap-2">
            <Button
              variant={isSelectionMode ? 'secondary' : 'outline'}
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedItems(new Set());
              }}
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Items'}
            </Button>
            <Link href="/items/new">
              <Button>
                <span className="mr-2">+</span>
                Add New Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {isSelectionMode && selectedItems.size > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                📥 Export
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="category">Category</option>
              </select>
            </div>

            {/* Show Variations Toggle */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVariations}
                  onChange={(e) => {
                    setShowVariations(e.target.checked);
                    setPage(1);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Show variations
                </span>
              </label>
            </div>
          </div>

          {/* Results Count */}
          {!loading && !error && (
            <p className="text-sm text-gray-500">
              {items.length > 0 ? (
                <>
                  Showing <span className="font-semibold">{items.length}</span> out of <span className="font-semibold">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
                  {selectedCategory && <> in <span className="font-semibold">{selectedCategory}</span></>}
                </>
              ) : null}
            </p>
          )}
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
        {loading && <ItemGridSkeleton count={12} />}

        {/* Error State */}
        {!loading && error && (
          <ErrorDisplay
            title="Failed to load items"
            message={error}
            onRetry={fetchItems}
          />
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <>
            {selectedCategory ? (
              <NoSearchResults onClear={() => {
                setSelectedCategory('');
                setPage(1);
              }} />
            ) : (
              <NoItemsFound />
            )}
          </>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <div key={item._id} className="relative">
                  {isSelectionMode ? (
                    <Card className="h-full transition-shadow hover:shadow-md cursor-pointer" onClick={() => toggleSelectItem(item._id)}>
                      {/* Image */}
                      <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                        {/* Selection Checkbox */}
                        <div className="absolute left-2 top-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => toggleSelectItem(item._id)}
                            className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        {/* Favorite Button */}
                        <div 
                          className="absolute right-2 top-2 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <FavoriteButton
                            id={item._id}
                            type="item"
                            name={item.name}
                            thumbnail={item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url}
                          />
                        </div>
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={item.images.find((img) => img.isPrimary)?.url || item.images[0].url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                            👔
                          </div>
                        )}
                        {/* Variation indicator */}
                        {item.variationCount && item.variationCount > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                              +{item.variationCount}
                            </span>
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
                  ) : (
                    <Link href={`/items/${item._id}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        {/* Image */}
                        <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                          {/* Favorite Button */}
                          <div 
                            className="absolute right-2 top-2 z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <FavoriteButton
                              id={item._id}
                              type="item"
                              name={item.name}
                              thumbnail={item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url}
                            />
                          </div>
                          {item.images && item.images.length > 0 ? (
                            <Image
                              src={item.images.find((img) => img.isPrimary)?.url || item.images[0].url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                              👔
                            </div>
                          )}
                          {/* Variation indicator */}
                          {item.variationCount && item.variationCount > 0 && (
                            <div className="absolute bottom-2 right-2">
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                +{item.variationCount}
                              </span>
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
                  )}
                </div>
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
