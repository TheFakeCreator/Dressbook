'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TimelineListSkeleton } from '@/components/LoadingSkeleton';
import { NoTimelineEntries } from '@/components/EmptyState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { TimelineExport } from '@/components/timeline/TimelineExport';
import { ConsistencyChecker } from '@/components/timeline/ConsistencyChecker';

interface TimelineEntry {
  _id: string;
  characterId: {
    _id: string;
    name: string;
    role?: string;
  };
  outfitId: {
    _id: string;
    name: string;
    description?: string;
    items: Array<{
      itemId: {
        _id: string;
        name: string;
        category: string;
        images?: Array<{ url: string; isPrimary?: boolean }>;
      };
      layer: number;
    }>;
  };
  chapter?: string;
  scene?: string;
  page?: number;
  location?: string;
  timeOfDay?: string;
  notes?: string;
  context?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Filters
  const [characterFilter, setCharacterFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [characters, setCharacters] = useState<Array<{ _id: string; name: string }>>([]);
  const [showExport, setShowExport] = useState(false);
  const [allEntries, setAllEntries] = useState<TimelineEntry[]>([]);
  const [showConsistencyChecker, setShowConsistencyChecker] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, characterFilter, chapterFilter]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  };

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (characterFilter) params.append('character', characterFilter);
      if (chapterFilter) params.append('chapter', chapterFilter);

      const response = await fetch(`/api/timeline?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeline entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEntriesForExport = async () => {
    try {
      const params = new URLSearchParams({
        limit: '1000', // Get all entries
      });

      if (characterFilter) params.append('character', characterFilter);
      if (chapterFilter) params.append('chapter', chapterFilter);

      const response = await fetch(`/api/timeline?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all timeline entries');
      }

      const data = await response.json();
      setAllEntries(data.entries || []);
      setShowExport(true);
    } catch (err) {
      alert('Failed to load timeline entries for export');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timeline entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/timeline/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete timeline entry');
      }

      fetchTimeline();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const getOutfitPreviewImage = (entry: TimelineEntry) => {
    const firstItem = entry.outfitId?.items?.[0]?.itemId;
    if (!firstItem?.images?.length) return null;
    const primaryImage = firstItem.images.find(img => img.isPrimary);
    return primaryImage?.url || firstItem.images[0]?.url;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track character outfits throughout your story
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConsistencyChecker(!showConsistencyChecker)}
            >
              <span className="mr-2">🔍</span>
              {showConsistencyChecker ? 'Hide Checker' : 'Check Consistency'}
            </Button>
            <Button
              variant="secondary"
              onClick={fetchAllEntriesForExport}
            >
              <span className="mr-2">📊</span>
              Export Report
            </Button>
            <Link href="/timeline/new">
              <Button>
                <span className="mr-2">+</span>
                Add Timeline Entry
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Filter by Character
              </label>
              <select
                value={characterFilter}
                onChange={(e) => {
                  setCharacterFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Characters</option>
                {characters.map(char => (
                  <option key={char._id} value={char._id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Filter by Chapter
              </label>
              <input
                type="text"
                value={chapterFilter}
                onChange={(e) => {
                  setChapterFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g., Chapter 1, Act 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setCharacterFilter('');
                  setChapterFilter('');
                  setPage(1);
                }}
                variant="secondary"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Export Component */}
        {showExport && (
          <div className="mb-6">
            <TimelineExport
              entries={allEntries}
              title={`Timeline Report${characterFilter ? ` - ${characters.find(c => c._id === characterFilter)?.name || 'Character'}` : ''}${chapterFilter ? ` - ${chapterFilter}` : ''}`}
            />
          </div>
        )}

        {/* Consistency Checker */}
        {showConsistencyChecker && (
          <div className="mb-6">
            <ConsistencyChecker />
          </div>
        )}

        {/* Loading State */}
        {loading && <TimelineListSkeleton count={5} />}

        {/* Error State */}
        {!loading && error && (
          <ErrorDisplay
            title="Failed to load timeline"
            message={error}
            onRetry={fetchTimeline}
          />
        )}

        {/* Empty State */}
        {!loading && !error && entries.length === 0 && (
          <NoTimelineEntries />
        )}

        {/* Timeline Entries */}
        {!loading && !error && entries.length > 0 && (
          <>
            <div className="space-y-4">
              {entries.map((entry) => {
                const previewImage = getOutfitPreviewImage(entry);
                
                return (
                  <Card key={entry._id} className="hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Outfit Preview Image */}
                        {previewImage && (
                          <div className="relative w-24 h-24 bg-gray-100 rounded-lg shrink-0">
                            <Image
                              src={previewImage}
                              alt={entry.outfitId?.name || 'Outfit'}
                              fill
                              className="object-cover rounded-lg"
                              sizes="96px"
                            />
                          </div>
                        )}

                        {/* Entry Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link
                                href={`/characters/${entry.characterId?._id}`}
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {entry.characterId?.name || 'Unknown Character'}
                              </Link>
                              {entry.characterId?.role && (
                                <span className="ml-2 text-sm text-gray-600">
                                  ({entry.characterId.role})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mb-3">
                            {entry.chapter && (
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {entry.chapter}
                              </span>
                            )}
                            {entry.scene && (
                              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                                {entry.scene}
                              </span>
                            )}
                            {entry.location && (
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {entry.location}
                              </span>
                            )}
                            {entry.timeOfDay && (
                              <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {entry.timeOfDay}
                              </span>
                            )}
                          </div>

                          <div className="mb-3">
                            <span className="text-sm text-gray-600">Wearing: </span>
                            <Link
                              href={`/outfits/${entry.outfitId?._id}`}
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {entry.outfitId?.name || 'Unknown Outfit'}
                            </Link>
                            <span className="text-sm text-gray-500 ml-2">
                              ({entry.outfitId?.items?.length || 0} items)
                            </span>
                          </div>

                          {entry.notes && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {entry.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/timeline/${entry._id}/edit`}>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  variant="secondary"
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
