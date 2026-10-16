import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import multer from "multer";
import sharp from "sharp";
import Playground from "../models/Playground.js";
import { photoStorageReady, uploadPhoto, removePhoto } from "../services/photoStorage.js";

const receivePhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported photo format"));
  },
}).single("photo");

// Check ownership before accepting a file into memory or contacting Cloudinary.
export async function authorizePhoto(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid playground id" });
    const playground = await Playground.findById(req.params.id);
    if (!playground) return res.status(404).json({ success: false, error: "Playground not found" });
    if (playground.ownerId !== getAuth(req).userId)
      return res.status(403).json({ success: false, error: "Not allowed to upload a photo for this playground" });
    if (!photoStorageReady())
      return res.status(503).json({ success: false, error: "Photo uploads are temporarily unavailable" });
    next();
  } catch (error) { next(error); }
}

export function acceptPhoto(req, res, next) {
  receivePhoto(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, error:
      error.code === "LIMIT_FILE_SIZE" ? "The playground photo must be 5 MB or smaller."
        : "Choose one JPEG, PNG, or WebP image, 5 MB or smaller." });
    next();
  });
}

export async function savePhoto(req, res, next) {
  if (!req.file) return res.status(400).json({ success: false, error: "Choose a photo to upload" });
  let buffer;
  try {
    // Decode actual image bytes, bound pixel allocation, remove metadata and resize.
    const image = sharp(req.file.buffer, { limitInputPixels: 25000000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1)
      throw new Error("Unsupported image");
    buffer = await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer();
  } catch {
    return res.status(400).json({ success: false, error: "Choose a valid, non-animated JPEG, PNG, or WebP photo up to 25 megapixels." });
  }
  let uploaded;
  try { uploaded = await uploadPhoto(buffer); }
  catch (error) {
    // Log only a fixed category and status; provider messages can contain credentials.
    const message = String(error?.message ?? "");
    const category = /signature/i.test(message) ? "signature_rejected"
      : /api.?key/i.test(message) ? "api_key_rejected"
      : /cloud.?name/i.test(message) ? "cloud_name_rejected"
      : /timeout|timed out/i.test(message) ? "provider_timeout" : "provider_error";
    console.warn("Playground photo provider failure", {
      category, status: Number(error?.http_code) || 0,
    });
    return res.status(502).json({ success: false, error: "Could not upload the photo. Please try again." });
  }
  try {
    // Atomic replacement returns the previous image, including during concurrent uploads.
    const previous = await Playground.findOneAndUpdate(
      { _id: req.params.id, ownerId: getAuth(req).userId },
      { $set: { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id } },
      { returnDocument: "before", runValidators: true, select: "+imagePublicId" },
    );
    if (!previous) {
      await removePhoto(uploaded.public_id);
      return res.status(409).json({ success: false, error: "Playground changed. Reload before trying again." });
    }
    // A cleanup failure must not turn an already saved photo into a failed save.
    await removePhoto(previous.imagePublicId).catch(() => console.warn("Previous playground photo cleanup failed"));
    res.json({ success: true, data: { imageUrl: uploaded.secure_url } });
  } catch (error) {
    await removePhoto(uploaded.public_id).catch(() => console.warn("Unused playground photo cleanup failed"));
    next(error);
  }
}
