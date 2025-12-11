/**
 * Storage configuration and provider selection
 */

export type StorageProvider = 'local' | 'cloudinary';

export const STORAGE_PROVIDER: StorageProvider = 
  (process.env.STORAGE_PROVIDER as StorageProvider) || 'local';

export const isCloudinaryEnabled = STORAGE_PROVIDER === 'cloudinary';
export const isLocalStorageEnabled = STORAGE_PROVIDER === 'local';

/**
 * Get storage provider configuration
 */
export function getStorageConfig() {
  return {
    provider: STORAGE_PROVIDER,
    isCloudinary: isCloudinaryEnabled,
    isLocal: isLocalStorageEnabled,
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      isConfigured: !!(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ),
    },
  };
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (STORAGE_PROVIDER === 'cloudinary') {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      errors.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      errors.push('CLOUDINARY_API_KEY is not set');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      errors.push('CLOUDINARY_API_SECRET is not set');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
