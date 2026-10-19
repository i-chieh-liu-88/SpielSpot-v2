import { jest } from "@jest/globals";
const destroy = jest.fn();
jest.unstable_mockModule("cloudinary", () => ({ v2: { config: jest.fn(), uploader: { destroy } } }));
const { removePhoto } = await import("./photoStorage.js");
test.each(["ok", "not found"])("accepts confirmed removal: %s", async result => {
  destroy.mockResolvedValue({ result });
  await expect(removePhoto("asset")).resolves.toBeUndefined();
});
test("retries unexpected Cloudinary results instead of losing the cleanup job", async () => {
  destroy.mockResolvedValue({ result: "error" });
  await expect(removePhoto("asset")).rejects.toThrow("not confirmed");
});
