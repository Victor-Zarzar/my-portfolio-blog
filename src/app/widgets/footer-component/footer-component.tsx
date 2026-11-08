import { getTranslations } from "next-intl/server";
import {
  PROJECT_NAME,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/app/shared/config/app-config";
import FooterLinks from "./footer-links";
import FooterThemeToggle from "./footer-theme-toggle";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
      <FooterLinks />
      <div className="grid items-center gap-4 lg:grid-cols-3">
        <a
          href={`${SOCIAL_LINKS.github}/${PROJECT_NAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <span className="text-neutral-600 dark:text-neutral-400">
            {t("builtWith")}
          </span>
          <span className="font-medium">Next.js</span>
        </a>
        <p className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400 lg:text-center">
          © {year} {SITE_NAME}. {t("rights")}
        </p>
        <div className="flex lg:justify-end">
          <FooterThemeToggle />
        </div>
      </div>
    </footer>
  );
}
