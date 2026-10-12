import { Palette } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SettingsCard } from "@/app/features/admin-settings/settings-card";
import { SettingsPageHeader } from "@/app/features/admin-settings/settings-page-header";

export default async function AppearanceSettingsPage() {
  const t = await getTranslations("dashboard.settings");

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        icon={Palette}
        title={t("appearance.title")}
        description={t("appearance.description")}
      />
      <SettingsCard />
    </section>
  );
}
