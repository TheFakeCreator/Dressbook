import fs from 'fs/promises';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

export function getUploadDir() {
  return uploadsDir;
}

export function getPublicPath(filename: string) {
  return `/uploads/${filename}`;
}
