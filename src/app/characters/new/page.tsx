'use client';

import { useRouter } from 'next/navigation';
import { CharacterForm } from '@/components/forms/CharacterForm';

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

export default function NewCharacterPage() {
  const router = useRouter();

  const handleSubmit = async (data: CharacterFormData) => {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create character');
    }

    const result = await response.json();
    router.push(`/characters/${result.character._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Character</h1>
          <p className="mt-2 text-gray-600">
            Add a character to your story with their physical traits and personality
          </p>
        </div>

        <CharacterForm onSubmit={handleSubmit} submitLabel="Create Character" />
      </div>
    </div>
  );
}
