import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { TestSession } from "@/app/shared/types/test/test-type";

const testSession: TestSession = {
  user: {
    id: "user-123",
    name: "Test Admin",
    email: "admin@example.com",
    image:
      "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123.webp",
  },
};

const getSessionSpy = mock(
  async (): Promise<TestSession | null> => testSession,
);

const updateUserSpy = mock(
  async (_input: {
    body: {
      name: string;
      image?: string | null;
    };
    headers: Headers;
  }) => ({
    status: true,
  }),
);

const uploadAvatarSpy = mock(async (_file: File, _userId: string) => ({
  url: "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123-new.webp",
  publicId: "avatars/user-123",
}));

const deleteAvatarSpy = mock(async (_userId: string) => undefined);

const revalidatePathSpy = mock((_path: string) => undefined);

const requestHeaders = new Headers({
  cookie: "better-auth.session_token=test-session",
});

mock.module("next/headers", () => ({
  headers: mock(async () => requestHeaders),
}));

mock.module("next/cache", () => ({
  revalidatePath: revalidatePathSpy,
}));

mock.module("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: getSessionSpy,
      updateUser: updateUserSpy,
    },
  },
}));

mock.module("@/lib/cloudinary/upload-avatar", () => ({
  uploadAvatar: uploadAvatarSpy,
  deleteAvatar: deleteAvatarSpy,
}));

const { updateProfileAction } = await import(
  "@/app/features/profile/update-profile"
);

describe("updateProfileAction", () => {
  beforeEach(() => {
    getSessionSpy.mockClear();
    updateUserSpy.mockClear();
    uploadAvatarSpy.mockClear();
    deleteAvatarSpy.mockClear();
    revalidatePathSpy.mockClear();
  });

  it("should update profile with a new avatar", async () => {
    const file = new File(["avatar-content"], "avatar.webp", {
      type: "image/webp",
    });

    const formData = new FormData();

    formData.append("name", "Test Admin");
    formData.append("email", "admin@example.com");
    formData.append("image", file);

    const result = await updateProfileAction(formData);

    expect(uploadAvatarSpy).toHaveBeenCalledTimes(1);
    expect(uploadAvatarSpy).toHaveBeenCalledWith(file, "user-123");

    expect(deleteAvatarSpy).not.toHaveBeenCalled();

    expect(updateUserSpy).toHaveBeenCalledWith({
      body: {
        name: "Test Admin",
        image:
          "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123-new.webp",
      },
      headers: requestHeaders,
    });

    expect(revalidatePathSpy).toHaveBeenCalledWith("/admin/profile");

    expect(result).toEqual({
      success: true,
      image:
        "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123-new.webp",
      name: "Test Admin",
      email: "admin@example.com",
    });
  });

  it("should remove the existing avatar", async () => {
    const formData = new FormData();

    formData.append("name", "Test Admin");
    formData.append("email", "admin@example.com");
    formData.append("removeImage", "true");

    const result = await updateProfileAction(formData);

    expect(deleteAvatarSpy).toHaveBeenCalledTimes(1);
    expect(deleteAvatarSpy).toHaveBeenCalledWith("user-123");

    expect(uploadAvatarSpy).not.toHaveBeenCalled();

    expect(updateUserSpy).toHaveBeenCalledWith({
      body: {
        name: "Test Admin",
        image: null,
      },
      headers: requestHeaders,
    });

    expect(result.image).toBeNull();
  });

  it("should preserve the current avatar when no image change is requested", async () => {
    const formData = new FormData();

    formData.append("name", "Test Admin Updated");
    formData.append("email", "admin@example.com");

    const result = await updateProfileAction(formData);

    expect(uploadAvatarSpy).not.toHaveBeenCalled();
    expect(deleteAvatarSpy).not.toHaveBeenCalled();

    expect(updateUserSpy).toHaveBeenCalledWith({
      body: {
        name: "Test Admin Updated",
      },
      headers: requestHeaders,
    });

    expect(result.image).toBe(
      "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123.webp",
    );
  });

  it("should reject an unsupported image format", async () => {
    const file = new File(["fake-gif"], "avatar.gif", {
      type: "image/gif",
    });

    const formData = new FormData();

    formData.append("name", "Test Admin Updated");
    formData.append("email", "admin@example.com");
    formData.append("image", file);

    await expect(updateProfileAction(formData)).rejects.toThrow(
      "Invalid image format. Use PNG, JPEG, or WEBP.",
    );

    expect(uploadAvatarSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });

  it("should reject an image larger than 5 MB", async () => {
    const oversizedImage = new Uint8Array(5 * 1024 * 1024 + 1);

    const file = new File([oversizedImage], "avatar.webp", {
      type: "image/webp",
    });

    const formData = new FormData();

    formData.append("name", "Test Admin Updated");
    formData.append("email", "admin@example.com");
    formData.append("image", file);

    await expect(updateProfileAction(formData)).rejects.toThrow(
      "Image exceeds the maximum size of 5 MB.",
    );

    expect(uploadAvatarSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });

  it("should reject unauthenticated requests", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const formData = new FormData();

    formData.append("name", "Test Admin Updated");
    formData.append("email", "admin@example.com");

    await expect(updateProfileAction(formData)).rejects.toThrow(
      "Not authenticated",
    );

    expect(uploadAvatarSpy).not.toHaveBeenCalled();
    expect(deleteAvatarSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(revalidatePathSpy).not.toHaveBeenCalled();
  });
});
