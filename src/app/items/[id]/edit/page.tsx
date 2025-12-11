'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ItemForm } from '@/components/forms/ItemForm';
import { LoadingSpinner } from '@/components/ui/Loading';
import type { ClothingItem } from '@/types';

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

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
      const response = await fetch(`/api/items/${resolvedParams.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }

      const data = await response.json();
      setItem(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<ClothingItem>) => {
    if (!resolvedParams?.id) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      // Redirect to the item's detail page
      router.push(`/items/${resolvedParams.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (resolvedParams?.id) {
      router.push(`/items/${resolvedParams.id}`);
    } else {
      router.push('/items');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/items" className="text-blue-600 hover:text-blue-700">
              ← Back to Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/items" className="hover:text-blue-600">Items</Link>
            <span>/</span>
            <Link href={`/items/${resolvedParams?.id}`} className="hover:text-blue-600">
              {item?.name || 'Item'}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Edit</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
          <p className="text-gray-600 mt-2">
            Update the clothing item information
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        {item && (
          <ItemForm
            initialData={item}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
}
