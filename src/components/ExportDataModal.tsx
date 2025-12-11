'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

type ExportFormat = 'json' | 'csv';
type ExportType = 'items' | 'outfits' | 'characters' | 'timeline' | 'all';

interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  includeImages?: boolean;
}

const ExportDataModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    type: 'all',
    includeImages: false,
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      const data: Record<string, unknown[]> = {};

      // Fetch data based on selected type
      if (options.type === 'all' || options.type === 'items') {
        const itemsRes = await fetch('/api/items?limit=10000&includeVariations=true');
        const itemsData = await itemsRes.json();
        data.items = itemsData.data || [];
      }

      if (options.type === 'all' || options.type === 'outfits') {
        const outfitsRes = await fetch('/api/outfits');
        const outfitsData = await outfitsRes.json();
        data.outfits = outfitsData.data || [];
      }

      if (options.type === 'all' || options.type === 'characters') {
        const charactersRes = await fetch('/api/characters');
        const charactersData = await charactersRes.json();
        data.characters = charactersData.data || [];
      }

      if (options.type === 'all' || options.type === 'timeline') {
        const timelineRes = await fetch('/api/timeline');
        const timelineData = await timelineRes.json();
        data.timeline = timelineData.data || [];
      }

      // Remove images if not included
      if (!options.includeImages) {
        if (data.items) {
          data.items = data.items.map((item: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { images: _images, ...rest } = item as Record<string, unknown>;
            return rest;
          });
        }
      }

      // Generate file content
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (options.format === 'json') {
        fileContent = JSON.stringify(data, null, 2);
        fileName = `wardrobe-chronicle-export-${options.type}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format - convert to CSV
        fileContent = convertToCSV(data, options.type);
        fileName = `wardrobe-chronicle-export-${options.type}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${options.format.toUpperCase()}`);
      onClose();
    } catch (err) {
      toast.error('Failed to export data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: Record<string, unknown[]>, type: ExportType): string => {
    const rows: string[][] = [];

    if (type === 'items' || (type === 'all' && data.items)) {
      const items = data.items || [];
      rows.push(['Type', 'Name', 'Category', 'Description', 'Tags', 'Created', 'Updated']);
      items.forEach((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        rows.push([
          'Item',
          String(typedItem.name || ''),
          String(typedItem.category || ''),
          String(typedItem.description || ''),
          Array.isArray(typedItem.tags) ? typedItem.tags.join('; ') : '',
          String(typedItem.createdAt || ''),
          String(typedItem.updatedAt || ''),
        ]);
      });
    }

    if (type === 'outfits' || (type === 'all' && data.outfits)) {
      const outfits = data.outfits || [];
      if (rows.length > 0) rows.push([]); // Empty row separator
      rows.push(['Type', 'Name', 'Description', 'Tags', 'Item Count', 'Created', 'Updated']);
      outfits.forEach((outfit: unknown) => {
        const typedOutfit = outfit as Record<string, unknown>;
        rows.push([
          'Outfit',
          String(typedOutfit.name || ''),
          String(typedOutfit.description || ''),
          Array.isArray(typedOutfit.tags) ? typedOutfit.tags.join('; ') : '',
          String(Array.isArray(typedOutfit.items) ? typedOutfit.items.length : 0),
          String(typedOutfit.createdAt || ''),
          String(typedOutfit.updatedAt || ''),
        ]);
      });
    }

    if (type === 'characters' || (type === 'all' && data.characters)) {
      const characters = data.characters || [];
      if (rows.length > 0) rows.push([]);
      rows.push(['Type', 'Name', 'Description', 'Tags', 'Created', 'Updated']);
      characters.forEach((character: unknown) => {
        const typedCharacter = character as Record<string, unknown>;
        rows.push([
          'Character',
          String(typedCharacter.name || ''),
          String(typedCharacter.description || ''),
          Array.isArray(typedCharacter.tags) ? typedCharacter.tags.join('; ') : '',
          String(typedCharacter.createdAt || ''),
          String(typedCharacter.updatedAt || ''),
        ]);
      });
    }

    if (type === 'timeline' || (type === 'all' && data.timeline)) {
      const timeline = data.timeline || [];
      if (rows.length > 0) rows.push([]);
      rows.push(['Type', 'Title', 'Date', 'Description', 'Created', 'Updated']);
      timeline.forEach((entry: unknown) => {
        const typedEntry = entry as Record<string, unknown>;
        rows.push([
          'Timeline Entry',
          String(typedEntry.title || ''),
          String(typedEntry.date || ''),
          String(typedEntry.description || ''),
          String(typedEntry.createdAt || ''),
          String(typedEntry.updatedAt || ''),
        ]);
      });
    }

    return rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Export Data
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Export Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What to export
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Data' },
                    { value: 'items', label: 'Items Only' },
                    { value: 'outfits', label: 'Outfits Only' },
                    { value: 'characters', label: 'Characters Only' },
                    { value: 'timeline', label: 'Timeline Only' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="exportType"
                        value={option.value}
                        checked={options.type === option.value}
                        onChange={(e) => setOptions({ ...options, type: e.target.value as ExportType })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={options.format === 'json'}
                      onChange={(e) => setOptions({ ...options, format: e.target.value as ExportFormat })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">JSON</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={options.format === 'csv'}
                      onChange={(e) => setOptions({ ...options, format: e.target.value as ExportFormat })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">CSV</span>
                  </label>
                </div>
              </div>

              {/* Include Images */}
              {options.format === 'json' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeImages}
                      onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include image URLs</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Image files themselves are not exported, only their URLs
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Exporting...' : 'Export'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
