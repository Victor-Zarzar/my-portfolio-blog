import { getTranslations } from "next-intl/server";
import { SettingsCard } from "@/app/features/admin-settings/settings-card";

export default async function SettingsPage() {
  const t = await getTranslations("dashboard.settings");

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <SettingsCard />
    </section>
  );
}
