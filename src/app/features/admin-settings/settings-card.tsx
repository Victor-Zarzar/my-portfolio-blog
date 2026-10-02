"use client";

import {
  Check,
  Languages,
  Laptop,
  Moon,
  Palette,
  Settings2,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/shared/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const themes = [
  {
    value: "system",
    icon: Laptop,
  },
  {
    value: "light",
    icon: Sun,
  },
  {
    value: "dark",
    icon: Moon,
  },
] as const;

const locales = [
  {
    value: "pt",
    image: "/static/pt.svg",
  },
  {
    value: "en",
    image: "/static/en.svg",
  },
  {
    value: "es",
    image: "/static/es.svg",
  },
] as const;

type Locale = (typeof locales)[number]["value"];

export function SettingsCard() {
  const t = useTranslations("dashboard.settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentLocale =
    locales.find((item) => item.value === locale) ?? locales[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLocaleChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale as Locale,
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
            <Settings2 className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>{t("preferences.title")}</CardTitle>
            <CardDescription>{t("preferences.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{t("theme.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("theme.description")}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {themes.map((item) => {
              const Icon = item.icon;
              const active = mounted && theme === item.value;

              return (
                <Button
                  key={item.value}
                  type="button"
                  variant="outline"
                  aria-pressed={active}
                  onClick={() => setTheme(item.value)}
                  className={cn(
                    "relative h-auto justify-start gap-3 px-4 py-4",
                    "transition-colors",
                    active &&
                      "border-primary bg-accent text-accent-foreground ring-1 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md bg-muted",
                      active && "bg-primary/10",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {t(`theme.options.${item.value}.title`)}
                    </p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {t(`theme.options.${item.value}.description`)}
                    </p>
                  </div>
                  {active && (
                    <Check className="absolute right-3 top-3 size-4 text-primary" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="border-t" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{t("language.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("language.description")}
              </p>
            </div>
          </div>
          <Select
            value={locale}
            disabled={isPending}
            onValueChange={handleLocaleChange}
          >
            <SelectTrigger className="h-12 w-full sm:max-w-sm">
              <div className="flex items-center gap-3">
                <Image
                  src={currentLocale.image}
                  alt={t(`language.options.${currentLocale.value}.title`)}
                  width={22}
                  height={22}
                  className="rounded-sm"
                />
                <span className="font-medium">
                  {t(`language.options.${currentLocale.value}.title`)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {locales.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  textValue={t(`language.options.${item.value}.title`)}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={t(`language.options.${item.value}.title`)}
                      width={22}
                      height={22}
                      className="rounded-sm"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {t(`language.options.${item.value}.title`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(`language.options.${item.value}.description`)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
