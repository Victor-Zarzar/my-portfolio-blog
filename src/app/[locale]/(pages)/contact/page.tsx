import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/app/features/contact-form/contact-form";
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
  const t = await getTranslations({ locale, namespace: "Contact" });

  return pageMetadata(locale, "/contact", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function Contact() {
  const t = await getTranslations("Contact");

  return (
    <section className="col-span-4 mx-auto p-6">
      <FadeWrapper>
        <header className="text-center mt-6 md:mt-10">
          <h1 className="title-projects mb-4 font-extrabold leading-10 tracking-tight text-3xl md:text-4xl">
            {t("h1")}
          </h1>
        </header>
      </FadeWrapper>

      <div className="mt-10 md:mt-14 max-w-lg mx-auto mb-6 md:mb-10">
        <ContactForm />
      </div>
    </section>
  );
}
