import { beforeEach, describe, expect, it, mock } from "bun:test";

const uploadSpy = mock(async (_file: string, _options: unknown) => ({
  secure_url:
    "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123.webp",
  public_id: "avatars/user-123",
}));

const destroySpy = mock(async (_publicId: string, _options: unknown) => ({
  result: "ok",
}));

mock.module("@/lib/cloudinary/client", () => ({
  cloudinary: {
    uploader: {
      upload: uploadSpy,
      destroy: destroySpy,
    },
  },
}));

const { uploadAvatar, deleteAvatar } = await import(
  "@/lib/cloudinary/upload-avatar"
);

describe("avatar upload", () => {
  beforeEach(() => {
    uploadSpy.mockClear();
    destroySpy.mockClear();
  });

  describe("uploadAvatar", () => {
    it("should upload avatar to Cloudinary with the expected configuration", async () => {
      const userId = "user-123";

      const file = new File(["fake-image-content"], "avatar.webp", {
        type: "image/webp",
      });

      const result = await uploadAvatar(file, userId);

      expect(uploadSpy).toHaveBeenCalledTimes(1);

      expect(uploadSpy).toHaveBeenCalledWith(
        expect.stringContaining("data:image/webp;base64,"),
        {
          folder: "avatars",
          public_id: userId,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
          transformation: [
            {
              width: 400,
              height: 400,
              crop: "fill",
              gravity: "face",
            },
          ],
        },
      );

      expect(result).toEqual({
        url: "https://res.cloudinary.com/victorzarzar/image/upload/avatars/user-123.webp",
        publicId: "avatars/user-123",
      });
    });

    it("should convert the uploaded file to the expected base64 data URI", async () => {
      const content = "avatar-binary-content";

      const file = new File([content], "avatar.png", {
        type: "image/png",
      });

      await uploadAvatar(file, "user-456");

      const expectedBase64 = Buffer.from(content).toString("base64");

      expect(uploadSpy).toHaveBeenCalledWith(
        `data:image/png;base64,${expectedBase64}`,
        expect.anything(),
      );
    });

    it("should use the user id as the Cloudinary public id", async () => {
      const file = new File(["image-content"], "avatar.jpeg", {
        type: "image/jpeg",
      });

      await uploadAvatar(file, "user-789");

      expect(uploadSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          folder: "avatars",
          public_id: "user-789",
        }),
      );
    });
  });

  describe("deleteAvatar", () => {
    it("should delete the avatar from Cloudinary using the user id", async () => {
      await deleteAvatar("user-123");

      expect(destroySpy).toHaveBeenCalledTimes(1);

      expect(destroySpy).toHaveBeenCalledWith("avatars/user-123", {
        invalidate: true,
      });
    });
  });
});
