'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/Loading';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SearchResults {
  query: string;
  totalResults: number;
  items: { data: any[]; total: number; pages: number };
  outfits: { data: any[]; total: number; pages: number };
  characters: { data: any[]; total: number; pages: number };
}

const CATEGORIES = [
  'Head',
  'Face',
  'Neck',
  'Torso Upper',
  'Torso Lower',
  'Full Body',
  'Hands',
  'Feet',
  'Legs',
  'Back',
  'Accessories',
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'items' | 'outfits' | 'characters'>('all');
  
  // Filters
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [gender, setGender] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [geographicOrigin, setGeographicOrigin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);
      if (tags) params.append('tags', tags);
      if (gender) params.append('gender', gender);
      if (periodStart) params.append('periodStart', periodStart);
      if (periodEnd) params.append('periodEnd', periodEnd);
      if (geographicOrigin) params.append('geographicOrigin', geographicOrigin);

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, tags, gender, periodStart, periodEnd, geographicOrigin]);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query, category, tags, gender, periodStart, periodEnd, geographicOrigin, performSearch]);

  const clearFilters = () => {
    setCategory('');
    setTags('');
    setGender('');
    setPeriodStart('');
    setPeriodEnd('');
    setGeographicOrigin('');
  };

  const hasActiveFilters = category || tags || gender || periodStart || periodEnd || geographicOrigin;

  if (!query && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Search Your Wardrobe</h2>
        <p className="mt-2 text-gray-600">Use the search bar above to find items, outfits, and characters.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const tabs = [
    { id: 'all' as const, label: 'All', count: results.totalResults },
    { id: 'items' as const, label: 'Items', count: results.items.total },
    { id: 'outfits' as const, label: 'Outfits', count: results.outfits.total },
    { id: 'characters' as const, label: 'Characters', count: results.characters.total },
  ];

  const showItems = activeTab === 'all' || activeTab === 'items';
  const showOutfits = activeTab === 'all' || activeTab === 'outfits';
  const showCharacters = activeTab === 'all' || activeTab === 'characters';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="mt-2 text-gray-600">
          {results.totalResults} {results.totalResults === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Filter Results</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="formal, casual, summer"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Period Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Start (Year)
              </label>
              <input
                type="number"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                placeholder="1800"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Period End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period End (Year)
              </label>
              <input
                type="number"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                placeholder="1900"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Geographic Origin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geographic Origin
              </label>
              <input
                type="text"
                value={geographicOrigin}
                onChange={(e) => setGeographicOrigin(e.target.value)}
                placeholder="Victorian England"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-12">
        {/* Items Results */}
        {showItems && results.items.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Items ({results.items.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.data.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/items/${item._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-48 bg-gray-100">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0].thumbnail || item.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Outfits Results */}
        {showOutfits && results.outfits.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Outfits ({results.outfits.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.outfits.data.map((outfit: any) => (
                <Link
                  key={outfit._id}
                  href={`/outfits/${outfit._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {outfit.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {outfit.items?.length || 0} {outfit.items?.length === 1 ? 'item' : 'items'}
                    </p>
                    {outfit.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {outfit.description}
                      </p>
                    )}
                    {outfit.tags && outfit.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {outfit.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Characters Results */}
        {showCharacters && results.characters.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Characters ({results.characters.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.characters.data.map((character: any) => (
                <Link
                  key={character._id}
                  href={`/characters/${character._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {character.name}
                    </h3>
                    {character.role && (
                      <p className="mt-1 text-sm text-gray-500">{character.role}</p>
                    )}
                    {character.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {character.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {results.totalResults === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No results found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
