'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Character {
  _id: string;
  name: string;
  role?: string;
}

interface Outfit {
  _id: string;
  name: string;
}

interface TimelineFormData {
  characterId: string;
  outfitId: string;
  chapter: string;
  scene: string;
  location: string;
  timeOfDay: string;
  notes: string;
}

interface TimelineFormProps {
  initialData?: Partial<TimelineFormData>;
  onSubmit: (data: TimelineFormData) => Promise<void>;
  submitLabel?: string;
}

export function TimelineForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Entry',
}: TimelineFormProps) {
  const [formData, setFormData] = useState<TimelineFormData>({
    characterId: initialData?.characterId || '',
    outfitId: initialData?.outfitId || '',
    chapter: initialData?.chapter || '',
    scene: initialData?.scene || '',
    location: initialData?.location || '',
    timeOfDay: initialData?.timeOfDay || '',
    notes: initialData?.notes || '',
  });

  const [characters, setCharacters] = useState<Character[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      const [charactersRes, outfitsRes] = await Promise.all([
        fetch('/api/characters?limit=100'),
        fetch('/api/outfits?limit=100'),
      ]);

      if (charactersRes.ok) {
        const data = await charactersRes.json();
        setCharacters(data.characters || []);
      }

      if (outfitsRes.ok) {
        const data = await outfitsRes.json();
        setOutfits(data.outfits || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.characterId) {
      setError('Please select a character');
      return;
    }

    if (!formData.outfitId) {
      setError('Please select an outfit');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save timeline entry');
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof TimelineFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Character & Outfit Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Character & Outfit</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Character *
            </label>
            <select
              value={formData.characterId}
              onChange={(e) => updateField('characterId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingData}
            >
              <option value="">Select a character</option>
              {characters.map(char => (
                <option key={char._id} value={char._id}>
                  {char.name} {char.role && `(${char.role})`}
                </option>
              ))}
            </select>
            {loadingData && (
              <p className="text-sm text-gray-500 mt-1">Loading characters...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Outfit *
            </label>
            <select
              value={formData.outfitId}
              onChange={(e) => updateField('outfitId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingData}
            >
              <option value="">Select an outfit</option>
              {outfits.map(outfit => (
                <option key={outfit._id} value={outfit._id}>
                  {outfit.name}
                </option>
              ))}
            </select>
            {loadingData && (
              <p className="text-sm text-gray-500 mt-1">Loading outfits...</p>
            )}
          </div>
        </div>
      </div>

      {/* Story Context */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Chapter"
            type="text"
            value={formData.chapter}
            onChange={(e) => updateField('chapter', e.target.value)}
            placeholder="e.g., Chapter 1, Act 2, Prologue"
          />

          <Input
            label="Scene"
            type="text"
            value={formData.scene}
            onChange={(e) => updateField('scene', e.target.value)}
            placeholder="e.g., Opening scene, Battle sequence"
          />

          <Input
            label="Location"
            type="text"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g., Royal Palace, Forest clearing"
          />

          <Input
            label="Time of Day"
            type="text"
            value={formData.timeOfDay}
            onChange={(e) => updateField('timeOfDay', e.target.value)}
            placeholder="e.g., Morning, Sunset, Night"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional context, important details, outfit significance..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add any relevant details about why this outfit was chosen, character mood, weather conditions, etc.
          </p>
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
          disabled={submitting || loadingData}
          className="flex-1"
        >
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
