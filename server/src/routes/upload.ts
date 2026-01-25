import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = Router();

// Configure upload directory
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

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

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/upload - Upload single image (Admin only)
router.post(
  "/",
  adminAuth,
  upload.single("image"),
  (req: AdminRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      console.log(
        `📸 Image uploaded: ${req.file.filename} by ${req.admin?.username}`,
      );

      res.json({
        success: true,
        imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

// POST /api/upload/multiple - Upload multiple images (Admin only)
router.post(
  "/multiple",
  adminAuth,
  upload.array("images", 5),
  (req: AdminRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      const imageUrls = files.map((file) => `/uploads/${file.filename}`);

      console.log(
        `📸 ${files.length} images uploaded by ${req.admin?.username}`,
      );

      res.json({
        success: true,
        imageUrls,
        filenames: files.map((f) => f.filename),
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  },
);

// DELETE /api/upload/:filename - Delete an image (Admin only)
router.delete("/:filename", adminAuth, (req: AdminRequest, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    fs.unlinkSync(filePath);

    console.log(`🗑️ Image deleted: ${filename} by ${req.admin?.username}`);

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
