import Image from "next/image";
import type { Metadata } from "next/types";
import { getLocale, getTranslations } from "next-intl/server";
import { TimelineLayout } from "@/app/features/timeline-layout/timeline-layout";
import { getCourses } from "@/app/shared/data/getCoursesData";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
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
  const path = "/about";

  return {
    title: t("title"),
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        "pt-BR": `/pt${path}`,
        "en-US": `/en${path}`,
        "es-ES": `/es${path}`,
      },
    },
  };
}

export default async function About() {
  const t = await getTranslations("About");
  const locale = await getLocale();
  const courses = await getCourses(locale);

  return (
    <section className="rounded-lg p-6">
      <FadeWrapper>
        <header className="text-center mt-6 md:mt-10">
          <h1 className="title-about mb-4 font-extrabold leading-10 tracking-tight text-3xl md:text-4xl">
            {t("h1")}
          </h1>
        </header>
      </FadeWrapper>

      <p className="text-sm leading-relaxed text-center max-w-3xl mx-auto md:text-2xl lg:text-2xl font-semibold tracking-tighter mt-10">
        {t("p")}
      </p>

      <TimelineLayout />

      <TerminalCourses courses={courses} />

      <section className="rounded-lg p-6 mt-4">
        <FadeWrapper>
          <header className="text-center mt-4">
            <h2 className="title-about mb-4 font-extrabold leading-10 tracking-tight text-3xl md:text-4xl">
              {t("h2")}
            </h2>
          </header>
        </FadeWrapper>

        <div className="flex flex-col items-center mt-10 space-y-5">
          <div className="flex items-center">
            <Image
              src="/static/en.svg"
              alt="us"
              width={20}
              height={20}
              priority
              className="h-3 w-3 md:w-7 md:h-7 mr-1"
            />
            <span className="text-sm leading-relaxed md:text-2xl lg:text-2xl font-semibold tracking-tighter">
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
              className="h-3 w-3 md:w-7 md:h-7 mr-1"
            />
            <span className="text-sm leading-relaxed md:text-2xl lg:text-2xl font-semibold tracking-tighter">
              {t("span2")}
            </span>
          </div>

          <div className="flex items-center mb-20">
            <Image
              src="/static/es.svg"
              alt="es"
              width={20}
              height={20}
              priority
              className="h-3 w-3 md:w-7 md:h-7 mr-1"
            />
            <span className="text-sm leading-relaxed md:text-2xl lg:text-2xl font-semibold tracking-tighter">
              {t("span3")}
            </span>
          </div>
        </div>
      </section>
    </section>
  );
}
