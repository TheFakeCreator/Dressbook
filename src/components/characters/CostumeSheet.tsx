'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    items?: Array<{
      itemId: {
        _id: string;
        name: string;
        category: string;
        images?: Array<{ url: string; isPrimary?: boolean }>;
      };
      layer: number;
    }>;
  };
}

interface TimelineOutfit {
  _id: string;
  outfitId: {
    _id: string;
    name: string;
    description?: string;
    tags?: string[];
    items?: Array<{
      itemId: {
        _id: string;
        name: string;
        category: string;
        images?: Array<{ url: string; isPrimary?: boolean }>;
      };
      layer: number;
    }>;
  };
  chapter?: string;
  scene?: string;
  storyDate?: string;
  notes?: string;
}

interface CostumeSheetProps {
  character: Character;
  timelineOutfits?: TimelineOutfit[];
}

export default function CostumeSheet({ character, timelineOutfits = [] }: CostumeSheetProps) {
  const [isExporting, setIsExporting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const getPrimaryImage = (images?: Array<{ url: string; isPrimary?: boolean }>) => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.isPrimary);
    return primary?.url || images[0].url;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to reduce bundle size
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = sheetRef.current;
      if (!element) return;

      const opt = {
        margin: 0.5,
        filename: `${character.name.replace(/\s+/g, '_')}_Costume_Sheet.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export requires html2pdf.js library. Please use the Print button instead or run: npm install html2pdf.js');
    } finally {
      setIsExporting(false);
    }
  };

  // Get unique outfits from timeline
  const uniqueOutfits = timelineOutfits.reduce((acc, entry) => {
    if (entry.outfitId && !acc.find(o => o._id === entry.outfitId._id)) {
      acc.push(entry.outfitId);
    }
    return acc;
  }, [] as TimelineOutfit['outfitId'][]);

  return (
    <div className="space-y-4">
      {/* Action Buttons (hide on print) */}
      <div className="flex gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Sheet
        </Button>
        <Button onClick={handleExportPDF} disabled={isExporting}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>

      {/* Costume Sheet Content */}
      <div ref={sheetRef} className="bg-white">
        <Card className="print:shadow-none print:border-none">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6 print:break-after-avoid">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {character.name}
                </h1>
                {character.role && (
                  <p className="text-lg text-gray-600 mb-3">{character.role}</p>
                )}
                {character.description && (
                  <p className="text-sm text-gray-700 max-w-2xl">{character.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Costume Sheet</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Physical Traits */}
          {character.physicalTraits && Object.keys(character.physicalTraits).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Physical Traits
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(character.physicalTraits).map(([key, value]) => {
                  if (!value) return null;
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-700">{label}:</span>{' '}
                      <span className="text-gray-900">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Default Outfit */}
          {character.defaultOutfit && (
            <div className="mb-6 print:break-inside-avoid">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Default Outfit
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {character.defaultOutfit.name}
                </h3>
                {character.defaultOutfit.description && (
                  <p className="text-sm text-gray-700 mb-3">
                    {character.defaultOutfit.description}
                  </p>
                )}
                {character.defaultOutfit.items && character.defaultOutfit.items.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    {character.defaultOutfit.items.map((item, idx) => {
                      const imageUrl = getPrimaryImage(item.itemId.images);
                      return (
                        <div key={idx} className="bg-white rounded border border-gray-200 p-2">
                          <div className="relative w-full aspect-square bg-gray-100 rounded mb-2">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={item.itemId.name}
                                fill
                                className="object-cover rounded"
                                sizes="150px"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {item.itemId.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.itemId.category}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Outfits */}
          {uniqueOutfits.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Outfit Changes ({uniqueOutfits.length})
              </h2>
              <div className="space-y-4">
                {uniqueOutfits.map((outfit) => {
                  // Find all timeline entries for this outfit
                  const entries = timelineOutfits.filter(
                    e => e.outfitId._id === outfit._id
                  );
                  
                  return (
                    <div key={outfit._id} className="border border-gray-200 rounded-lg p-4 print:break-inside-avoid">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {outfit.name}
                          </h3>
                          {outfit.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {outfit.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Timeline appearances */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Worn in:</p>
                        <div className="flex flex-wrap gap-2">
                          {entries.map((entry) => (
                            <span
                              key={entry._id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {entry.chapter && `Ch. ${entry.chapter}`}
                              {entry.scene && `, Scene ${entry.scene}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Outfit items */}
                      {outfit.items && outfit.items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {outfit.items.map((item, idx) => {
                            const imageUrl = getPrimaryImage(item.itemId.images);
                            return (
                              <div key={idx} className="bg-gray-50 rounded border border-gray-200 p-2">
                                <div className="relative w-full aspect-square bg-white rounded mb-1">
                                  {imageUrl ? (
                                    <Image
                                      src={imageUrl}
                                      alt={item.itemId.name}
                                      fill
                                      className="object-cover rounded"
                                      sizes="120px"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {item.itemId.name}
                                </p>
                                <p className="text-xs text-gray-500">{item.itemId.category}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tags */}
                      {outfit.tags && outfit.tags.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {outfit.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {(character.personality || character.backstory) && (
            <div className="mb-6 print:break-inside-avoid">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                Additional Notes
              </h2>
              {character.personality && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Personality:</h3>
                  <p className="text-sm text-gray-900">{character.personality}</p>
                </div>
              )}
              {character.backstory && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Backstory:</h3>
                  <p className="text-sm text-gray-900">{character.backstory}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
            <p>Generated by Wardrobe Chronicle • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
