import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutTeaser from "@/app/features/about-teaser/about-teaser";
import ContactTeaser from "@/app/features/contact-teaser/contact-teaser";
import ProjectsTeaser from "@/app/features/projects-teaser/projects-teaser";
import { pageMetadata } from "@/app/shared/helpers/seo";
import Skills from "@/app/shared/ui/icons/skills/skills";
import GridSection from "@/app/shared/wrapper/grid-wrapper";
import Header from "@/app/widgets/header/header-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Layout" });

  return pageMetadata(locale, "", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default function Home() {
  return (
    <main>
      <GridSection>
        <Header />
      </GridSection>
      <GridSection>
        <Skills />
      </GridSection>
      <GridSection>
        <ProjectsTeaser />
      </GridSection>
      <GridSection>
        <AboutTeaser />
      </GridSection>
      <GridSection hatched>
        <ContactTeaser />
      </GridSection>
    </main>
  );
}
