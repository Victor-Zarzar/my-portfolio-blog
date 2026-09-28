"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { deleteAvatar, uploadAvatar } from "@/lib/cloudinary/upload-avatar";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.email("Invalid email address."),
});

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function updateProfileAction(formData: FormData) {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const parsed = profileSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  const file = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";

  let imageUrl: string | null | undefined;

  if (file && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Invalid image format. Use PNG, JPEG, or WEBP.");
    }

    if (file.size > MAX_SIZE) {
      throw new Error("Image exceeds the maximum size of 5 MB.");
    }

    const uploaded = await uploadAvatar(file, session.user.id);

    imageUrl = uploaded.url;
  } else if (removeImage && session.user.image) {
    await deleteAvatar(session.user.id);

    imageUrl = null;
  }

  await auth.api.updateUser({
    body: {
      name: parsed.name,
      ...(imageUrl !== undefined ? { image: imageUrl } : {}),
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/profile");

  return {
    success: true,
    image: imageUrl !== undefined ? imageUrl : (session.user.image ?? null),
    name: parsed.name,
    email: session.user.email,
  };
}
