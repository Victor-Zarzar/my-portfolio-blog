import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import { privacyPolicySections } from "@/app/shared/data/getPrivacyData";
import { pageMetadata } from "@/app/shared/helpers/seo";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import GridSection from "@/app/shared/wrapper/grid-wrapper";
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
  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });

  return pageMetadata(locale, "/privacypolicy", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function PrivacyPolicy() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <main>
      <GridSection>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <FadeWrapper>
              <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                {t("h1")}
              </h1>
            </FadeWrapper>
            <p className="text-lg font-semibold leading-relaxed md:text-xl">
              {t("p")}
            </p>
          </div>

          <h2 className="mt-16 text-center text-lg font-semibold tracking-tight md:text-3xl">
            {t("h2")}
          </h2>

          {privacyPolicySections.map((section) => (
            <p
              key={section}
              className="mt-10 text-center text-lg font-semibold leading-relaxed md:text-xl"
            >
              {t(section)}
            </p>
          ))}
        </div>
      </GridSection>
    </main>
  );
}
