# Cloudinary Integration & Storage Configuration

## Overview
The application now supports both **Local Storage** and **Cloudinary** for image uploads, configurable via environment variables.

## Storage Options

### 1. Local Storage (Default)
- Images stored in `public/uploads/` directory
- Multiple sizes generated automatically (large, medium, small, thumbnail)
- Good for development and small deployments
- No external dependencies or costs

### 2. Cloudinary
- Cloud-based image storage with CDN delivery
- Automatic image optimization and transformations
- Scalable for production use
- Requires Cloudinary account (free tier available)

## Configuration

### Environment Variables

Add to your `.env.local` file:

```env
# Storage Configuration
# Options: 'local' or 'cloudinary'
STORAGE_PROVIDER=local

# Cloudinary Credentials (only needed if STORAGE_PROVIDER=cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Switching Storage Providers

1. **To use Local Storage:**
   ```env
   STORAGE_PROVIDER=local
   ```

2. **To use Cloudinary:**
   ```env
   STORAGE_PROVIDER=cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=552342993912256
   CLOUDINARY_API_SECRET=o2k2L8xOHtRQWk6WkeFbh1wOH_M
   ```

3. Restart your development server after changing

## Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard
3. Find your credentials:
   - **Cloud Name**: Displayed at top
   - **API Key**: In "Account Details" section
   - **API Secret**: In "Account Details" section (click "Show")
4. Copy values to `.env.local`

## Settings Page

Access the Settings page at `/settings` to:
- View current storage provider
- See configuration status
- Get instructions for changing providers
- View storage limits and allowed formats

## Features

### Upload API (`/api/upload`)
- Validates file type (JPEG, PNG, WebP)
- Validates file size (max 10MB)
- Routes to appropriate storage provider
- Returns consistent response format

### Cloudinary Features
- Automatic image optimization
- Format conversion (WebP when supported)
- Quality adjustment
- Maximum dimensions: 1200x1200px
- CDN delivery for fast loading
- Image transformations via URL parameters

### Local Storage Features
- Multiple image sizes generated:
  - **Large**: 1200px (max dimension)
  - **Medium**: 800px
  - **Small**: 400px
  - **Thumbnail**: 150px
- Sharp-based image processing
- Efficient compression

## File Structure

### New Files Created

```
src/
├── lib/
│   ├── cloudinary.ts          # Cloudinary SDK configuration
│   ├── storageConfig.ts       # Storage provider configuration
│   └── (existing files)
└── app/
    ├── api/
    │   └── upload/
    │       └── route.ts       # Updated with dual storage support
    └── settings/
        └── page.tsx           # Settings page
```

### Key Functions

**`src/lib/cloudinary.ts`:**
- `uploadToCloudinary()` - Upload image to Cloudinary
- `deleteFromCloudinary()` - Delete image from Cloudinary
- `getCloudinaryThumbnail()` - Generate thumbnail URL

**`src/lib/storageConfig.ts`:**
- `getStorageConfig()` - Get current storage configuration
- `validateStorageConfig()` - Validate storage settings
- `STORAGE_PROVIDER` - Current provider constant

## API Response Format

Both storage providers return consistent response:

```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "publicId": "wardrobe-items/abc123",
    "sizes": {
      "large": "https://...",
      "medium": "https://...",
      "small": "https://...",
      "thumbnail": "https://..."
    },
    "metadata": {
      "width": 1200,
      "height": 1200,
      "format": "jpeg",
      "size": 245678
    },
    "provider": "cloudinary"
  }
}
```

## Migration Between Providers

### From Local to Cloudinary
1. Update `.env.local` with Cloudinary credentials
2. Set `STORAGE_PROVIDER=cloudinary`
3. Restart server
4. New uploads go to Cloudinary
5. Old local images remain accessible in `public/uploads/`

### From Cloudinary to Local
1. Set `STORAGE_PROVIDER=local` in `.env.local`
2. Restart server
3. New uploads saved locally
4. Old Cloudinary images remain accessible via their URLs

**Note:** Existing image URLs in database don't change automatically. Consider a migration script if needed.

## Production Recommendations

### For Production Deployment:
- ✅ Use Cloudinary for:
  - Automatic CDN delivery
  - Image optimization
  - Scalability
  - Reduced server load

### For Development/Testing:
- ✅ Use Local Storage for:
  - No external dependencies
  - Faster development
  - No costs
  - Offline work

## Troubleshooting

### Cloudinary Upload Fails
1. Check credentials in `.env.local`
2. Verify `STORAGE_PROVIDER=cloudinary`
3. Check Cloudinary dashboard for upload quota
4. Restart development server

### Local Upload Fails
1. Check `public/uploads/` directory exists and is writable
2. Verify file permissions
3. Check disk space

### Images Not Loading
1. Check storage provider matches when image was uploaded
2. For Cloudinary: verify URLs are accessible
3. For Local: verify `public/uploads/` is accessible

## Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Keep Cloudinary API credentials secret
- ⚠️ Use environment variables in production
- ⚠️ Validate file types and sizes on server

## File Size Limits

- **Maximum Upload**: 10MB
- **Allowed Formats**: JPEG, PNG, WebP
- Configurable in `/api/upload/route.ts`

## Navigation

Settings page is accessible from:
- Navigation menu (⚙️ Settings)
- Direct URL: `/settings`

## Future Enhancements

Potential improvements:
- [ ] AWS S3 support
- [ ] Azure Blob Storage support
- [ ] Image migration tool between providers
- [ ] Bulk upload capability
- [ ] Image analytics and usage tracking
- [ ] Advanced Cloudinary transformations UI
