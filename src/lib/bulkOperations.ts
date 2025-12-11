export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: string[];
}

export async function bulkDeleteItems(ids: string[]): Promise<BulkOperationResult> {
  const results = await Promise.allSettled(
    ids.map(id => fetch(`/api/items/${id}`, { method: 'DELETE' }))
  );

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason.message || 'Unknown error');

  return {
    success: errors.length === 0,
    successCount,
    failedCount: errors.length,
    errors,
  };
}

export async function bulkUpdateTags(ids: string[], tagsToAdd: string[], tagsToRemove: string[]): Promise<BulkOperationResult> {
  const errors: string[] = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      // Fetch current item
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch item ${id}`);
      
      const data = await response.json();
      const currentTags = data.item?.tags || [];

      // Add new tags and remove specified tags
      let updatedTags = [...new Set([...currentTags, ...tagsToAdd])];
      updatedTags = updatedTags.filter(tag => !tagsToRemove.includes(tag));

      // Update item
      const updateResponse = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });

      if (!updateResponse.ok) throw new Error(`Failed to update item ${id}`);
      successCount++;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    failedCount: errors.length,
    errors,
  };
}

export async function bulkExportData(ids: string[], type: 'items' | 'outfits' | 'characters', format: 'json' | 'csv'): Promise<Blob> {
  const endpoint = type === 'items' ? '/api/items' : type === 'outfits' ? '/api/outfits' : '/api/characters';
  
  // Fetch all items
  const items = await Promise.all(
    ids.map(async id => {
      const response = await fetch(`${endpoint}/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type} ${id}`);
      const data = await response.json();
      return type === 'items' ? data.item : type === 'outfits' ? data.outfit : data.character;
    })
  );

  if (format === 'json') {
    return new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  } else {
    // CSV format
    if (items.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }

    const headers = Object.keys(items[0]);
    const csvRows = [
      headers.join(','),
      ...items.map(item =>
        headers.map(header => {
          const value = item[header];
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return new Blob([csvRows.join('\n')], { type: 'text/csv' });
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
