import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { TwoFactorSetupForm } from "@/app/features/two-factor-setup-form/two-factor-setup-form";
import { requireSession } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";

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
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <TwoFactorSetupForm
        twoFactorEnabled={currentUser?.twoFactorEnabled ?? false}
      />
    </section>
  );
}
