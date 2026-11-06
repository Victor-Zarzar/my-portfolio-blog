import type { MetadataRoute } from "next";
import { env } from "@/env/client";
import { routing } from "@/i18n/routing";
import { getAllPostsForSitemap } from "@/lib/db/queries/blog";

const STATIC_PAGES = [
  "",
  "about",
  "contact",
  "blog",
  "projects",
  "privacypolicy",
] as const;

const BUILD_DATE = new Date().toISOString().split("T")[0];

const HREFLANG: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

function languagesFor(baseUrl: string, suffix: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((l) => [
        HREFLANG[l] ?? l,
        `${baseUrl}/${l}${suffix}`,
      ]),
    ),
    "x-default": `${baseUrl}/${routing.defaultLocale}${suffix}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_WEBSITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PAGES.map((page) => {
        const suffix = page ? `/${page}` : "";
        return {
          url: `${baseUrl}/${locale}${suffix}`,
          lastModified: BUILD_DATE,
          alternates: { languages: languagesFor(baseUrl, suffix) },
        };
      }),
  );

  try {
    const allPosts = await getAllPostsForSitemap();
    const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
      url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? BUILD_DATE,
      alternates: { languages: languagesFor(baseUrl, `/blog/${post.slug}`) },
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
