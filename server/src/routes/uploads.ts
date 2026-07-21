import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

async function processImage(buffer: Buffer, filename: string) {
  const id = uuid();
  const baseName = `${id}-${filename.replace(/\.[^.]+$/, "")}`;

  // Full image - use lower quality and smaller max size for low-RAM environments
  const fullPath = path.join(uploadDir, `${baseName}.webp`);
  await sharp(buffer, { sequentialRead: true })
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(fullPath);

  // Thumbnail
  const thumbPath = path.join(uploadDir, `${baseName}-thumb.webp`);
  await sharp(buffer, { sequentialRead: true })
    .resize(200, 200, { fit: "cover" })
    .webp({ quality: 70 })
    .toFile(thumbPath);

  // Free input buffer
  buffer = null as any;

  return {
    url: `/uploads/${baseName}.webp`,
    thumbnail: `/uploads/${baseName}-thumb.webp`,
  };
}

router.post("/", authenticate, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await processImage(req.file.buffer, req.file.originalname);

    res.json(result);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.delete("/:filename", authenticate, requireAdmin, async (req, res) => {
  try {
    const filename = String(req.params.filename);
    const fullPath = path.resolve(path.join(uploadDir, filename));

    // Prevent path traversal
    if (!fullPath.startsWith(uploadDir)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const thumbPath = path.join(uploadDir, filename.replace(".webp", "-thumb.webp"));

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
