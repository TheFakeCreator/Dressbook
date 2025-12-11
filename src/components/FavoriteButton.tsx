'use client';

import { useState, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/userActivity';

interface FavoriteButtonProps {
  id: string;
  type: 'item' | 'outfit' | 'character';
  name: string;
  thumbnail?: string;
}

export function FavoriteButton({ id, type, name, thumbnail }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(id, type));
  }, [id, type]);

  const toggleFavorite = () => {
    if (favorited) {
      removeFromFavorites(id, type);
      setFavorited(false);
    } else {
      addToFavorites({ id, type, name, thumbnail });
      setFavorited(true);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-all ${
        favorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      }`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-6 h-6"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
