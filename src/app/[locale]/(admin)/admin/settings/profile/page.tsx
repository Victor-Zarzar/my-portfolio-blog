import { UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SettingsPageHeader } from "@/app/features/admin-settings/settings-page-header";
import { ChangePasswordForm } from "@/app/features/profile/change-password-form";
import { ProfileForm } from "@/app/features/profile/profile-form";
import { requireSession } from "@/lib/auth/guard";

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const t = await getTranslations("dashboard.profile");

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        icon={UserRound}
        title={t("title")}
        description={t("description")}
      />
      <ProfileForm user={session.user} />
      <ChangePasswordForm />
    </section>
  );
}
