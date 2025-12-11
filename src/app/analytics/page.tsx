'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalItems: number;
    totalOutfits: number;
    totalCharacters: number;
    totalTimelineEntries: number;
  };
  topOutfits: Array<{ id: string; name: string; count: number }>;
  topCharacters: Array<{ id: string; name: string; count: number }>;
  topItems: Array<{ id: string; name: string; category: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  chapterCoverage: Array<{ chapter: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  characterWardrobe: Array<{
    characterId: string;
    characterName: string;
    uniqueOutfits: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, topOutfits, topCharacters, topItems, categoryDistribution, chapterCoverage, topTags, characterWardrobe } = analytics;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Usage Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items"
          value={overview.totalItems}
          link="/items"
          color="blue"
        />
        <StatCard
          title="Total Outfits"
          value={overview.totalOutfits}
          link="/outfits"
          color="green"
        />
        <StatCard
          title="Characters"
          value={overview.totalCharacters}
          link="/characters"
          color="purple"
        />
        <StatCard
          title="Timeline Entries"
          value={overview.totalTimelineEntries}
          link="/timeline"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Outfits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Most Used Outfits</h2>
          <div className="space-y-3">
            {topOutfits.length > 0 ? (
              topOutfits.map((outfit) => (
                <BarItem
                  key={outfit.id}
                  label={outfit.name}
                  value={outfit.count}
                  max={topOutfits[0]?.count || 1}
                  link={`/outfits/${outfit.id}`}
                  color="bg-blue-500"
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No outfit data available</p>
            )}
          </div>
        </div>

        {/* Top Characters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Most Active Characters</h2>
          <div className="space-y-3">
            {topCharacters.length > 0 ? (
              topCharacters.map((character) => (
                <BarItem
                  key={character.id}
                  label={character.name}
                  value={character.count}
                  max={topCharacters[0]?.count || 1}
                  link={`/characters/${character.id}`}
                  color="bg-purple-500"
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No character data available</p>
            )}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Most Used Items</h2>
          <div className="space-y-3">
            {topItems.length > 0 ? (
              topItems.map((item) => (
                <BarItem
                  key={item.id}
                  label={item.name}
                  sublabel={item.category}
                  value={item.count}
                  max={topItems[0]?.count || 1}
                  link={`/items/${item.id}`}
                  color="bg-green-500"
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No item data available</p>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Items by Category</h2>
          <div className="space-y-3">
            {categoryDistribution.length > 0 ? (
              categoryDistribution.map((cat) => (
                <BarItem
                  key={cat.category}
                  label={cat.category}
                  value={cat.count}
                  max={categoryDistribution[0]?.count || 1}
                  color="bg-indigo-500"
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No category data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Coverage */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Timeline Coverage by Chapter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapterCoverage.length > 0 ? (
            chapterCoverage.map((chapter) => (
              <div
                key={chapter.chapter}
                className="border border-gray-200 rounded p-4 hover:border-blue-400 transition-colors"
              >
                <div className="text-lg font-semibold text-gray-700">
                  Chapter {chapter.chapter}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {chapter.count} entries
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-3">No timeline data available</p>
          )}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Most Popular Tags</h2>
        <div className="flex flex-wrap gap-3">
          {topTags.length > 0 ? (
            topTags.map((tag) => (
              <div
                key={tag.tag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition-colors"
              >
                <span className="font-medium text-gray-700">{tag.tag}</span>
                <span className="ml-2 text-sm text-gray-500">({tag.count})</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No tag data available</p>
          )}
        </div>
      </div>

      {/* Character Wardrobe Diversity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Character Wardrobe Diversity</h2>
        <p className="text-sm text-gray-600 mb-4">
          Number of unique outfits worn by each character
        </p>
        <div className="space-y-3">
          {characterWardrobe.length > 0 ? (
            characterWardrobe.map((char) => (
              <BarItem
                key={char.characterId}
                label={char.characterName}
                value={char.uniqueOutfits}
                max={characterWardrobe[0]?.uniqueOutfits || 1}
                link={`/characters/${char.characterId}`}
                color="bg-orange-500"
                suffix=" outfits"
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No wardrobe data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, link, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <Link
      href={link}
      className={`${colorClasses[color]} border-2 rounded-lg p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-4xl font-bold mt-2">{value}</div>
    </Link>
  );
}

interface BarItemProps {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  link?: string;
  color: string;
  suffix?: string;
}

function BarItem({ label, sublabel, value, max, link, color, suffix = '' }: BarItemProps) {
  const percentage = (value / max) * 100;

  const content = (
    <div className="group">
      <div className="flex justify-between items-center mb-1">
        <div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
            {label}
          </span>
          {sublabel && <span className="text-xs text-gray-500 ml-2">({sublabel})</span>}
        </div>
        <span className="text-sm font-semibold text-gray-600">
          {value}{suffix}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
