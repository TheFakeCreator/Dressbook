import { NextRequest, NextResponse } from 'next/server';
import { ensureUploadDir } from '@/lib/upload';
import { processImage } from '@/lib/imageProcessor';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { STORAGE_PROVIDER, validateStorageConfig } from '@/lib/storageConfig';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    // Validate storage configuration
    const storageValidation = validateStorageConfig();
    if (!storageValidation.valid) {
      return NextResponse.json(
        { error: 'Storage configuration error', details: storageValidation.errors },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload based on storage provider
    if (STORAGE_PROVIDER === 'cloudinary') {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, 'wardrobe-items');
      
      return NextResponse.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          sizes: {
            large: result.url,
            medium: result.url,
            small: result.url,
            thumbnail: result.url,
          },
          metadata: {
            width: result.width,
            height: result.height,
            format: file.type.split('/')[1],
            size: file.size,
          },
          provider: 'cloudinary',
        },
      });
    } else {
      // Upload to local storage
      await ensureUploadDir();
      
      // Process image (create multiple sizes)
      const { sizes, metadata } = await processImage(buffer, file.name);

      return NextResponse.json({
        success: true,
        data: {
          url: sizes.large, // Default to large size
          sizes,
          metadata,
          provider: 'local',
        },
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Get upload requirements
export async function GET() {
  const config = validateStorageConfig();
  
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
      allowedTypes: ALLOWED_TYPES,
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      storageProvider: STORAGE_PROVIDER,
      storageConfigured: config.valid,
    },
  });
}
