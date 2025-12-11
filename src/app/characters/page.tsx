'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/Loading';

interface Character {
  _id: string;
  name: string;
  role?: string;
  description?: string;
  physicalTraits?: {
    age?: string;
    height?: string;
    build?: string;
    hairColor?: string;
    eyeColor?: string;
    [key: string]: string | undefined;
  };
  defaultOutfit?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCharacters = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/characters?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      const data = await response.json();
      setCharacters(data.characters || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCharacters();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      fetchCharacters();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your story characters and their outfits
            </p>
          </div>
          <Link href="/characters/new">
            <Button>
              <span className="mr-2">+</span>
              Add Character
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
              placeholder="Search characters by name or role..."
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
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && characters.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No characters found</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first character'}
            </p>
            {!searchQuery && (
              <Link href="/characters/new">
                <Button className="mt-4">Add Character</Button>
              </Link>
            )}
          </div>
        )}

        {/* Characters Grid */}
        {!loading && !error && characters.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {characters.map((character) => (
                <Card key={character._id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Character Info */}
                    <div className="mb-4">
                      <Link href={`/characters/${character._id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {character.name}
                        </h3>
                      </Link>
                      {character.role && (
                        <p className="text-sm text-gray-600 mt-1">{character.role}</p>
                      )}
                    </div>

                    {/* Description */}
                    {character.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {character.description}
                      </p>
                    )}

                    {/* Physical Traits */}
                    {character.physicalTraits && Object.keys(character.physicalTraits || {}).length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {character.physicalTraits.age && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Age: {character.physicalTraits.age}
                          </span>
                        )}
                        {character.physicalTraits.height && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {character.physicalTraits.height}
                          </span>
                        )}
                        {character.physicalTraits.build && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {character.physicalTraits.build}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Default Outfit */}
                    {character.defaultOutfit && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Default Outfit:</p>
                        <Link
                          href={`/outfits/${character.defaultOutfit._id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {character.defaultOutfit.name}
                        </Link>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Link href={`/characters/${character._id}`} className="flex-1">
                        <Button variant="secondary" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link href={`/characters/${character._id}/edit`} className="flex-1">
                        <Button variant="secondary" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(character._id, character.name)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete character"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
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
