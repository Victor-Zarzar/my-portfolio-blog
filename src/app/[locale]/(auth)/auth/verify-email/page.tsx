import { getTranslations } from "next-intl/server";
import VerifyEmailForm from "@/app/features/verify-email-form/verify-email-form";
import type { VerifyEmailPageProps } from "@/app/shared/types/email/email";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const t = await getTranslations("VerifyEmail");
  const { email } = await searchParams;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="text-center mb-10 space-y-3">
        <FadeWrapper>
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        </FadeWrapper>

        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <VerifyEmailForm email={email ?? ""} />
    </section>
  );
}
