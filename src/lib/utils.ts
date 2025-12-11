/**
 * Utility function for combining classnames
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse historical period to get start and end years
 * Examples: "1700-1800" -> {start: 1700, end: 1800}
 *           "1920s" -> {start: 1920, end: 1929}
 *           "Victorian Era" -> null (manual entry needed)
 */
export function parseHistoricalPeriod(period: string): {
  start: number | null;
  end: number | null;
} {
  // Match "1700-1800" pattern
  const rangeMatch = period.match(/(\d{4})\s*-\s*(\d{4})/);
  if (rangeMatch) {
    return {
      start: parseInt(rangeMatch[1]),
      end: parseInt(rangeMatch[2]),
    };
  }

  // Match "1920s" pattern
  const decadeMatch = period.match(/(\d{4})s/);
  if (decadeMatch) {
    const start = parseInt(decadeMatch[1]);
    return {
      start,
      end: start + 9,
    };
  }

  // Match single year "1850"
  const yearMatch = period.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return {
      start: year,
      end: year,
    };
  }

  return { start: null, end: null };
}
