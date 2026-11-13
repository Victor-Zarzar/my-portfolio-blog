import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/app/features/contact-form/contact-form";
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
  const t = await getTranslations({ locale, namespace: "Contact" });

  return pageMetadata(locale, "/contact", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function Contact() {
  const t = await getTranslations("Contact");

  return (
    <GridSection>
      <FadeWrapper>
        <header className="text-center">
          <h1 className="title-projects mb-4 text-3xl font-extrabold leading-10 tracking-tight md:text-4xl">
            {t("h1")}
          </h1>
        </header>
      </FadeWrapper>

      <section className="mx-auto mt-6 max-w-lg md:mt-8">
        <ContactForm />
      </section>
    </GridSection>
  );
}
