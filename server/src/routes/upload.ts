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
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
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
