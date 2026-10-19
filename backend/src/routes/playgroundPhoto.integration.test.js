import { jest } from "@jest/globals";
import request from "supertest";
import sharp from "sharp";

jest.unstable_mockModule("../models/Playground.js", () => ({ default: {
  findById: jest.fn(), findOneAndUpdate: jest.fn(),
} }));
jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: () => (_req, _res, next) => next(), getAuth: jest.fn(),
}));
jest.unstable_mockModule("../services/photoStorage.js", () => ({
  photoStorageReady: jest.fn(), uploadPhoto: jest.fn(), removePhoto: jest.fn(),
}));
jest.unstable_mockModule("../services/relationshipTransaction.js", () => ({
  runRelationshipTransaction: work => work(), lockPlayground: jest.fn(),
  relationshipError: (status, message) => Object.assign(new Error(message), { status, relationship: true }),
}));
jest.unstable_mockModule("../services/photoCleanup.js", () => ({
  reservePhotoUploads: jest.fn(), adoptPhotoUploads: jest.fn(), queuePhotoCleanup: jest.fn(),
}));
const cleanup = await import("../services/photoCleanup.js");
const { default: app } = await import("../app.js");
const { default: Playground } = await import("../models/Playground.js");
const { getAuth } = await import("@clerk/express");
const storage = await import("../services/photoStorage.js");
const id = "6ad09035c37360ec41240320";
const image = await sharp({ create: { width: 10, height: 10, channels: 3, background: "green" } }).png().toBuffer();
const send = (data = image, filename = "park.png", contentType = "image/png") =>
  request(app).post(`/api/playgrounds/${id}/photo`).attach("photo", data, { filename, contentType });
beforeEach(() => {
  jest.resetAllMocks();
  getAuth.mockReturnValue({ userId: "owner" });
  cleanup.reservePhotoUploads.mockImplementation(async count => Array.from({ length: count }, (_, i) => `reserved-${i}`));
  Playground.findById.mockResolvedValue({ ownerId: "owner" });
  Playground.findOneAndUpdate.mockResolvedValue({ imagePublicId: "previous" });
  storage.photoStorageReady.mockReturnValue(true);
  storage.uploadPhoto.mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/park.webp", public_id: "new" });
  storage.removePhoto.mockResolvedValue({});
});
test("requires login before receiving a photo", async () => {
  getAuth.mockReturnValue({ userId: null });
  await send().expect(401);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("rejects a non-owner without uploading", async () => {
  Playground.findById.mockResolvedValue({ ownerId: "someone-else" });
  await send().expect(403);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("rejects missing files and invalid image bytes", async () => {
  await request(app).post(`/api/playgrounds/${id}/photo`).expect(400);
  await send(Buffer.from("not an image")).expect(400);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("rejects unsupported types and files over 5 MB", async () => {
  await send(Buffer.from("<svg/>"), "park.svg", "image/svg+xml").expect(400);
  await send(Buffer.alloc(5 * 1024 * 1024 + 1)).expect(400);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("decodes and converts a photo, saves its URL and cleans the replaced photo", async () => {
  const response = await send().expect(200);
  expect(response.body.data.imageUrl).toContain("park.webp");
  const metadata = await sharp(storage.uploadPhoto.mock.calls[0][0]).metadata();
  expect(metadata.format).toBe("webp");
  expect(Playground.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ _id: id, ownerId: "owner" }), expect.objectContaining({ $set: expect.objectContaining({ imagePublicId: "new" }) }), expect.any(Object));
  expect(cleanup.queuePhotoCleanup).toHaveBeenCalledWith(["previous"]);
});
test("a provider failure does not change the database", async () => {
  storage.uploadPhoto.mockRejectedValue(new Error("provider failed"));
  await send().expect(502);
  expect(Playground.findOneAndUpdate).not.toHaveBeenCalled();
});
test("retains reserved assets for safe deferred cleanup if the database save fails", async () => {
  Playground.findOneAndUpdate.mockRejectedValue(new Error("database failed"));
  await send().expect(500);
  expect(cleanup.reservePhotoUploads).toHaveBeenCalled();
  expect(storage.removePhoto).not.toHaveBeenCalled();
});
test("reports unavailable storage without uploading", async () => {
  storage.photoStorageReady.mockReturnValue(false);
  await send().expect(503);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});

// 整批驗證：後面的圖片無效時，前面的有效圖片也不應上傳。
test("validates every image before uploading any part of an album", async () => {
  await request(app).post(`/api/playgrounds/${id}/photos`)
    .attach("photos", image, "one.png").attach("photos", Buffer.from("invalid"), "two.png").expect(400);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("accepts five photos in order and preserves the first as cover", async () => {
  const req = request(app).post(`/api/playgrounds/${id}/photos`);
  for (let i = 0; i < 5; i++) {
    storage.uploadPhoto.mockResolvedValueOnce({ secure_url: `https://example.com/${i}.webp`, public_id: `new-${i}` });
    req.attach("photos", image, `${i}.png`);
  }
  const response = await req.expect(200);
  expect(response.body.data.imageUrls).toHaveLength(5);
  expect(response.body.data.imageUrl).toBe("https://example.com/0.webp");
  expect(Playground.findOneAndUpdate.mock.calls[0][1].$inc).toEqual({ photoRevision: 1 });
});
test("rejects a sixth photo before cloud uploads", async () => {
  const req = request(app).post(`/api/playgrounds/${id}/photos`);
  for (let i = 0; i < 6; i++) req.attach("photos", image, `${i}.png`);
  await req.expect(400);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
// 第二張上傳失敗時，清理第一張，且不更新現有相簿。
test("reserves partial uploads for recovery and leaves the old album unchanged on provider failure", async () => {
  storage.uploadPhoto.mockResolvedValueOnce({ secure_url: "https://example.com/one.webp", public_id: "partial" })
    .mockRejectedValueOnce(new Error("provider failed"));
  await request(app).post(`/api/playgrounds/${id}/photos`)
    .attach("photos", image, "one.png").attach("photos", image, "two.png").expect(502);
  expect(cleanup.reservePhotoUploads).toHaveBeenCalledWith(2);
  expect(Playground.findOneAndUpdate).not.toHaveBeenCalled();
});
test("rejects a stale upload and retains recovery reservations instead of overwriting a newer album", async () => {
  Playground.findById.mockResolvedValue({ ownerId: "owner", photoRevision: 3 });
  Playground.findOneAndUpdate.mockResolvedValue(null);
  await request(app).post(`/api/playgrounds/${id}/photos`).attach("photos", image, "one.png").expect(409);
  expect(Playground.findOneAndUpdate.mock.calls[0][0].photoRevision).toBe(3);
  expect(cleanup.reservePhotoUploads).toHaveBeenCalled();
  expect(storage.removePhoto).not.toHaveBeenCalled();
});


test("does not upload if the durable recovery reservation cannot be saved", async () => {
  cleanup.reservePhotoUploads.mockRejectedValue(new Error("database unavailable"));
  await send().expect(500);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
test("does not save an album after its upload reservation expires", async () => {
  cleanup.adoptPhotoUploads.mockRejectedValue(new Error("reservation expired"));
  await send().expect(500);
  expect(Playground.findOneAndUpdate).not.toHaveBeenCalled();
  expect(storage.removePhoto).not.toHaveBeenCalled();
});
test("fails the transaction when old-photo cleanup cannot be queued", async () => {
  cleanup.queuePhotoCleanup.mockRejectedValue(new Error("outbox unavailable"));
  await send().expect(500);
  expect(storage.removePhoto).not.toHaveBeenCalled();
});
