import { Router, Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { supabase } from "../lib/supabase";

const router = Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type "${file.mimetype}". Allowed: JPEG, PNG, GIF, WebP, AVIF, HEIC`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "image/jpeg";

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "image/png";

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  )
    return "image/gif";

  // WebP: RIFF????WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return "image/webp";

  // AVIF / HEIC / HEIF: ISO Base Media file (ftyp box)
  // Bytes 4-7 are "ftyp", brand at bytes 8-11 identifies the subtype
  if (
    buffer.length >= 12 &&
    buffer[4] === 0x66 && // f
    buffer[5] === 0x74 && // t
    buffer[6] === 0x79 && // y
    buffer[7] === 0x70    // p
  ) {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    if (
      brand.startsWith("heic") ||
      brand.startsWith("heis") ||
      brand.startsWith("hevc") ||
      brand.startsWith("mif1") ||
      brand.startsWith("msf1")
    )
      return "image/heic";
  }

  return null;
}

function validateImageFile(file: Express.Multer.File): string | null {
  const detectedMime = detectImageMime(file.buffer);

  // AVIF/HEIC are valid but our magic-byte detector may not cover all variants.
  // If the fileFilter passed them, trust the declared mimetype.
  const isContainerFormat =
    file.mimetype === "image/avif" ||
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif";
  if (isContainerFormat) return null;

  if (!detectedMime) {
    return "File signature is not a valid supported image";
  }

  // Treat image/jpg and image/jpeg as the same type
  const normalise = (m: string) => (m === "image/jpg" ? "image/jpeg" : m);
  if (normalise(detectedMime) !== normalise(file.mimetype)) {
    return "Uploaded file content does not match declared image type";
  }

  return null;
}

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}

// POST /api/upload - Upload single image
router.post(
  "/",
  adminAuth,
  upload.single("image"),
  async (req: AdminRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validationError = validateImageFile(req.file);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      console.log(`📤 Uploading ${req.file.originalname} to Supabase...`);
      const imageUrl = await uploadToSupabase(req.file);
      console.log(`✅ Upload successful: ${imageUrl}`);

      res.json({
        success: true,
        imageUrl,
        filename: path.basename(imageUrl),
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// POST /api/upload/multiple - Upload multiple images
router.post(
  "/multiple",
  adminAuth,
  upload.array("images", 5),
  async (req: AdminRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      for (const file of files) {
        const validationError = validateImageFile(file);
        if (validationError) {
          return res
            .status(400)
            .json({ error: `${file.originalname}: ${validationError}` });
        }
      }

      console.log(
        `📤 Uploading ${files.length} images to Supabase by ${req.admin?.username}`,
      );

      const uploadPromises = files.map((file) => uploadToSupabase(file));
      const imageUrls = await Promise.all(uploadPromises);

      console.log(`✅ All images uploaded successfully`);

      res.json({
        success: true,
        imageUrls,
        filenames: imageUrls.map((url) => path.basename(url)),
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Failed to upload images",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// DELETE /api/upload/:filename - Delete an image (Note: filename here is likely the full path or ID in bucket)
router.delete(
  "/:filename",
  adminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const filename = req.params.filename as string;

      // Attempt to delete from text/path.
      // Since we return full URLs, the frontend might send the filename associated with it.
      // However, if we migrated, existing local files can't be deleted this way.
      // For Supabase, we need the path inside the bucket.

      // If the frontend sends just the UUID filename:
      const { error } = await supabase.storage
        .from("products")
        .remove([filename]);

      if (error) {
        throw error;
      }

      console.log(`🗑️ Image deleted from Supabase: ${filename}`);

      res.json({ success: true, message: "Image deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  },
);

export default router;
