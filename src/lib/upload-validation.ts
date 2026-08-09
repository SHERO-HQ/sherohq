export type UploadValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export function validateUploadedFile(file: File): UploadValidationResult {
  if (!file) {
    return { ok: false, error: "No file provided" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.",
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: "File too large. Maximum size is 5MB." };
  }

  return { ok: true };
}
