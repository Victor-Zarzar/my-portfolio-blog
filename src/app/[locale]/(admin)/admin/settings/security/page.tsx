import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SettingsPageHeader } from "@/app/features/admin-settings/settings-page-header";
import { TwoFactorSetupForm } from "@/app/features/two-factor-setup-form/two-factor-setup-form";
import { requireSession } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schemas/auth";

export default async function SecurityPage() {
  const session = await requireSession();
  const t = await getTranslations("dashboard.security");

  const [currentUser] = await db
    .select({
      twoFactorEnabled: user.twoFactorEnabled,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        icon={ShieldCheck}
        title={t("title")}
        description={t("description")}
      />
      <TwoFactorSetupForm
        twoFactorEnabled={currentUser?.twoFactorEnabled ?? false}
      />
    </section>
  );
}
