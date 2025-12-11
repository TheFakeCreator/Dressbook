'use client';

import { useRouter } from 'next/navigation';
import { TimelineForm } from '@/components/forms/TimelineForm';

interface TimelineFormData {
  characterId: string;
  outfitId: string;
  chapter: string;
  scene: string;
  location: string;
  timeOfDay: string;
  notes: string;
}

export default function NewTimelineEntryPage() {
  const router = useRouter();

  const handleSubmit = async (data: TimelineFormData) => {
    const response = await fetch('/api/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create timeline entry');
    }

    router.push('/timeline');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Timeline Entry</h1>
          <p className="mt-2 text-gray-600">
            Record when and where a character wears a specific outfit
          </p>
        </div>

        <TimelineForm onSubmit={handleSubmit} submitLabel="Create Entry" />
      </div>
    </div>
  );
}
