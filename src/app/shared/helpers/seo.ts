import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const LOCALES = ["pt", "en", "es"] as const;

const SITE_NAME = "Victor Zarzar | Full Stack Developer";
const DEFAULT_OG_IMAGE = {
  url: "/static/og-image.png",
  width: 1200,
  height: 630,
};

const HREFLANG: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

const OG_LOCALE: Record<string, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

function buildAlternates(locale: string, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [HREFLANG[l] ?? l, `/${l}${path}`]),
      ),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

function buildPostAlternates(
  locale: string,
  slug: string,
  slugs: Record<string, string>,
) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const s = slugs[l];
    if (s) {
      languages[HREFLANG[l] ?? l] = `/${l}/blog/${s}`;
    }
  }

  const defaultSlug = slugs[routing.defaultLocale];
  if (defaultSlug) {
    languages["x-default"] = `/${routing.defaultLocale}/blog/${defaultSlug}`;
  }

  return { canonical: `/${locale}/blog/${slug}`, languages };
}

export function pageMetadata(
  locale: string,
  path: string,
  { title, description }: { title: string; description: string },
): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
      locale: OG_LOCALE[locale] ?? "en_US",
      type: "website",
    },
  };
}

export function postMetadata(
  locale: string,
  slug: string,
  {
    title,
    description,
    image,
    tags,
    publishedAt,
    updatedAt,
    slugs,
  }: {
    title: string;
    description: string;
    image?: string | null;
    tags?: string[] | null;
    publishedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    slugs?: Record<string, string>;
  },
): Metadata {
  return {
    title,
    description,
    keywords: tags ?? undefined,
    alternates: buildPostAlternates(locale, slug, slugs ?? { [locale]: slug }),
    openGraph: {
      title,
      description,
      url: `/${locale}/blog/${slug}`,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : [DEFAULT_OG_IMAGE],
      locale: OG_LOCALE[locale] ?? "en_US",
      type: "article",
      tags: tags ?? undefined,
      publishedTime: publishedAt
        ? new Date(publishedAt).toISOString()
        : undefined,
      modifiedTime: updatedAt ? new Date(updatedAt).toISOString() : undefined,
    },
  };
}
