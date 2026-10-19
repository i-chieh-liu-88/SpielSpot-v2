import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import multer from "multer";
import sharp from "sharp";
import Playground from "../models/Playground.js";
import { photoStorageReady, uploadPhoto } from "../services/photoStorage.js";
import { reservePhotoUploads, adoptPhotoUploads, queuePhotoCleanup } from "../services/photoCleanup.js";
import { runRelationshipTransaction, relationshipError } from "../services/relationshipTransaction.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 0, parts: 5 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported photo format"));
  },
});
const receivePhoto = upload.single("photo");
const receivePhotos = upload.array("photos", 5);

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
    req.photoRevision = playground.photoRevision;
    next();
  } catch (error) { next(error); }
}

export function acceptPhoto(req, res, next) {
  acceptFiles(receivePhoto, req, res, next);
}

export function acceptPhotos(req, res, next) {
  acceptFiles(receivePhotos, req, res, next);
}

function acceptFiles(receive, req, res, next) {
  receive(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, error:
      error.code === "LIMIT_FILE_SIZE" ? "The playground photo must be 5 MB or smaller."
        : "Choose up to 5 JPEG, PNG, or WebP images, each 5 MB or smaller." });
    next();
  });
}

export async function savePhoto(req, res, next) {
  const files = req.files ?? (req.file ? [req.file] : []);
  if (!files.length) return res.status(400).json({ success: false, error: "Choose a photo to upload" });
  const buffers = [];
  try {
    // Validate the whole album before uploading anything. Processing is sequential
    // to bound memory when five large photos arrive together.
    for (const file of files) {
    // Decode actual image bytes, bound pixel allocation, remove metadata and resize.
    const image = sharp(file.buffer, { limitInputPixels: 25000000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1)
      throw new Error("Unsupported image");
    buffers.push(await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer());
    }
  } catch {
    return res.status(400).json({ success: false, error: "Choose a valid, non-animated JPEG, PNG, or WebP photo up to 25 megapixels." });
  }
  const uploaded = [];
  let reserved;
  try { reserved = await reservePhotoUploads(buffers.length); }
  catch (error) { return next(error); }
  try {
    for (const [index, buffer] of buffers.entries()) uploaded.push(await uploadPhoto(buffer, reserved[index]));
  }
  catch (error) {
    // Reservations survive provider timeouts and process restarts; the worker retries.
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
    await runRelationshipTransaction(async () => {
    await adoptPhotoUploads(reserved);
    // Atomic replacement returns the previous image, including during concurrent uploads.
    const previous = await Playground.findOneAndUpdate(
      { _id: req.params.id, ownerId: getAuth(req).userId,
        ...(req.photoRevision ? { photoRevision: req.photoRevision }
          : { $or: [{ photoRevision: 0 }, { photoRevision: { $exists: false } }] }) },
      { $set: { imageUrl: uploaded[0].secure_url, imagePublicId: uploaded[0].public_id,
        imageUrls: uploaded.map((asset) => asset.secure_url),
        imagePublicIds: uploaded.map((asset) => asset.public_id) }, $inc: { photoRevision: 1 } },
      { returnDocument: "before", runValidators: true, select: "+imagePublicId +imagePublicIds" },
    );
    if (!previous) {
      throw relationshipError(409, "Playground changed. Reload before trying again.");
    }
    // Save the replacement and its old-asset cleanup jobs in the SAME transaction.
    await queuePhotoCleanup([...(previous.imagePublicIds ?? []), previous.imagePublicId]);
    });
    res.json({ success: true, data: { imageUrl: uploaded[0].secure_url,
      imageUrls: uploaded.map((asset) => asset.secure_url) } });
  } catch (error) {
    // Do not delete on ambiguous commit errors. The worker checks persisted references.
    if (error.relationship) return res.status(error.status).json({ success: false, error: error.message });
    next(error);
  }
}
