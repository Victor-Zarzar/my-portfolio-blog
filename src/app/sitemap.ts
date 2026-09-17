import type { MetadataRoute } from "next";
import env from "@/env";
import { routing } from "@/i18n/routing";
import { getAllPostsForSitemap } from "@/lib/db/queries/blog";

const STATIC_PAGES = [
  "",
  "about",
  "contact",
  "projects",
  "privacypolicy",
] as const;

const BUILD_DATE = new Date().toISOString().split("T")[0];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_WEBSITE_URL;
  const locales = routing.locales;

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    STATIC_PAGES.map((page) => ({
      url: `${baseUrl}/${locale}${page ? `/${page}` : ""}`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1.0 : 0.7,
    })),
  );

  try {
    const allPosts = await getAllPostsForSitemap();
    const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
      url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? BUILD_DATE,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
