'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';

interface Character {
  _id: string;
  name: string;
  role?: string;
  description?: string;
  physicalTraits?: {
    age?: string;
    height?: string;
    build?: string;
    hairColor?: string;
    eyeColor?: string;
    skinTone?: string;
    distinctiveFeatures?: string;
    [key: string]: string | undefined;
  };
  personality?: string;
  backstory?: string;
  defaultOutfit?: {
    _id: string;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
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
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${character?.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      router.push('/characters');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Character not found'}
          </div>
          <Link href="/characters">
            <Button className="mt-4" variant="secondary">
              Back to Characters
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{character.name}</h1>
            {character.role && (
              <p className="mt-2 text-lg text-gray-600">{character.role}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/characters/${characterId}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button onClick={handleDelete} variant="secondary" className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Description */}
          {character.description && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{character.description}</p>
            </div>
          )}

          {/* Physical Traits */}
          {character.physicalTraits && Object.keys(character.physicalTraits).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Physical Traits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {character.physicalTraits.age && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Age:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.age}</p>
                  </div>
                )}
                {character.physicalTraits.height && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Height:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.height}</p>
                  </div>
                )}
                {character.physicalTraits.build && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Build:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.build}</p>
                  </div>
                )}
                {character.physicalTraits.hairColor && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Hair Color:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.hairColor}</p>
                  </div>
                )}
                {character.physicalTraits.eyeColor && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Eye Color:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.eyeColor}</p>
                  </div>
                )}
                {character.physicalTraits.skinTone && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Skin Tone:</span>
                    <p className="text-gray-900 mt-1">{character.physicalTraits.skinTone}</p>
                  </div>
                )}
              </div>
              {character.physicalTraits.distinctiveFeatures && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Distinctive Features:</span>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {character.physicalTraits.distinctiveFeatures}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Personality */}
          {character.personality && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Personality</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{character.personality}</p>
            </div>
          )}

          {/* Backstory */}
          {character.backstory && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Backstory</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{character.backstory}</p>
            </div>
          )}

          {/* Default Outfit */}
          {character.defaultOutfit && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Outfit</h2>
              <Link
                href={`/outfits/${character.defaultOutfit._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 hover:underline">
                  {character.defaultOutfit.name}
                </h3>
                {character.defaultOutfit.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {character.defaultOutfit.description}
                  </p>
                )}
              </Link>
            </div>
          )}

          {/* Timeline Link */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
            <p className="text-gray-600 mb-4">
              View this character&apos;s outfit changes throughout your story
            </p>
            <Link href={`/timeline?character=${characterId}`}>
              <Button>View Character Timeline</Button>
            </Link>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>{' '}
                <span className="text-gray-900">
                  {new Date(character.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>{' '}
                <span className="text-gray-900">
                  {new Date(character.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
