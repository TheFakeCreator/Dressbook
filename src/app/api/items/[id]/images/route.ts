import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';
import { ensureUploadDir } from '@/lib/upload';
import { processImage, deleteImage } from '@/lib/imageProcessor';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// GET /api/items/:id/images - Get all images for an item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const item = await ClothingItem.findById(params.id).lean();

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item.images || [],
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/items/:id/images - Add image to item
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await ensureUploadDir();

    const item = await ClothingItem.findById(params.id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const caption = formData.get('caption') as string | null;
    const isPrimary = formData.get('isPrimary') === 'true';

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

    // Process image
    const { sizes, metadata } = await processImage(buffer, file.name);

    // If this is set as primary, unset other primary images
    if (isPrimary && item.images) {
      item.images.forEach((img) => {
        img.isPrimary = false;
      });
    }

    // Add image to item
    const newImage = {
      url: sizes.large,
      thumbnail: sizes.thumbnail,
      caption: caption || undefined,
      isPrimary: isPrimary || (item.images?.length === 0),
      width: metadata.width,
      height: metadata.height,
    };

    item.images = item.images || [];
    item.images.push(newImage);
    await item.save();

    return NextResponse.json({
      success: true,
      data: newImage,
    });
  } catch (error) {
    console.error('Error adding image:', error);
    return NextResponse.json(
      { error: 'Failed to add image' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/:id/images - Delete an image from item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const item = await ClothingItem.findById(params.id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Find and remove image
    const imageIndex = item.images?.findIndex((img) => img.url === imageUrl);

    if (imageIndex === undefined || imageIndex === -1) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete physical files
    try {
      await deleteImage(imageUrl);
    } catch (err) {
      console.error('Error deleting physical files:', err);
    }

    // Remove from database
    item.images?.splice(imageIndex, 1);
    await item.save();

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/:id/images - Update image metadata (caption, isPrimary)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { imageUrl, caption, isPrimary } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const item = await ClothingItem.findById(params.id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Find image
    const image = item.images?.find((img) => img.url === imageUrl);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Update caption
    if (caption !== undefined) {
      image.caption = caption;
    }

    // Update primary status
    if (isPrimary !== undefined) {
      if (isPrimary) {
        // Unset other primary images
        item.images?.forEach((img) => {
          img.isPrimary = false;
        });
      }
      image.isPrimary = isPrimary;
    }

    await item.save();

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}
