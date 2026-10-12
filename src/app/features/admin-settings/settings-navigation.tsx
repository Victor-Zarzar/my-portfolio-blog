"use client";

import {
  Bell,
  ChevronRight,
  Palette,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    title: "account",
    items: [
      {
        key: "profile",
        href: "/admin/settings/profile",
        icon: UserRound,
      },
      {
        key: "security",
        href: "/admin/settings/security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "preferences",
    items: [
      {
        key: "appearance",
        href: "/admin/settings/appearance",
        icon: Palette,
      },
      {
        key: "notifications",
        href: "/admin/settings/notifications",
        icon: Bell,
      },
    ],
  },
] as const;

export function SettingsNavigation() {
  const t = useTranslations("dashboard.settings.navigation");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("title")}
      className="flex min-w-0 gap-5 overflow-x-auto md:flex-col md:gap-6 md:overflow-visible"
    >
      {navigationGroups.map((group) => (
        <div
          key={group.title}
          className={cn(
            "flex shrink-0 gap-2",
            "md:w-full md:min-w-0 md:flex-col md:gap-1",
            "md:border-t md:pt-5",
            "md:first:border-t-0 md:first:pt-0",
          )}
        >
          <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">
            {t(group.title)}
          </p>

          {group.items.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 shrink-0 items-center gap-3",
                  "rounded-lg border px-3 text-sm transition-colors",
                  "md:w-full md:min-w-0",
                  active
                    ? "border-border bg-accent font-semibold text-accent-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  active &&
                    "md:before:absolute md:before:inset-y-2 md:before:left-0 md:before:w-0.5 md:before:rounded-full md:before:bg-primary",
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0", active && "text-primary")}
                />

                <span className="whitespace-nowrap md:truncate">
                  {t(item.key)}
                </span>

                {active && (
                  <ChevronRight className="ml-auto hidden size-4 shrink-0 text-muted-foreground md:block" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
