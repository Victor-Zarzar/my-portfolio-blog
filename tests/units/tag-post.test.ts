import { beforeEach, describe, expect, it, mock } from "bun:test";

type TagMock = {
  id: number;
  name: string;
  slug: string;
};

const revalidatePathSpy = mock(() => {
  null;
});
const eqSpy = mock((field: unknown, value: unknown) => ({ field, value }));

const findFirstSpy = mock<() => Promise<TagMock | null>>(async () => null);
const valuesSpy = mock(async () => {
  null;
});
const whereDeleteSpy = mock(async () => {
  null;
});

const insertSpy = mock(() => ({
  values: valuesSpy,
}));

const deleteSpy = mock(() => ({
  where: whereDeleteSpy,
}));

mock.module("next/cache", () => ({
  revalidatePath: revalidatePathSpy,
}));

mock.module("drizzle-orm", () => ({
  eq: eqSpy,
}));

mock.module("@/lib/db/schemas/schema", () => ({
  tags: {
    slug: "tags.slug",
  },
}));

mock.module("@/lib/db", () => ({
  db: {
    query: {
      tags: {
        findFirst: findFirstSpy,
      },
    },
    insert: insertSpy,
    delete: deleteSpy,
  },
}));

const { createTag, deleteTag } = await import(
  "@/app/features/tags-columns/tag-actions"
);

describe("tag actions", () => {
  beforeEach(() => {
    revalidatePathSpy.mockClear();
    eqSpy.mockClear();
    findFirstSpy.mockClear();
    valuesSpy.mockClear();
    insertSpy.mockClear();
    deleteSpy.mockClear();
    whereDeleteSpy.mockClear();

    findFirstSpy.mockImplementation(async () => null);
    valuesSpy.mockImplementation(async () => {
      null;
    });
    whereDeleteSpy.mockImplementation(async () => {
      null;
    });
  });

  describe("createTag", () => {
    it("should create tag using normalized lowercase slug", async () => {
      const result = await createTag({
        name: "React",
        slug: "react",
      });

      expect(result).toEqual({
        success: true,
        data: undefined,
      });

      expect(findFirstSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledTimes(1);

      expect(valuesSpy).toHaveBeenCalledWith({
        name: "React",
        slug: "react",
      });

      expect(revalidatePathSpy).toHaveBeenCalledTimes(3);
      expect(revalidatePathSpy).toHaveBeenCalledWith(
        "/[locale]/(admin)/admin/tags",
        "page",
      );
      expect(revalidatePathSpy).toHaveBeenCalledWith(
        "/[locale]/(admin)/admin/posts",
        "page",
      );
      expect(revalidatePathSpy).toHaveBeenCalledWith(
        "/[locale]/(pages)/blog",
        "page",
      );
    });

    it("should not create tag when slug already exists", async () => {
      findFirstSpy.mockImplementation(async () => ({
        id: 1,
        name: "React",
        slug: "react",
      }));

      const result = await createTag({
        name: "React",
        slug: "react",
      });

      expect(result).toEqual({
        success: false,
        error: "Slug already exists",
      });

      expect(insertSpy).not.toHaveBeenCalled();
      expect(valuesSpy).not.toHaveBeenCalled();
      expect(revalidatePathSpy).not.toHaveBeenCalled();
    });

    it("should return validation error when payload is invalid", async () => {
      const result = await createTag({
        name: "",
        slug: "React JS",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBeTruthy();
      }

      expect(findFirstSpy).not.toHaveBeenCalled();
      expect(insertSpy).not.toHaveBeenCalled();
      expect(revalidatePathSpy).not.toHaveBeenCalled();
    });

    it("should return error when database insert fails", async () => {
      valuesSpy.mockImplementation(async () => {
        throw new Error("Database error");
      });

      const result = await createTag({
        name: "React",
        slug: "react",
      });

      expect(result).toEqual({
        success: false,
        error: "Database error",
      });

      expect(revalidatePathSpy).not.toHaveBeenCalled();
    });
  });

  describe("deleteTag", () => {
    it("should delete tag by slug", async () => {
      const result = await deleteTag("react");

      expect(result).toEqual({
        success: true,
        data: undefined,
      });

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(eqSpy).toHaveBeenCalledWith("tags.slug", "react");
      expect(whereDeleteSpy).toHaveBeenCalledTimes(1);

      expect(revalidatePathSpy).toHaveBeenCalledTimes(3);
    });

    it("should return error when database delete fails", async () => {
      whereDeleteSpy.mockImplementation(async () => {
        throw new Error("Failed delete");
      });

      const result = await deleteTag("react");

      expect(result).toEqual({
        success: false,
        error: "Failed delete",
      });

      expect(revalidatePathSpy).not.toHaveBeenCalled();
    });
  });
});
