"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { deleteAvatar, uploadAvatar } from "@/lib/cloudinary/upload-avatar";
import { db } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.email("E-mail inválido."),
});

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function updateProfileAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Não autenticado");
  }

  const parsed = profileSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  const file = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";

  const [currentUser] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, session.user.id));

  let imageUrl: string | null | undefined;

  if (file && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Formato de imagem inválido. Use PNG, JPEG ou WEBP.");
    }
    if (file.size > MAX_SIZE) {
      throw new Error("Imagem excede o tamanho máximo de 5MB.");
    }

    const uploaded = await uploadAvatar(file, session.user.id);
    imageUrl = uploaded.url;
  } else if (removeImage && currentUser?.image) {
    await deleteAvatar(session.user.id);
    imageUrl = null;
  }

  try {
    await db
      .update(user)
      .set({
        name: parsed.name,
        email: parsed.email,
        ...(imageUrl !== undefined ? { image: imageUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "23505"
    ) {
      throw new Error("Este e-mail já está em uso.");
    }
    throw err;
  }

  revalidatePath("/admin/profile");
}
