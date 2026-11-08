import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FaLinkedin } from "react-icons/fa";
import { VscGithub } from "react-icons/vsc";
import { SOCIAL_LINKS } from "@/app/shared/config/app-config";
import { Card, CardContent } from "@/app/shared/ui/card";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { Link } from "@/i18n/navigation";

const socials = [
  { href: SOCIAL_LINKS.github, label: "GitHub", icon: VscGithub },
  { href: SOCIAL_LINKS.linkedin, label: "LinkedIn", icon: FaLinkedin },
] as const;

export default async function ContactTeaser() {
  const t = await getTranslations("ContactTeaser");

  return (
    <section className="w-full max-w-6xl mx-auto space-y-8">
      <FadeWrapper>
        <h2 className="title-projects text-center text-3xl font-extrabold tracking-tight md:text-4xl">
          {t("h2")}
        </h2>
      </FadeWrapper>

      <FadeWrapper>
        <Card className="dark:bg-stone-950 bg-white">
          <CardContent className="p-8 text-center md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />
              </span>
              {t("available")}
            </span>

            <p className="mx-auto mt-6 max-w-md text-neutral-600 dark:text-neutral-400">
              {t("p")}
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{t("social")}</span>
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-colors hover:text-black dark:hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeWrapper>
    </section>
  );
}
