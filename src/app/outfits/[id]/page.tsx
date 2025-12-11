'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Character {
  _id: string;
  name: string;
  role?: string;
  description?: string;
}

interface TimelineEntry {
  _id: string;
  character: Character;
  chapter?: string;
  scene?: string;
  date?: string;
}

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, confirmOptions, isLoading, confirm, handleConfirm, handleCancel, setLoading: setConfirmLoading } = useConfirm();
  const toast = useToast();

  useEffect(() => {
    if (params.id) {
      fetchOutfit();
      fetchCharactersAndTimeline();
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
      
      // Add to recently viewed
      const firstItem = data.data.items?.[0];
      const primaryImage = firstItem?.itemId?.images?.find((img: { isPrimary: boolean }) => img.isPrimary);
      addToRecentlyViewed({
        id: data.data._id,
        type: 'outfit',
        name: data.data.name,
        thumbnail: primaryImage?.url || firstItem?.itemId?.images?.[0]?.url || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCharactersAndTimeline = async () => {
    try {
      // Fetch characters with this outfit as default
      const charsResponse = await fetch('/api/characters');
      if (charsResponse.ok) {
        const charsData = await charsResponse.json();
        if (charsData.success) {
          const filtered = charsData.data.filter(
            (char: Character & { defaultOutfit?: { _id: string } | string }) => {
              const outfitId = typeof char.defaultOutfit === 'string' 
                ? char.defaultOutfit 
                : char.defaultOutfit?._id;
              return outfitId === params.id;
            }
          );
          setCharacters(filtered);
        }
      }

      // Fetch timeline entries with this outfit
      const timelineResponse = await fetch(`/api/timeline?outfit=${params.id}`);
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        if (timelineData.success) {
          setTimelineEntries(timelineData.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch characters/timeline:', err);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Outfit',
      message: 'Are you sure you want to delete this outfit? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const response = await fetch(`/api/outfits/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete outfit');
      }

      toast.success('Outfit deleted successfully');
      router.push('/outfits');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete outfit');
      setConfirmLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!outfit) return;

    const confirmed = await confirm({
      title: 'Duplicate Outfit',
      message: `Create a copy of "${outfit.name}"? The duplicate will be opened for editing.`,
      confirmLabel: 'Duplicate',
      cancelLabel: 'Cancel',
      variant: 'primary'
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      // Create a duplicate with "(Copy)" suffix
      const duplicateData = {
        name: `${outfit.name} (Copy)`,
        description: outfit.description,
        tags: outfit.tags,
        items: outfit.items.map(item => ({
          itemId: item.itemId._id,
          layer: item.layer,
          notes: item.notes
        }))
      };

      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate outfit');
      }

      const data = await response.json();
      toast.success('Outfit duplicated successfully');
      router.push(`/outfits/${data.data._id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate outfit');
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !outfit) {
    return (
      <ErrorDisplay
        title={error ? 'Failed to load outfit' : 'Outfit not found'}
        message={error || 'The outfit you are looking for does not exist.'}
        onRetry={error ? fetchOutfit : undefined}
        onGoBack={() => router.push('/outfits')}
      />
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
              onClick={handleDuplicate}
              className="text-blue-600 hover:bg-blue-50"
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50"
            >
              Delete
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

        {/* Characters Wearing This Outfit */}
        {(characters.length > 0 || timelineEntries.length > 0) && (
          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Worn By Characters
            </h2>

            {/* Default Outfit Characters */}
            {characters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Default Outfit For:</h3>
                <div className="flex flex-wrap gap-3">
                  {characters.map((character) => (
                    <Link
                      key={character._id}
                      href={`/characters/${character._id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium text-gray-900">{character.name}</span>
                      {character.role && (
                        <span className="text-gray-500">• {character.role}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Appearances */}
            {timelineEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Timeline Appearances ({timelineEntries.length}):
                </h3>
                <div className="space-y-2">
                  {timelineEntries.slice(0, 5).map((entry) => (
                    <Link
                      key={entry._id}
                      href={`/timeline?character=${entry.character._id}`}
                      className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-900">{entry.character.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {entry.chapter && <span>Ch. {entry.chapter}</span>}
                          {entry.scene && <span>Scene {entry.scene}</span>}
                          {entry.date && <span>{new Date(entry.date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {timelineEntries.length > 5 && (
                    <Link
                      href={`/timeline?outfit=${outfit._id}`}
                      className="block text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {timelineEntries.length} appearances →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {characters.length === 0 && timelineEntries.length === 0 && (
              <p className="text-sm text-gray-500">
                This outfit hasn&apos;t been assigned to any characters yet.
              </p>
            )}
          </Card>
        )}

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
