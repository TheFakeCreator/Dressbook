'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TimelineForm } from '@/components/forms/TimelineForm';
import { LoadingSpinner } from '@/components/ui/Loading';

interface TimelineFormData {
  characterId: string;
  outfitId: string;
  chapter: string;
  scene: string;
  location: string;
  timeOfDay: string;
  notes: string;
}

export default function EditTimelineEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<TimelineFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeline/${entryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeline entry');
      }
      const data = await response.json();
      
      setInitialData({
        characterId: data.characterId?._id || data.characterId || '',
        outfitId: data.outfitId?._id || data.outfitId || '',
        chapter: data.chapter || '',
        scene: data.scene || '',
        location: data.location || '',
        timeOfDay: data.timeOfDay || '',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: TimelineFormData) => {
    const response = await fetch(`/api/timeline/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update timeline entry');
    }

    router.push('/timeline');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Timeline entry not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Timeline Entry</h1>
          <p className="mt-2 text-gray-600">
            Update the timeline entry details
          </p>
        </div>

        <TimelineForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
