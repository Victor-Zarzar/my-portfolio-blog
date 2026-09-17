"use server";

import { cloudinary } from "./client";

export async function uploadAvatar(file: File, userId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "avatars",
    public_id: userId,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteAvatar(publicId: string) {
  await cloudinary.uploader.destroy(publicId).catch(() => {});
}
