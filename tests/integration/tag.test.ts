import { beforeEach, describe, expect, it, mock } from "bun:test";

type TagMock = {
  id: number;
  name: string;
  slug: string;
};

const findFirstMock = mock<() => Promise<TagMock | null>>(async () => null);

const revalidatePathMock = mock(() => null);

const valuesMock = mock(async () => null);
const whereMock = mock(async () => null);

const insertMock = mock(() => ({
  values: valuesMock,
}));

const deleteMock = mock(() => ({
  where: whereMock,
}));

const eqMock = mock((field: unknown, value: unknown) => ({
  field,
  value,
}));

beforeEach(() => {
  mock.restore();

  findFirstMock.mockClear();
  valuesMock.mockClear();
  whereMock.mockClear();
  insertMock.mockClear();
  deleteMock.mockClear();
  eqMock.mockClear();
  revalidatePathMock.mockClear();

  mock.module("next/cache", () => ({
    revalidatePath: revalidatePathMock,
  }));

  mock.module("drizzle-orm", () => ({
    eq: eqMock,
  }));

  mock.module("@/lib/db", () => ({
    db: {
      query: {
        tags: {
          findFirst: findFirstMock,
        },
      },
      insert: insertMock,
      delete: deleteMock,
    },
  }));

  mock.module("@/lib/db/schemas/schema", () => ({
    tags: {
      slug: "tags.slug",
    },
  }));
});

describe("tag actions integration", () => {
  it("creates a tag and revalidates related pages", async () => {
    const { createTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await createTag({
      name: "Clean Architecture",
      slug: "clean-architecture",
    });

    expect(result).toEqual({
      success: true,
      data: undefined,
    });

    expect(findFirstMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledWith({
      name: "Clean Architecture",
      slug: "clean-architecture",
    });

    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(admin)/admin/tags",
      "page",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(admin)/admin/posts",
      "page",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(pages)/blog",
      "page",
    );
  });

  it("does not create a tag when slug already exists", async () => {
    findFirstMock.mockImplementationOnce(async () => ({
      id: 1,
      name: "Clean Architecture",
      slug: "clean-architecture",
    }));

    const { createTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await createTag({
      name: "Clean Architecture",
      slug: "clean-architecture",
    });

    expect(result).toEqual({
      success: false,
      error: "Slug already exists",
    });

    expect(valuesMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns validation error when slug is invalid", async () => {
    const { createTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await createTag({
      name: "React",
      slug: "React JS",
    });

    expect(result).toEqual({
      success: false,
      error: "Slug must be lowercase, numbers and hyphens only",
    });

    expect(findFirstMock).not.toHaveBeenCalled();
    expect(valuesMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("deletes a tag by slug and revalidates related pages", async () => {
    const { deleteTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await deleteTag("clean-architecture");

    expect(result).toEqual({
      success: true,
      data: undefined,
    });

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith("tags.slug", "clean-architecture");
    expect(whereMock).toHaveBeenCalledTimes(1);

    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(admin)/admin/tags",
      "page",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(admin)/admin/posts",
      "page",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/[locale]/(pages)/blog",
      "page",
    );
  });

  it("returns error when createTag insert fails", async () => {
    valuesMock.mockImplementationOnce(async () => {
      throw new Error("Database insert failed");
    });

    const { createTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await createTag({
      name: "React",
      slug: "react",
    });

    expect(result).toEqual({
      success: false,
      error: "Database insert failed",
    });

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns error when deleteTag fails", async () => {
    whereMock.mockImplementationOnce(async () => {
      throw new Error("Database delete failed");
    });

    const { deleteTag } = await import(
      "@/app/features/tags-columns/tag-actions"
    );

    const result = await deleteTag("react");

    expect(result).toEqual({
      success: false,
      error: "Database delete failed",
    });

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
