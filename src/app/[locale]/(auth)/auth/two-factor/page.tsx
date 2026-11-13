import { getTranslations } from "next-intl/server";
import { TwoFactorForm } from "@/app/features/two-factor-form/two-factor-form";
import { Badge } from "@/app/shared/ui/badge";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

export default async function TwoFactorPage() {
  const t = await getTranslations("twoFactor");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="text-center mb-10 space-y-3">
        <Badge variant="outline" className="mb-4 gap-2 px-3 py-1 font-medium">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          {t("secureNote")}
        </Badge>
        <FadeWrapper>
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        </FadeWrapper>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>
      <TwoFactorForm />
      <p className="mt-8 text-xs text-muted-foreground">{t("codeExpires")}</p>
    </section>
  );
}
