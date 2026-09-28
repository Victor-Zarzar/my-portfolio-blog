import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/app/features/profile/profile-form";
import { requireSession } from "@/lib/auth/guard";

export default async function ProfilePage() {
  const session = await requireSession();
  const t = await getTranslations("dashboard.profile");

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <ProfileForm user={session.user} />
    </section>
  );
}
