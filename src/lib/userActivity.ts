// Recently Viewed Items utility
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENT_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  type: 'item' | 'outfit' | 'character';
  name: string;
  thumbnail?: string;
  viewedAt: string;
}

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>) {
  if (typeof window === 'undefined') return;

  const recent = getRecentlyViewed();
  
  // Remove if already exists
  const filtered = recent.filter(r => !(r.id === item.id && r.type === item.type));
  
  // Add to beginning
  const updated = [
    { ...item, viewedAt: new Date().toISOString() },
    ...filtered
  ].slice(0, MAX_RECENT_ITEMS);
  
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
}

// Favorites utility
const FAVORITES_KEY = 'favorites';

export interface FavoriteItem {
  id: string;
  type: 'item' | 'outfit' | 'character';
  name: string;
  thumbnail?: string;
  addedAt: string;
}

export function addToFavorites(item: Omit<FavoriteItem, 'addedAt'>) {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites();
  
  // Check if already exists
  const exists = favorites.some(f => f.id === item.id && f.type === item.type);
  if (exists) return;
  
  const updated = [
    ...favorites,
    { ...item, addedAt: new Date().toISOString() }
  ];
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function removeFromFavorites(id: string, type: 'item' | 'outfit' | 'character') {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites();
  const updated = favorites.filter(f => !(f.id === id && f.type === type));
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string, type: 'item' | 'outfit' | 'character'): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.id === id && f.type === type);
}

export function clearFavorites() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FAVORITES_KEY);
}
