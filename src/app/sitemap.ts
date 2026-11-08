import type { MetadataRoute } from "next";
import {
  DEFAULT_LOCALE,
  HREFLANG,
  LOCALES,
} from "@/app/shared/config/app-config";
import { env } from "@/env/client";
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

function languagesFor(baseUrl: string, suffix: string) {
  return {
    ...Object.fromEntries(
      LOCALES.map((l) => [HREFLANG[l] ?? l, `${baseUrl}/${l}${suffix}`]),
    ),
    "x-default": `${baseUrl}/${DEFAULT_LOCALE}${suffix}`,
  };
}

function postLanguages(baseUrl: string, slugs: Record<string, string>) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    const s = slugs[l];
    if (s) {
      languages[HREFLANG[l] ?? l] = `${baseUrl}/${l}/blog/${s}`;
    }
  }

  const defaultSlug = slugs[DEFAULT_LOCALE];
  if (defaultSlug) {
    languages["x-default"] = `${baseUrl}/${DEFAULT_LOCALE}/blog/${defaultSlug}`;
  }

  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_WEBSITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
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
    const slugsByPost = new Map<number, Record<string, string>>();
    for (const post of allPosts) {
      const current = slugsByPost.get(post.postId) ?? {};
      current[post.locale] = post.slug;
      slugsByPost.set(post.postId, current);
    }

    const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
      url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? BUILD_DATE,
      alternates: {
        languages: postLanguages(
          baseUrl,
          slugsByPost.get(post.postId) ?? { [post.locale]: post.slug },
        ),
      },
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
