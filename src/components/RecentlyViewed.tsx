'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewed, type RecentlyViewedItem } from '@/lib/userActivity';

export function RecentlyViewed() {
  const [items] = useState<RecentlyViewedItem[]>(() => getRecentlyViewed());
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Recently Viewed</span>
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{items.length}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recently Viewed</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.type}s/${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
