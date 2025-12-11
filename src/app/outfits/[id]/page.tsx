'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/Loading';

interface OutfitItem {
  itemId: {
    _id: string;
    name: string;
    category: string;
    images?: { url: string; thumbnail?: string; isPrimary?: boolean }[];
  };
  layer: number;
  notes?: string;
}

interface Outfit {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  items: OutfitItem[];
  createdAt: string;
  updatedAt: string;
}

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOutfit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOutfit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/outfits/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch outfit');
      }

      const data = await response.json();
      setOutfit(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this outfit?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/outfits/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete outfit');
      }

      router.push('/outfits');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete outfit');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSkeleton className="h-12 w-64 mb-4" />
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p>{error || 'Outfit not found'}</p>
          </div>
          <Link href="/outfits">
            <Button variant="outline" className="mt-4">
              Back to Outfits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = outfit.items.reduce((acc, item) => {
    const category = item.itemId.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, OutfitItem[]>);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/outfits">
              <Button variant="outline" className="mb-4">
                ← Back to Outfits
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{outfit.name}</h1>
            {outfit.description && (
              <p className="mt-2 text-gray-600">{outfit.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/outfits/${outfit._id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:bg-red-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Tags */}
        {outfit.tags && outfit.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {outfit.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Items by Category */}
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <Card key={category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/items/${item.itemId._id}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md">
                      <div className="relative aspect-square bg-gray-100">
                        {item.itemId.images && item.itemId.images.length > 0 ? (
                          <Image
                            src={
                              item.itemId.images.find((img) => img.isPrimary)
                                ?.url ||
                              item.itemId.images[0].url
                            }
                            alt={item.itemId.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                            👔
                          </div>
                        )}
                        {item.layer !== undefined && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                            Layer {item.layer}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {item.itemId.name}
                        </h3>
                        {item.notes && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {outfit.items.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No items in this outfit
              </h3>
              <p className="mb-4 text-gray-600">
                Add clothing items to build your outfit
              </p>
              <Link href={`/outfits/${outfit._id}/edit`}>
                <Button>Add Items</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
