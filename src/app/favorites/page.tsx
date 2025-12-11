'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFavorites, removeFromFavorites, type FavoriteItem } from '@/lib/userActivity';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites());

  const handleRemove = (id: string, type: 'item' | 'outfit' | 'character') => {
    removeFromFavorites(id, type);
    setFavorites(getFavorites());
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="mt-2 text-gray-600">
            Items, outfits, and characters you&apos;ve marked as favorites
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start favoriting items by clicking the heart icon
            </p>
            <div className="mt-6">
              <Link href="/items">
                <Button>Browse Items</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/${item.type}s/${item.id}`}>
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/${item.type}s/${item.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.type)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Remove from favorites"
                    >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
