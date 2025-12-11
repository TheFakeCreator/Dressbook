'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Outfit {
  _id: string;
  name: string;
}

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

interface CharacterFormProps {
  initialData?: Partial<CharacterFormData>;
  onSubmit: (data: CharacterFormData) => Promise<void>;
  submitLabel?: string;
}

export function CharacterForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Character',
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    description: initialData?.description || '',
    physicalTraits: {
      age: initialData?.physicalTraits?.age || '',
      height: initialData?.physicalTraits?.height || '',
      build: initialData?.physicalTraits?.build || '',
      hairColor: initialData?.physicalTraits?.hairColor || '',
      eyeColor: initialData?.physicalTraits?.eyeColor || '',
      skinTone: initialData?.physicalTraits?.skinTone || '',
      distinctiveFeatures: initialData?.physicalTraits?.distinctiveFeatures || '',
    },
    personality: initialData?.personality || '',
    backstory: initialData?.backstory || '',
    defaultOutfit: initialData?.defaultOutfit || '',
  });

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loadingOutfits, setLoadingOutfits] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoadingOutfits(true);
      const response = await fetch('/api/outfits?limit=100');
      if (response.ok) {
        const data = await response.json();
        setOutfits(data.outfits || []);
      }
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setOutfits([]);
    } finally {
      setLoadingOutfits(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Character name is required');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save character');
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof CharacterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePhysicalTrait = (trait: keyof CharacterFormData['physicalTraits'], value: string) => {
    setFormData(prev => ({
      ...prev,
      physicalTraits: {
        ...prev.physicalTraits,
        [trait]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <Input
            label="Character Name *"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., John Smith, Sarah Williams"
            required
          />

          <Input
            label="Role"
            type="text"
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder="e.g., Protagonist, Antagonist, Supporting Character"
          />

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the character..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Physical Traits */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Physical Traits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Age"
            type="text"
            value={formData.physicalTraits.age}
            onChange={(e) => updatePhysicalTrait('age', e.target.value)}
            placeholder="e.g., 25, Mid-30s, Elderly"
          />

          <Input
            label="Height"
            type="text"
            value={formData.physicalTraits.height}
            onChange={(e) => updatePhysicalTrait('height', e.target.value)}
            placeholder="e.g., 5'8&quot;, Tall, Short"
          />

          <Input
            label="Build"
            type="text"
            value={formData.physicalTraits.build}
            onChange={(e) => updatePhysicalTrait('build', e.target.value)}
            placeholder="e.g., Athletic, Slim, Muscular, Heavy-set"
          />

          <Input
            label="Hair Color"
            type="text"
            value={formData.physicalTraits.hairColor}
            onChange={(e) => updatePhysicalTrait('hairColor', e.target.value)}
            placeholder="e.g., Brown, Blonde, Black with gray"
          />

          <Input
            label="Eye Color"
            type="text"
            value={formData.physicalTraits.eyeColor}
            onChange={(e) => updatePhysicalTrait('eyeColor', e.target.value)}
            placeholder="e.g., Blue, Green, Brown"
          />

          <Input
            label="Skin Tone"
            type="text"
            value={formData.physicalTraits.skinTone}
            onChange={(e) => updatePhysicalTrait('skinTone', e.target.value)}
            placeholder="e.g., Fair, Olive, Dark"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Distinctive Features
          </label>
          <textarea
            value={formData.physicalTraits.distinctiveFeatures}
            onChange={(e) => updatePhysicalTrait('distinctiveFeatures', e.target.value)}
            placeholder="e.g., Scar on left cheek, wears glasses, tattoo on arm..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Character Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Character Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Personality
            </label>
            <textarea
              value={formData.personality}
              onChange={(e) => updateField('personality', e.target.value)}
              placeholder="Describe the character's personality traits, quirks, habits..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Backstory
            </label>
            <textarea
              value={formData.backstory}
              onChange={(e) => updateField('backstory', e.target.value)}
              placeholder="Character's background, history, important life events..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Default Outfit */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Outfit</h2>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Select Default Outfit (Optional)
          </label>
          <select
            value={formData.defaultOutfit}
            onChange={(e) => updateField('defaultOutfit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingOutfits}
          >
            <option value="">No default outfit</option>
            {outfits?.map(outfit => (
              <option key={outfit._id} value={outfit._id}>
                {outfit.name}
              </option>
            ))}
          </select>
          {loadingOutfits && (
            <p className="text-sm text-gray-500 mt-1">Loading outfits...</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
