import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "@/app/features/reset-password-form/reset-password-form";
import type { ResetPasswordPageProps } from "@/app/shared/types/email/email";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const t = await getTranslations("ResetPassword");

  const { token, error } = await searchParams;

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
      <ResetPasswordForm
        token={token ?? ""}
        invalidToken={error === "INVALID_TOKEN" || !token}
      />
    </section>
  );
}
