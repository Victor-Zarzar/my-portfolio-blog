import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import NewsletterForm from "@/app/features/newsletter/newsletter-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import NewsletterStatus from "./newsletter-status";

export default async function NewsletterSection() {
  const t = await getTranslations("Newsletter");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <FadeWrapper>
        <h2 className="title-articles text-center text-3xl font-extrabold tracking-tight md:text-4xl">
          {t("h2")}
        </h2>
      </FadeWrapper>

      <FadeWrapper>
        <NewsletterForm />
      </FadeWrapper>

      <Suspense>
        <NewsletterStatus />
      </Suspense>
    </div>
  );
}
