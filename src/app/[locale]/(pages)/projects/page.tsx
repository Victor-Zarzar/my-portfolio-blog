import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/app/shared/helpers/seo";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import GridSection from "@/app/shared/wrapper/grid-wrapper";
import { routing } from "@/i18n/routing";
import ProjectsContent from "./project-content";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });

  return pageMetadata(locale, "/projects", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Projects");

  return (
    <main>
      <GridSection>
        <FadeWrapper>
          <h1 className="title-projects mb-10 text-center text-3xl font-extrabold leading-10 tracking-tight md:text-4xl">
            {t("h1")}
          </h1>
        </FadeWrapper>

        <ProjectsContent locale={locale} />
      </GridSection>
    </main>
  );
}
