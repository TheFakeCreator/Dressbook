'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CharacterForm } from '@/components/forms/CharacterForm';
import { LoadingSpinner } from '@/components/ui/Loading';

interface CharacterFormData {
  name: string;
  role: string;
  description: string;
  physicalTraits: {
    age: string;
    height: string;
    build: string;
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    distinctiveFeatures: string;
  };
  personality: string;
  backstory: string;
  defaultOutfit: string;
}

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CharacterFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/characters/${characterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }
      const data = await response.json();
      
      setInitialData({
        name: data.name,
        role: data.role || '',
        description: data.description || '',
        physicalTraits: {
          age: data.physicalTraits?.age || '',
          height: data.physicalTraits?.height || '',
          build: data.physicalTraits?.build || '',
          hairColor: data.physicalTraits?.hairColor || '',
          eyeColor: data.physicalTraits?.eyeColor || '',
          skinTone: data.physicalTraits?.skinTone || '',
          distinctiveFeatures: data.physicalTraits?.distinctiveFeatures || '',
        },
        personality: data.personality || '',
        backstory: data.backstory || '',
        defaultOutfit: data.defaultOutfit?._id || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CharacterFormData) => {
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update character');
    }

    router.push(`/characters/${characterId}`);
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
            {error || 'Character not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Character</h1>
          <p className="mt-2 text-gray-600">
            Update character details and traits
          </p>
        </div>

        <CharacterForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
