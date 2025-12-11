'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { ClothingItem } from '@/types';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams]);

  const fetchItem = async () => {
    if (!resolvedParams?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/items/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setItem(data.data);
      } else {
        setError(data.error || 'Failed to fetch item');
      }
    } catch (err) {
      setError('Failed to fetch item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resolvedParams?.id) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/items/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/items');
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || 'Item not found'}
        </div>
        <Link href="/items" className="mt-4 inline-block">
          <Button>Back to Items</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/items">
            <Button variant="outline" size="sm">
              ← Back to Items
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/items/${item._id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Images */}
          <Card>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images.find((img) => img.isPrimary)?.url || item.images[0].url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl text-gray-400">
                  👔
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {item.images.map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative"
                  >
                    <Image
                      src={image.url}
                      alt={`${item.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Details */}
          <div className="space-y-6">
            <Card>
              <div className="mb-2 text-sm font-medium text-blue-600">
                {item.category}
              </div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {item.name}
              </h1>
              {item.subcategory && (
                <p className="mb-4 text-gray-600">{item.subcategory}</p>
              )}
              <p className="text-gray-700">{item.description}</p>
            </Card>

            {/* Properties */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Properties</h2>
              <div className="space-y-3">
                {item.colors && item.colors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Colors:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.colors.map((color) => (
                        <span
                          key={color}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.materials && item.materials.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Materials:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.materials.map((material) => (
                        <span
                          key={material}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.gender && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Gender:</span>
                    <span className="ml-2 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                      {item.gender}
                    </span>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Real-World Reference */}
            {item.realWorldReference && (
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Real-World Reference</h2>
                <div className="space-y-3">
                  {item.realWorldReference.historicalPeriod && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Historical Period:
                      </span>
                      <p className="mt-1 text-gray-900">
                        {item.realWorldReference.historicalPeriod}
                      </p>
                    </div>
                  )}

                  {item.realWorldReference.geographicOrigin && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Geographic Origin:
                      </span>
                      <p className="mt-1 text-gray-900">
                        {item.realWorldReference.geographicOrigin}
                      </p>
                    </div>
                  )}

                  {item.realWorldReference.culturalContext && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Cultural Context:
                      </span>
                      <p className="mt-1 text-gray-900">
                        {item.realWorldReference.culturalContext}
                      </p>
                    </div>
                  )}

                  {item.realWorldReference.historicalDescription && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Historical Description:
                      </span>
                      <p className="mt-1 text-gray-700">
                        {item.realWorldReference.historicalDescription}
                      </p>
                    </div>
                  )}

                  {item.realWorldReference.referenceSources && 
                   item.realWorldReference.referenceSources.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Reference Sources:
                      </span>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        {item.realWorldReference.referenceSources.map((source, idx) => (
                          <li key={idx} className="text-sm text-blue-600">
                            {source.startsWith('http') ? (
                              <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {source}
                              </a>
                            ) : (
                              <span className="text-gray-700">{source}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.realWorldReference.accuracyNotes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Accuracy Notes:
                      </span>
                      <p className="mt-1 text-sm italic text-gray-600">
                        {item.realWorldReference.accuracyNotes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Metadata</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {item._id}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}