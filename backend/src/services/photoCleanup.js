import { randomUUID } from "node:crypto";
import PhotoCleanup from "../models/PhotoCleanup.js";
import Playground from "../models/Playground.js";
import { removePhoto } from "./photoStorage.js";

export async function reservePhotoUploads(count) {
  const ids = Array.from({ length: count }, () => `spielspot/playgrounds/${randomUUID()}`);
  // Persist IDs BEFORE contacting Cloudinary, including uploads whose response is lost.
  await PhotoCleanup.insertMany(ids.map(_id => ({ _id, dueAt: new Date(Date.now() + 30 * 60_000) })));
  return ids;
}

export async function adoptPhotoUploads(ids) {
  // Called in the album transaction. An expired/claimed reservation cannot be saved.
  const result = await PhotoCleanup.deleteMany({ _id: { $in: ids }, dueAt: { $gt: new Date() }, attempts: 0 });
  if (result.deletedCount !== ids.length) throw new Error("Photo upload reservation expired");
}

export async function queuePhotoCleanup(ids) {
  for (const _id of new Set(ids.filter(Boolean))) {
    await PhotoCleanup.updateOne({ _id }, { $setOnInsert: { dueAt: new Date() } }, { upsert: true });
  }
}

export async function processPhotoCleanup(limit = 10) {
  for (let i = 0; i < limit; i++) {
    // The lease lets multiple server instances retry safely without a tight loop.
    const job = await PhotoCleanup.findOneAndUpdate(
      { dueAt: { $lte: new Date() } },
      { $set: { dueAt: new Date(Date.now() + 5 * 60_000) }, $inc: { attempts: 1 } },
      { returnDocument: "after", sort: { dueAt: 1 } },
    );
    if (!job) break;
    try {
      // Never delete an asset still referenced by a saved playground.
      if (await Playground.exists({ $or: [{ imagePublicId: job._id }, { imagePublicIds: job._id }] })) {
        // Keep the job: a concurrent listing deletion may still need this intent.
        continue;
      }
      await removePhoto(job._id);
      await PhotoCleanup.deleteOne({ _id: job._id, attempts: job.attempts });
    } catch {
      // Keep the persisted job. No provider messages or credentials in logs.
      console.warn("Photo cleanup pending retry");
    }
  }
}

export function startPhotoCleanupWorker() {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await processPhotoCleanup(); }
    catch { console.warn("Photo cleanup queue unavailable"); }
    finally { running = false; }
  };
  void tick();
  const timer = setInterval(tick, 60_000);
  timer.unref();
  return () => clearInterval(timer);
}
