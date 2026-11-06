import { env } from "@/env/client";

export const SITE_FIRST_NAME = "Victor";
export const SITE_LAST_NAME = "Zarzar";
export const SITE_NAME = `${SITE_FIRST_NAME} ${SITE_LAST_NAME}`;
export const WEBSITE_URL = env.NEXT_PUBLIC_WEBSITE_URL;
export const PROJECT_NAME = "my-portfolio-blog";
export const TERMINAL_PROMPT = "🧙‍♂️victorzarzar";
export const TERMINAL = "Terminal - Portfolio";
export const NODE_VERSION = "v26.13.0";
export const BUN_VERSION = "v1.4.4";

export const SOCIAL_LINKS = {
  github: "https://github.com/Victor-Zarzar",
  linkedin: "https://www.linkedin.com/in/victorzarzar",
  medium: "https://medium.com/@victorzarzar58",
  devto: "https://dev.to/victorzarzar",
  instagram: "https://instagram.com/victorzarzar7",
  facebook: "https://www.facebook.com/victorzarzar58",
} as const;

export const LOCALES = ["pt", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

export const DEFAULT_OG_IMAGE = {
  url: "/static/og-image.png",
  width: 1200,
  height: 630,
};

export const HREFLANG: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export const OG_LOCALE: Record<string, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};
