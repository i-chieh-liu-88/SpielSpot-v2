import { jest } from "@jest/globals";
jest.unstable_mockModule("../models/PhotoCleanup.js", () => ({ default: {
  insertMany: jest.fn(), deleteMany: jest.fn(), updateOne: jest.fn(),
  findOneAndUpdate: jest.fn(), deleteOne: jest.fn(),
} }));
jest.unstable_mockModule("../models/Playground.js", () => ({ default: { exists: jest.fn() } }));
jest.unstable_mockModule("./photoStorage.js", () => ({ removePhoto: jest.fn() }));
const { default: Jobs } = await import("../models/PhotoCleanup.js");
const { default: Playground } = await import("../models/Playground.js");
const { removePhoto } = await import("./photoStorage.js");
const { reservePhotoUploads, adoptPhotoUploads, queuePhotoCleanup, processPhotoCleanup } = await import("./photoCleanup.js");
beforeEach(() => {
  jest.resetAllMocks();
  Jobs.findOneAndUpdate.mockResolvedValue(null);
  Jobs.deleteOne.mockResolvedValue({ deletedCount: 1 });
  Playground.exists.mockResolvedValue(null);
});
// Upload IDs are durable before any external upload, even if the response is lost.
test("reserves unique upload IDs and a recovery deadline", async () => {
  const ids = await reservePhotoUploads(2);
  expect(new Set(ids).size).toBe(2);
  expect(Jobs.insertMany).toHaveBeenCalledWith(ids.map(_id => ({ _id, dueAt: expect.any(Date) })));
  expect(Jobs.insertMany.mock.calls[0][0][0].dueAt.getTime()).toBeGreaterThan(Date.now());
});
test("rejects adoption after a worker claimed or expired an upload", async () => {
  Jobs.deleteMany.mockResolvedValue({ deletedCount: 0 });
  await expect(adoptPhotoUploads(["asset"])).rejects.toThrow("expired");
  expect(Jobs.deleteMany).toHaveBeenCalledWith(expect.objectContaining({ attempts: 0 }));
});
test("deduplicates cleanup jobs", async () => {
  await queuePhotoCleanup(["old", "old", undefined]);
  expect(Jobs.updateOne).toHaveBeenCalledTimes(1);
});
// A failed Cloudinary call must leave the job in MongoDB for a later attempt.
test("retains failed cleanup and removes the job after a successful retry", async () => {
  Jobs.findOneAndUpdate.mockResolvedValueOnce({ _id: "old", attempts: 1 });
  removePhoto.mockRejectedValueOnce(new Error("offline"));
  await processPhotoCleanup();
  expect(Jobs.deleteOne).not.toHaveBeenCalled();
  Jobs.findOneAndUpdate.mockResolvedValueOnce({ _id: "old", attempts: 1 });
  removePhoto.mockResolvedValueOnce(undefined);
  await processPhotoCleanup();
  expect(Jobs.deleteOne).toHaveBeenCalledWith({ _id: "old", attempts: 1 });
});
test("does not delete a referenced photo after an ambiguous save response", async () => {
  Jobs.findOneAndUpdate.mockResolvedValueOnce({ _id: "saved", attempts: 1 });
  Playground.exists.mockResolvedValue({ _id: "park" });
  await processPhotoCleanup();
  expect(removePhoto).not.toHaveBeenCalled();
  expect(Jobs.deleteOne).not.toHaveBeenCalled();
});
test("database lookup failure keeps the job and prevents cloud deletion", async () => {
  Jobs.findOneAndUpdate.mockResolvedValueOnce({ _id: "asset", attempts: 1 });
  Playground.exists.mockRejectedValue(new Error("database offline"));
  await processPhotoCleanup();
  expect(removePhoto).not.toHaveBeenCalled();
  expect(Jobs.deleteOne).not.toHaveBeenCalled();
});
