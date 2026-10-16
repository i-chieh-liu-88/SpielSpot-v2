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
    { _id: id, ownerId: "owner" }, expect.objectContaining({ $set: expect.objectContaining({ imagePublicId: "new" }) }), expect.any(Object));
  expect(storage.removePhoto).toHaveBeenCalledWith("previous");
});
test("a provider failure does not change the database", async () => {
  storage.uploadPhoto.mockRejectedValue(new Error("provider failed"));
  await send().expect(502);
  expect(Playground.findOneAndUpdate).not.toHaveBeenCalled();
});
test("cleans a new cloud asset if the database save fails", async () => {
  Playground.findOneAndUpdate.mockRejectedValue(new Error("database failed"));
  await send().expect(500);
  expect(storage.removePhoto).toHaveBeenCalledWith("new");
});
test("reports unavailable storage without uploading", async () => {
  storage.photoStorageReady.mockReturnValue(false);
  await send().expect(503);
  expect(storage.uploadPhoto).not.toHaveBeenCalled();
});
