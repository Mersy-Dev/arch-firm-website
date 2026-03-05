    import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';

// ─── Upload buffer to Cloudinary ───────────────────────────────────────────
// Uses upload_stream so the in-memory buffer goes straight to Cloudinary
// without ever writing a temp file to disk.
//
// @param buffer  — req.file.buffer from multer memoryStorage
// @param folder  — Cloudinary folder, e.g. "forma/services"
// @returns       — secure HTTPS URL of the uploaded image

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Auto-format + auto-quality for best size/quality ratio
        transformation: [{ fetch_format: 'auto', quality: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );

    // Pipe the in-memory buffer into the upload stream
    Readable.from(buffer).pipe(uploadStream);
  });
};

// ─── Delete image from Cloudinary by URL ──────────────────────────────────
// Extracts the public_id from the full Cloudinary URL before deleting.
// Safe to call with non-Cloudinary URLs — it will simply no-op.
//
// @param url — full Cloudinary secure URL, e.g.
//              https://res.cloudinary.com/demo/image/upload/v123/forma/services/abc.jpg

export const deleteFromCloudinary = async (url: string): Promise<void> => {
  if (!url?.includes('cloudinary.com')) return;

  // Extract public_id — everything after /upload/v<version>/ and before the extension
  // e.g. "forma/services/abc" from the example above
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  if (!matches?.[1]) return;

  const publicId = matches[1];
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};