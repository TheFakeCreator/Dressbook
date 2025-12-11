'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ItemForm } from '@/components/forms/ItemForm';
import { Card } from '@/components/ui/Card';
import { DetailPageSkeleton } from '@/components/LoadingSkeleton';
import type { ClothingItem } from '@/types';

export default function NewVariationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [parentItem, setParentItem] = useState<ClothingItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchParentItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams]);

  const fetchParentItem = async () => {
    if (!resolvedParams?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/items/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setParentItem(data.data);
      } else {
        setError(data.error || 'Failed to fetch parent item');
      }
    } catch (err) {
      setError('Failed to fetch parent item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<ClothingItem>) => {
    if (!resolvedParams?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Add parent item reference
      const variationData = {
        ...data,
        parentItem: resolvedParams.id,
      };

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create variation');
      }

      const result = await response.json();
      
      // Redirect to the new variation's detail page
      router.push(`/items/${result.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (resolvedParams?.id) {
      router.push(`/items/${resolvedParams.id}`);
    } else {
      router.push('/items');
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!parentItem) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <p className="text-red-600">Parent item not found</p>
          </Card>
        </div>
      </div>
    );
  }

  // Pre-fill data from parent item
  const initialData: Partial<ClothingItem> = {
    category: parentItem.category,
    subcategory: parentItem.subcategory,
    colors: parentItem.colors,
    materials: parentItem.materials,
    tags: parentItem.tags,
  };

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
            <Link href={`/items/${parentItem._id}`} className="hover:text-blue-600">
              {parentItem.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">New Variation</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Add Variation of {parentItem.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Create a variation with different colors, materials, or condition
          </p>
        </div>

        {/* Parent Item Reference */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Creating variation of: {parentItem.name}
              </h3>
              <p className="text-sm text-blue-700">
                Some fields have been pre-filled from the parent item. You can modify them as needed.
              </p>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <ItemForm
          initialData={initialData as ClothingItem}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
