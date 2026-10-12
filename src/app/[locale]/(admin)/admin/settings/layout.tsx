import { Settings2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { SettingsNavigation } from "@/app/features/admin-settings/settings-navigation";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("dashboard.settings");

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex items-center gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
          <Settings2 className="size-6 text-primary" />
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </header>
      <div className="grid min-w-0 gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 border-b pb-5 md:border-r md:border-b-0 md:pr-6 md:pb-0">
          <SettingsNavigation />
        </aside>
        <div className="min-w-0 w-full max-w-xl space-y-6">{children}</div>
      </div>
    </section>
  );
}
