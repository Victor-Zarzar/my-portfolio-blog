import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import NewsletterForm from "@/app/features/newsletter/newsletter-form";
import { Card, CardContent } from "@/app/shared/ui/card";
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
        <Card className="dark:bg-stone-950 bg-white">
          <CardContent className="p-8 text-center md:p-12">
            <p className="mx-auto mb-8 max-w-md text-neutral-600 dark:text-neutral-400">
              {t("p")}
            </p>
            <NewsletterForm />
          </CardContent>
        </Card>
      </FadeWrapper>

      <Suspense>
        <NewsletterStatus />
      </Suspense>
    </div>
  );
}
