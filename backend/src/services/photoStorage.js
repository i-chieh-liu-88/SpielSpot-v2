import { v2 as cloudinary } from "cloudinary";

export function photoStorageReady() {
  return ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
    .every((key) => Boolean(process.env[key]?.trim()));
}

export function uploadPhoto(buffer, publicId) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...(publicId ? { public_id: publicId, overwrite: false } : { folder: "spielspot/playgrounds" }), resource_type: "image", timeout: 60000 },
      (error, result) => error ? reject(error) : resolve(result),
    );
    stream.end(buffer);
  });
}

export async function removePhoto(publicId) {
  if (!publicId) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const result = await cloudinary.uploader.destroy(publicId, { invalidate: true, timeout: 60000 });
  if (!["ok", "not found"].includes(result?.result)) throw new Error("Photo removal not confirmed");
}
