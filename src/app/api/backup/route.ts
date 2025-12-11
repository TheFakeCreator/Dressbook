import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClothingItem from '@/models/ClothingItem';
import Outfit from '@/models/Outfit';
import Character from '@/models/Character';
import TimelineEntry from '@/models/TimelineEntry';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * GET /api/backup
 * Create a complete backup including database and local images
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const includeImages = searchParams.get('includeImages') === 'true';
    const storageProvider = process.env.STORAGE_PROVIDER || 'local';

    console.log('🔄 Starting backup process...');
    console.log(`📊 Storage Provider: ${storageProvider}`);
    console.log(`🖼️  Include Images: ${includeImages}`);

    // Fetch all data
    console.log('📥 Fetching data from database...');
    const [items, outfits, characters, timeline] = await Promise.all([
      ClothingItem.find({}).lean(),
      Outfit.find({}).lean(),
      Character.find({}).lean(),
      TimelineEntry.find({}).lean(),
    ]);

    console.log(`✅ Fetched ${items.length} items, ${outfits.length} outfits, ${characters.length} characters, ${timeline.length} timeline entries`);

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      storageProvider,
      items,
      outfits,
      characters,
      timeline,
      metadata: {
        itemCount: items.length,
        outfitCount: outfits.length,
        characterCount: characters.length,
        timelineCount: timeline.length,
      },
    };

    console.log('📦 Backup data structure created');

    // If not including images or using cloudinary, just return JSON
    if (!includeImages || storageProvider === 'cloudinary') {
      console.log('✅ Returning JSON backup (no local images to include)');
      return NextResponse.json(backup);
    }

    // For local storage with images, create a zip file
    console.log('📦 Creating ZIP archive with local images...');
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    // Promise to track when archive is done
    const archivePromise = new Promise<void>((resolve, reject) => {
      archive.on('error', (err: Error) => {
        console.error('❌ Archive error:', err);
        reject(err);
      });

      archive.on('end', () => {
        console.log('✅ Archive stream ended');
        resolve();
      });

      archive.on('finish', () => {
        console.log('✅ Archive finalized');
      });
    });

    // Collect archive data
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Add database JSON to archive
    console.log('📝 Adding database.json to archive...');
    archive.append(JSON.stringify(backup, null, 2), { name: 'database.json' });

    // Collect all image paths from items
    console.log('🔍 Collecting image paths...');
    const imagePaths = new Set<string>();
    items.forEach((item: { images?: { url: string }[] }) => {
      if (item.images) {
        item.images.forEach((img) => {
          if (img.url && img.url.startsWith('/uploads/')) {
            imagePaths.add(img.url);
          }
        });
      }
    });

    console.log(`📸 Found ${imagePaths.size} local images to backup`);

    // Add images to archive
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let imagesAdded = 0;
    let imagesMissing = 0;
    
    for (const imagePath of imagePaths) {
      const relativePath = imagePath.replace('/uploads/', '');
      const fullPath = path.join(uploadsDir, relativePath);
      
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: `images/${relativePath}` });
        imagesAdded++;
        if (imagesAdded % 10 === 0) {
          console.log(`   📸 Added ${imagesAdded}/${imagePaths.size} images...`);
        }
      } else {
        imagesMissing++;
        console.warn(`   ⚠️  Image not found: ${relativePath}`);
      }
    }

    console.log(`✅ Added ${imagesAdded} images to archive`);
    if (imagesMissing > 0) {
      console.warn(`⚠️  ${imagesMissing} images were missing from disk`);
    }

    // Finalize archive
    console.log('🔨 Finalizing ZIP archive...');
    archive.finalize();

    // Wait for archive to complete
    await archivePromise;

    // Combine chunks into single buffer
    const buffer = Buffer.concat(chunks);
    const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup complete! Size: ${sizeInMB} MB`);

    // Return zip file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="wardrobe-backup-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
