import { getTranslations } from "next-intl/server";
import SignInForm from "@/app/features/signin-form/signin-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

export default async function SignInPage() {
  const t = await getTranslations("SignIn");

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
      <SignInForm />
    </section>
  );
}
