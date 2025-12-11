import sharp from 'sharp';
import path from 'path';
import { getUploadDir } from './upload';

export interface ImageSizes {
  original: string;
  large: string;
  medium: string;
  thumbnail: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Process and optimize an uploaded image
 * Creates multiple sizes: original, large (1200px), medium (600px), thumbnail (200px)
 */
export async function processImage(
  buffer: Buffer,
  filename: string
): Promise<{ sizes: ImageSizes; metadata: ImageMetadata }> {
  const uploadDir = getUploadDir();
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);

  // Get metadata from original
  const metadata = await sharp(buffer).metadata();

  // Generate unique filename
  const timestamp = Date.now();
  const baseName = `${nameWithoutExt}-${timestamp}`;

  // Save original (optimized)
  const originalPath = path.join(uploadDir, `${baseName}-original${ext}`);
  await sharp(buffer)
    .jpeg({ quality: 90, progressive: true })
    .png({ quality: 90, compressionLevel: 9 })
    .webp({ quality: 90 })
    .toFile(originalPath);

  // Generate large (1200px width)
  const largePath = path.join(uploadDir, `${baseName}-large${ext}`);
  await sharp(buffer)
    .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality: 85, progressive: true })
    .png({ quality: 85 })
    .webp({ quality: 85 })
    .toFile(largePath);

  // Generate medium (600px width)
  const mediumPath = path.join(uploadDir, `${baseName}-medium${ext}`);
  await sharp(buffer)
    .resize(600, null, { withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality: 80, progressive: true })
    .png({ quality: 80 })
    .webp({ quality: 80 })
    .toFile(mediumPath);

  // Generate thumbnail (200px width)
  const thumbnailPath = path.join(uploadDir, `${baseName}-thumb${ext}`);
  await sharp(buffer)
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 75 })
    .png({ quality: 75 })
    .webp({ quality: 75 })
    .toFile(thumbnailPath);

  return {
    sizes: {
      original: `/uploads/${baseName}-original${ext}`,
      large: `/uploads/${baseName}-large${ext}`,
      medium: `/uploads/${baseName}-medium${ext}`,
      thumbnail: `/uploads/${baseName}-thumb${ext}`,
    },
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    },
  };
}

/**
 * Delete all sizes of an image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const uploadDir = getUploadDir();
  
  // Extract base filename
  const filename = path.basename(imageUrl);
  const matches = filename.match(/^(.+)-(original|large|medium|thumb)(\..+)$/);
  
  if (!matches) {
    throw new Error('Invalid image filename format');
  }

  const [, baseName, , ext] = matches;

  // Delete all sizes
  const sizes = ['original', 'large', 'medium', 'thumb'];
  const fs = await import('fs/promises');
  
  await Promise.all(
    sizes.map(async (size) => {
      const filePath = path.join(uploadDir, `${baseName}-${size}${ext}`);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore if file doesn't exist
        console.error(`Failed to delete ${filePath}:`, error);
      }
    })
  );
}
