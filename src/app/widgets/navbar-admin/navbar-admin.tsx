"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import CommandPalette from "@/app/features/command-palette/command-palette";
import LanguageToggle from "@/app/features/lang-toggle/lang-toggle";
import SettingsSwitcher from "@/app/features/settings-switcher/settings-switcher";
import { ModeToggle } from "@/app/features/toggle-mode/toggle-mode";
import { adminCommandLinks } from "@/app/shared/constants/command-links";
import type { AdminNavbarProps } from "@/app/shared/types/navbar/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/shared/ui/avatar";
import { Button } from "@/app/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu";
import { Logo } from "@/app/shared/ui/logo";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { cn, getInitials } from "@/lib/utils";

export const AdminNavbar = React.forwardRef<HTMLElement, AdminNavbarProps>(
  (
    { className, user, logo = <Logo />, logoHref = "/admin", ...props },
    ref,
  ) => {
    const router = useRouter();
    const t = useTranslations("AdminNavbar");

    async function logOut() {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/signin");
          },
        },
      });
    }

    return (
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b supports-backdrop-filter:bg-background/60 px-4 md:px-6 **:no-underline",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="container relative mx-auto flex h-16 items-center justify-between gap-4 bg-white dark:bg-stone-950">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin">
              <span className="hidden sm:inline">
                {t("hello")}{" "}
                <strong className="text-foreground">
                  {user.name} {":)"}
                </strong>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <CommandPalette links={adminCommandLinks} />
              <LanguageToggle />
              <ModeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>

                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                  <User className="h-4 w-4" />
                  {t("profile")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/admin/settings")}
                >
                  <Settings className="h-4 w-4" />
                  {t("settings")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logOut}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex lg:hidden">
              <SettingsSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  },
);

AdminNavbar.displayName = "AdminNavbar";
