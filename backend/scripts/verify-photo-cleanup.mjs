// Opt-in integration test. Uses only a fresh database and generated test images.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import Playground from "../src/models/Playground.js";
import PhotoCleanup from "../src/models/PhotoCleanup.js";
import { reservePhotoUploads, adoptPhotoUploads, queuePhotoCleanup, processPhotoCleanup } from "../src/services/photoCleanup.js";
import { runRelationshipTransaction } from "../src/services/relationshipTransaction.js";
import { uploadPhoto, removePhoto } from "../src/services/photoStorage.js";
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
if (process.env.ALLOW_TEMP_PHOTO_TEST !== "true") throw new Error("Temporary photo test opt-in required");
const dbName = "sp_photo_test_" + randomUUID().replaceAll("-", "").slice(0, 16);
const ids = [];
let connected = false;
try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName, serverSelectionTimeoutMS: 20000 });
  connected = true;
  await Playground.createCollection();
  await PhotoCleanup.init();
  const parent = await Playground.create({ name: "Isolated photo test", location: "Test only", latitude: 0, longitude: 0, ownerId: "test-owner" });
  const buffer = await sharp({ create: { width: 32, height: 32, channels: 3, background: "green" } }).webp().toBuffer();
  for (let index = 0; index < 2; index++) {
    const reserved = await reservePhotoUploads(1);
    ids.push(...reserved);
    const asset = await uploadPhoto(buffer, reserved[0]);
    assert.equal(asset.public_id, reserved[0]);
    await runRelationshipTransaction(async () => {
      await adoptPhotoUploads(reserved);
      const previous = await Playground.findOneAndUpdate({ _id: parent._id }, { $set: {
        imagePublicId: asset.public_id, imageUrl: asset.secure_url,
        imagePublicIds: [asset.public_id], imageUrls: [asset.secure_url],
      } }, { returnDocument: "before", select: "+imagePublicId +imagePublicIds" });
      await queuePhotoCleanup(previous.imagePublicIds);
    });
  }
  assert.equal(await PhotoCleanup.countDocuments(), 1);
  // Queue write and parent delete must roll back together.
  await assert.rejects(runRelationshipTransaction(async () => {
    await queuePhotoCleanup([ids[1]]);
    await Playground.deleteOne({ _id: parent._id });
    throw new Error("intentional rollback");
  }));
  assert.ok(await Playground.exists({ _id: parent._id }));
  assert.equal(await PhotoCleanup.countDocuments(), 1);
  await processPhotoCleanup();
  await assert.rejects(cloudinary.api.resource(ids[0]), error => (error.http_code ?? error.error?.http_code) === 404);
  assert.equal((await cloudinary.api.resource(ids[1])).public_id, ids[1]);
  console.log("Replacement cleanup and transaction rollback: passed");
  await runRelationshipTransaction(async () => {
    await queuePhotoCleanup([ids[1]]);
    await Playground.deleteOne({ _id: parent._id });
  });
  await processPhotoCleanup();
  await assert.rejects(cloudinary.api.resource(ids[1]), error => (error.http_code ?? error.error?.http_code) === 404);
  assert.equal(await PhotoCleanup.countDocuments(), 0);
  console.log("Deletion cleanup: passed; generated cloud assets removed");
} catch (error) {
  console.error("Photo integration failed:", error.name, error.code ?? error.http_code ?? "");
  if (error.name === "AssertionError") console.error(error.message, error.stack.split("\n").find(line => line.includes("verify-photo-cleanup")));
  process.exitCode = 1;
} finally {
  const cleanup = await Promise.allSettled(ids.map(id => removePhoto(id)));
  if (cleanup.some(result => result.status === "rejected")) {
    console.error("Test cloud cleanup incomplete; retain isolated database for recovery");
    process.exitCode = 1;
  } else if (connected) {
    assert.equal(mongoose.connection.name, dbName);
    assert.match(dbName, /^sp_photo_test_[a-f0-9]{16}$/);
    await mongoose.connection.dropDatabase();
    console.log("Isolated temporary database removed");
  }
  await mongoose.disconnect();
}


