"use client";

import { LanguagesIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { Button } from "@/app/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();

  function setLanguage(language: Locale) {
    router.push(pathname, {
      locale: language,
      scroll: false,
    });
  }

  return (
    <div className="hidden md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "border border-transparent hover:bg-accent/50 px-2.5 text-muted-foreground select-none",
              "dark:bg-input/40 dark:hover:bg-input/30",
              "focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
            )}
          >
            <LanguagesIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle language</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {routing.locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => setLanguage(locale)}
              data-umami-event="language-switcher-click"
            >
              {locale.toUpperCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
