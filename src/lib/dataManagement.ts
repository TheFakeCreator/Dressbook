export interface BackupData {
  version: string;
  timestamp: string;
  items: unknown[];
  outfits: unknown[];
  characters: unknown[];
  timeline: unknown[];
  metadata: {
    itemCount: number;
    outfitCount: number;
    characterCount: number;
    timelineCount: number;
  };
}

export async function createFullBackup(): Promise<Blob> {
  try {
    // Fetch all data with includeVariations to get everything
    const [itemsRes, outfitsRes, charactersRes, timelineRes] = await Promise.all([
      fetch('/api/items?limit=10000&includeVariations=true'),
      fetch('/api/outfits?limit=10000'),
      fetch('/api/characters?limit=10000'),
      fetch('/api/timeline?limit=10000'),
    ]);

    const [itemsData, outfitsData, charactersData, timelineData] = await Promise.all([
      itemsRes.json(),
      outfitsRes.json(),
      charactersRes.json(),
      timelineRes.json(),
    ]);

    const backup: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      items: itemsData.data || itemsData.items || [],
      outfits: outfitsData.data || outfitsData.outfits || [],
      characters: charactersData.data || charactersData.characters || [],
      timeline: timelineData.data || timelineData.entries || [],
      metadata: {
        itemCount: (itemsData.data || itemsData.items || []).length,
        outfitCount: (outfitsData.data || outfitsData.outfits || []).length,
        characterCount: (charactersData.data || charactersData.characters || []).length,
        timelineCount: (timelineData.data || timelineData.entries || []).length,
      },
    };

    return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  } catch (error) {
    throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function restoreFromBackup(file: File): Promise<{ success: boolean; message: string; stats?: BackupData['metadata'] }> {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);

    // Validate backup structure
    if (!backup.version || !backup.items || !backup.outfits || !backup.characters) {
      throw new Error('Invalid backup file format');
    }

    // Import items
    let itemsImported = 0;
    for (const item of backup.items) {
      try {
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (response.ok) itemsImported++;
      } catch (error) {
        console.error('Failed to import item:', error);
      }
    }

    // Import outfits
    let outfitsImported = 0;
    for (const outfit of backup.outfits) {
      try {
        const response = await fetch('/api/outfits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outfit),
        });
        if (response.ok) outfitsImported++;
      } catch (error) {
        console.error('Failed to import outfit:', error);
      }
    }

    // Import characters
    let charactersImported = 0;
    for (const character of backup.characters) {
      try {
        const response = await fetch('/api/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(character),
        });
        if (response.ok) charactersImported++;
      } catch (error) {
        console.error('Failed to import character:', error);
      }
    }

    // Import timeline
    let timelineImported = 0;
    for (const entry of backup.timeline) {
      try {
        const response = await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (response.ok) timelineImported++;
      } catch (error) {
        console.error('Failed to import timeline entry:', error);
      }
    }

    return {
      success: true,
      message: 'Backup restored successfully',
      stats: {
        itemCount: itemsImported,
        outfitCount: outfitsImported,
        characterCount: charactersImported,
        timelineCount: timelineImported,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function importFromFile(file: File, type: 'items' | 'outfits' | 'characters'): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const text = await file.text();
    let data: unknown[];

    if (file.name.endsWith('.json')) {
      data = JSON.parse(text);
      if (!Array.isArray(data)) {
        data = [data];
      }
    } else if (file.name.endsWith('.csv')) {
      data = parseCSV(text);
    } else {
      throw new Error('Unsupported file format. Please use JSON or CSV.');
    }

    const endpoint = type === 'items' ? '/api/items' : type === 'outfits' ? '/api/outfits' : '/api/characters';
    let imported = 0;

    for (const item of data) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (response.ok) imported++;
      } catch (error) {
        console.error(`Failed to import ${type}:`, error);
      }
    }

    return {
      success: true,
      message: `Imported ${imported} of ${data.length} ${type}`,
      count: imported,
    };
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0,
    };
  }
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }

  return data;
}

export function downloadBackup(blob: Blob, filename?: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `wardrobe-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Data validation utilities
export interface ValidationIssue {
  type: 'error' | 'warning';
  entity: string;
  id: string;
  message: string;
}

export async function validateData(): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    // Fetch all data
    const [itemsRes, outfitsRes, charactersRes] = await Promise.all([
      fetch('/api/items?limit=1000'),
      fetch('/api/outfits?limit=1000'),
      fetch('/api/characters?limit=1000'),
    ]);

    const [itemsData, outfitsData, charactersData] = await Promise.all([
      itemsRes.json(),
      outfitsRes.json(),
      charactersRes.json(),
    ]);

    const items = itemsData.items || [];
    const outfits = outfitsData.outfits || [];
    const characters = charactersData.characters || [];

    // Validate items
    items.forEach((item: { _id: string; name: string; category: string; images: unknown[] }) => {
      if (!item.name || item.name.trim() === '') {
        issues.push({
          type: 'error',
          entity: 'item',
          id: item._id,
          message: 'Item has no name',
        });
      }
      if (!item.category) {
        issues.push({
          type: 'warning',
          entity: 'item',
          id: item._id,
          message: 'Item has no category',
        });
      }
      if (!item.images || item.images.length === 0) {
        issues.push({
          type: 'warning',
          entity: 'item',
          id: item._id,
          message: 'Item has no images',
        });
      }
    });

    // Validate outfits
    outfits.forEach((outfit: { _id: string; name: string; items: string[] }) => {
      if (!outfit.name || outfit.name.trim() === '') {
        issues.push({
          type: 'error',
          entity: 'outfit',
          id: outfit._id,
          message: 'Outfit has no name',
        });
      }
      if (!outfit.items || outfit.items.length === 0) {
        issues.push({
          type: 'warning',
          entity: 'outfit',
          id: outfit._id,
          message: 'Outfit has no items',
        });
      }
    });

    // Validate characters
    characters.forEach((character: { _id: string; name: string }) => {
      if (!character.name || character.name.trim() === '') {
        issues.push({
          type: 'error',
          entity: 'character',
          id: character._id,
          message: 'Character has no name',
        });
      }
    });
  } catch (error) {
    issues.push({
      type: 'error',
      entity: 'system',
      id: 'validation',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return issues;
}
