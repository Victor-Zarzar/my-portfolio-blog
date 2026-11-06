import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import { privacyPolicySections } from "@/app/shared/data/getPrivacyData";
import { pageMetadata } from "@/app/shared/helpers/seo";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
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
    <main className="mt-6 md:mt-10 mx-auto max-w-3xl">
      <section className="text-center mb-16">
        <FadeWrapper>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-6">
            {t("h1")}
          </h1>
        </FadeWrapper>
        <p className="text-lg md:text-xl font-semibold leading-relaxed">
          {t("p")}
        </p>
      </section>

      <section className="text-center mt-10">
        <h2 className="text-lg md:text-3xl font-semibold tracking-tight mb-4">
          {t("h2")}
        </h2>
      </section>

      {privacyPolicySections.map((section, index) => (
        <section key={index} className="text-center mt-10">
          <p className="text-lg md:text-xl font-semibold leading-relaxed">
            {t(section)}
          </p>
        </section>
      ))}
    </main>
  );
}
