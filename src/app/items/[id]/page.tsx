'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DetailPageSkeleton } from '@/components/LoadingSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/contexts/ToastContext';
import { addToRecentlyViewed } from '@/lib/userActivity';
import type { ClothingItem } from '@/types';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [variations, setVariations] = useState<ClothingItem[]>([]);
  const [parentItem, setParentItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [variationView, setVariationView] = useState<'grid' | 'tree'>('grid');
  const router = useRouter();
  const { isOpen, confirmOptions, isLoading, confirm, handleConfirm, handleCancel, setLoading: setConfirmLoading } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchItem();
      fetchVariations();
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
        
        // Add to recently viewed
        const primaryImage = data.data.images?.find((img: { isPrimary: boolean }) => img.isPrimary);
        addToRecentlyViewed({
          id: data.data._id,
          type: 'item',
          name: data.data.name,
          thumbnail: primaryImage?.url || data.data.images?.[0]?.url || null,
        });
        
        // Fetch parent item if exists
        if (data.data.parentItem) {
          fetchParentItem(data.data.parentItem);
        }
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

  const fetchParentItem = async (parentId: string) => {
    try {
      const response = await fetch(`/api/items/${parentId}`);
      const data = await response.json();
      if (data.success) {
        setParentItem(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch parent item:', err);
    }
  };

  const fetchVariations = async () => {
    if (!resolvedParams?.id) return;

    try {
      const response = await fetch(`/api/items/${resolvedParams.id}/variations`);
      const data = await response.json();
      
      if (data.success) {
        setVariations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch variations:', err);
    }
  };

  const handleDelete = async () => {
    if (!resolvedParams?.id) return;
    
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setConfirmLoading(true);
      const response = await fetch(`/api/items/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Item deleted successfully');
        router.push('/items');
      } else {
        toast.error(data.error || 'Failed to delete item');
      }
    } catch (err) {
      toast.error('Failed to delete item');
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !item) {
    return (
      <ErrorDisplay
        title={error ? 'Failed to load item' : 'Item not found'}
        message={error || 'The item you are looking for does not exist.'}
        onRetry={error ? fetchItem : undefined}
        onGoBack={() => router.push('/items')}
      />
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
            {variations.length > 0 && (
              <Link href={`/compare?items=${item._id},${variations.map(v => v._id).join(',')}`}>
                <Button variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Compare All
                </Button>
              </Link>
            )}
            <Link href={`/items/${item._id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Link href={`/items/${item._id}/variation`}>
              <Button variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Variation
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
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

            {/* Parent Item */}
            {parentItem && (
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Parent Item</h2>
                <Link 
                  href={`/items/${parentItem._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {parentItem.images && parentItem.images.length > 0 ? (
                      <div className="w-20 h-20 relative overflow-hidden rounded-lg shrink-0">
                        <Image
                          src={parentItem.images.find(img => img.isPrimary)?.url || parentItem.images[0].url}
                          alt={parentItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        👔
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{parentItem.name}</h3>
                      <p className="text-sm text-gray-600">{parentItem.category}</p>
                    </div>
                  </div>
                </Link>
              </Card>
            )}

            {/* Variations */}
            {variations.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Variations</h2>
                    <span className="text-sm text-gray-600">
                      {variations.length} {variations.length === 1 ? 'variation' : 'variations'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVariationView('grid')}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        variationView === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Grid view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setVariationView('tree')}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        variationView === 'tree'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Tree view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {variationView === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {variations.map((variation) => (
                      <Link
                        key={variation._id}
                        href={`/items/${variation._id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {variation.images && variation.images.length > 0 ? (
                            <div className="w-16 h-16 relative overflow-hidden rounded-lg shrink-0">
                              <Image
                                src={variation.images.find(img => img.isPrimary)?.url || variation.images[0].url}
                                alt={variation.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                              👔
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{variation.name}</h3>
                            <p className="text-sm text-gray-600">{variation.category}</p>
                            {variation.variationAttributes && Object.keys(variation.variationAttributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(variation.variationAttributes).map(([key, value]) => (
                                  value && (
                                    <span
                                      key={key}
                                      className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
                                    >
                                      {String(value)}
                                    </span>
                                  )
                                ))}
                              </div>
                            )}
                            {variation.colors && variation.colors.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {variation.colors.slice(0, 3).map((color) => (
                                  <span
                                    key={color}
                                    className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                                  >
                                    {color}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Base Item (Current) */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      {item.images && item.images.length > 0 ? (
                        <div className="w-16 h-16 relative overflow-hidden rounded-lg shrink-0">
                          <Image
                            src={item.images.find(img => img.isPrimary)?.url || item.images[0].url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                          👔
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                            Base
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        {item.colors && item.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.colors.slice(0, 4).map((color) => (
                              <span
                                key={color}
                                className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Variations as children */}
                    <div className="pl-8 border-l-2 border-gray-300 space-y-3 ml-8">
                      {variations.map((variation, index) => (
                        <div key={variation._id} className="relative">
                          {/* Connection line */}
                          <div className="absolute left-0 top-8 w-8 h-0.5 bg-gray-300 -ml-8"></div>
                          
                          <Link
                            href={`/items/${variation._id}`}
                            className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              {variation.images && variation.images.length > 0 ? (
                                <div className="w-16 h-16 relative overflow-hidden rounded-lg shrink-0">
                                  <Image
                                    src={variation.images.find(img => img.isPrimary)?.url || variation.images[0].url}
                                    alt={variation.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                                  👔
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{variation.name}</h3>
                                <p className="text-sm text-gray-600">{variation.category}</p>
                                {variation.variationAttributes && Object.keys(variation.variationAttributes).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Object.entries(variation.variationAttributes).map(([key, value]) => (
                                      value && (
                                        <span
                                          key={key}
                                          className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
                                        >
                                          {String(value)}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                )}
                                {variation.colors && variation.colors.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {variation.colors.slice(0, 3).map((color) => (
                                      <span
                                        key={color}
                                        className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                                      >
                                        {color}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Confirmation Dialog */}
      {confirmOptions && (
        <ConfirmationDialog
          isOpen={isOpen}
          title={confirmOptions.title}
          message={confirmOptions.message}
          confirmLabel={confirmOptions.confirmLabel}
          cancelLabel={confirmOptions.cancelLabel}
          confirmVariant={confirmOptions.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}