"use client";

import { SearchIcon, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useEffect } from "react";
import type { CommandPaletteProps } from "@/app/shared/types/command/command";
import { Button } from "@/app/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/app/shared/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/shared/ui/dialog";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const iconClass = "mr-0.5 h-4 w-4";

export default function CommandPalette({
  links,
  showSettings = true,
}: CommandPaletteProps) {
  const t = useTranslations("CommandPalette");
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.code === "scape" && isOpen)
      ) {
        event.preventDefault();

        setIsOpen(!isOpen);
      }
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const go = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        aria-label={t("command.navigate")}
        className={cn(
          "hidden h-10 w-10 rounded-md md:flex",
          "border border-transparent",
          "hover:bg-accent/50",
          "dark:bg-input/40 dark:hover:bg-input/30",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
        )}
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon size={20} />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">{t("command.navigate")}</DialogTitle>

          <DialogDescription className="sr-only">
            {t("command.description")}
          </DialogDescription>

          <Command>
            <CommandInput placeholder={t("searchPlaceholder")} />

            <CommandList>
              <CommandEmpty>{t("command.empty")}</CommandEmpty>

              <CommandGroup heading={t("command.navigate")}>
                {links.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${t(item.labelKey)} ${item.keywords ?? ""}`}
                    onSelect={() => go(item.href)}
                  >
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {showSettings && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t("command.settings")}>
                    <CommandItem
                      onSelect={() => {
                        setIsOpen(false);
                        window.dispatchEvent(
                          new CustomEvent("app:open-settings"),
                        );
                      }}
                    >
                      <Settings className={iconClass} />
                      <span>{t("nav.settings")}</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
