/**
 * Media Download Utility
 * 
 * Handles downloading media files from external URLs (Discord, etc.)
 * and storing them locally on the server.
 * 
 * Features:
 * - Download images, videos, and files
 * - Generate unique filenames
 * - Store in uploads directory
 * - Return local path for database storage
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Download media from URL and save to local storage
 * @param url - External media URL (Discord, etc.)
 * @param mediaType - Type of media (image, video, file)
 * @returns Local path relative to public folder, or null if download fails
 */
export async function downloadMedia(url: string, mediaType: 'image' | 'video' | 'file'): Promise<string | null> {
  try {
    // Fetch the media file
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to download media: ${response.statusText}`);
      return null;
    }

    // Get file extension from URL or content-type
    const contentType = response.headers.get('content-type') || '';
    let extension = getExtensionFromContentType(contentType);
    
    if (!extension) {
      // Try to get extension from URL
      const urlExt = url.split('.').pop()?.split('?')[0];
      extension = urlExt && urlExt.length < 5 ? urlExt : 'bin';
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${mediaType}_${timestamp}_${random}.${extension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Download and save file
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));

    // Return path relative to public folder
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error downloading media:', error);
    return null;
  }
}

/**
 * Get file extension from content-type header
 */
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
  };

  return typeMap[contentType.toLowerCase()] || '';
}

/**
 * Delete media file from local storage
 * Used when deleting logs
 */
export function deleteMedia(localPath: string): boolean {
  try {
    if (!localPath) return false;
    
    const filepath = path.join(__dirname, '../public', localPath);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting media:', error);
    return false;
  }
}
