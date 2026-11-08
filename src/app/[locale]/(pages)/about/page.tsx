import Image from "next/image";
import type { Metadata } from "next/types";
import { getLocale, getTranslations } from "next-intl/server";
import { TimelineLayout } from "@/app/features/timeline-layout/timeline-layout";
import { getCourses } from "@/app/shared/data/getCoursesData";
import { pageMetadata } from "@/app/shared/helpers/seo";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import GridSection from "@/app/shared/wrapper/grid-wrapper";
import TerminalCourses from "@/app/widgets/terminal-courses/terminal-courses";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return pageMetadata(locale, "/about", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function About() {
  const t = await getTranslations("About");
  const locale = await getLocale();
  const courses = await getCourses(locale);

  return (
    <main>
      <GridSection>
        <FadeWrapper>
          <header className="text-center">
            <h1 className="title-about mb-4 text-3xl font-extrabold leading-10 tracking-tight md:text-4xl">
              {t("h1")}
            </h1>
          </header>
        </FadeWrapper>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm font-semibold leading-relaxed tracking-tighter md:text-2xl">
          {t("p")}
        </p>
      </GridSection>

      <GridSection>
        <TimelineLayout />
      </GridSection>

      <GridSection>
        <TerminalCourses courses={courses} />
      </GridSection>

      <GridSection>
        <FadeWrapper>
          <header className="text-center">
            <h2 className="title-about mb-4 text-3xl font-extrabold leading-10 tracking-tight md:text-4xl">
              {t("h2")}
            </h2>
          </header>
        </FadeWrapper>

        <div className="mt-10 flex flex-col items-center space-y-5">
          <div className="flex items-center">
            <Image
              src="/static/en.svg"
              alt="us"
              width={20}
              height={20}
              priority
              className="mr-1 h-3 w-3 md:h-7 md:w-7"
            />
            <span className="text-sm font-semibold leading-relaxed tracking-tighter md:text-2xl">
              {t("span1")}
            </span>
          </div>

          <div className="flex items-center">
            <Image
              src="/static/pt.svg"
              alt="br"
              width={20}
              height={20}
              priority
              className="mr-1 h-3 w-3 md:h-7 md:w-7"
            />
            <span className="text-sm font-semibold leading-relaxed tracking-tighter md:text-2xl">
              {t("span2")}
            </span>
          </div>

          <div className="flex items-center">
            <Image
              src="/static/es.svg"
              alt="es"
              width={20}
              height={20}
              priority
              className="mr-1 h-3 w-3 md:h-7 md:w-7"
            />
            <span className="text-sm font-semibold leading-relaxed tracking-tighter md:text-2xl">
              {t("span3")}
            </span>
          </div>
        </div>
      </GridSection>
    </main>
  );
}
