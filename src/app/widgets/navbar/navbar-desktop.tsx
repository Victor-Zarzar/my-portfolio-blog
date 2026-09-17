"use client";

import { BookOpen, FileText, Home, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import CommandPalette from "@/app/features/command-palette/command-palette";
import LanguageToggle from "@/app/features/lang-toggle/lang-toggle";
import SettingsSwitcher from "@/app/features/settings-switcher/settings-switcher";
import { ModeToggle } from "@/app/features/toggle-mode/toggle-mode";
import { publicCommandLinks } from "@/app/shared/constants/command-links";
import type { NavbarNavLink, NavbarProps } from "@/app/shared/types/navbar/nav";
import { Logo } from "@/app/shared/ui/logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/app/shared/ui/navigation-menu";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NavMobile } from "./nav-mobile";

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = "/",
      navigationLinks,
      signInText,
      signInHref,
      ctaText,
      ctaHref,
      onSignInClick,
      onCtaClick,
      ...props
    },
    ref,
  ) => {
    const t = useTranslations("Navbar");
    const iconCls = "h-5 w-5";

    const defaultNavigationLinks: NavbarNavLink[] = [
      { link: "/", label: t("home"), icon: <Home className={iconCls} /> },
      { link: "/about", label: t("about"), icon: <User className={iconCls} /> },
      {
        link: "/projects",
        label: t("projects"),
        icon: <FileText className={iconCls} />,
      },
      {
        link: "/blog",
        label: t("blog"),
        icon: <BookOpen className={iconCls} />,
      },
      {
        link: "/contact",
        label: t("contact"),
        icon: <Mail className={iconCls} />,
      },
    ];

    const links = navigationLinks ?? defaultNavigationLinks;

    return (
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b supports-backdrop-filter:bg-background/60 px-4 md:px-6 **:no-underline",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="container relative mx-auto flex h-16 items-center justify-between gap-4 dark:bg-stone-950 bg-white">
          <div className="flex items-center gap-2">
            <div className="md:flex lg:hidden">
              <NavMobile
                logo={logo}
                logoHref={logoHref}
                navigationLinks={links}
              />
            </div>

            <div className="flex items-center gap-6">
              <Link
                href={logoHref ?? "/"}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors"
                aria-label="home"
              >
                <div className="text-2xl">{logo}</div>
              </Link>

              <NavigationMenu className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                <NavigationMenuList className="gap-1">
                  {links.map((item, index) => (
                    <NavigationMenuItem key={index}>
                      <Link
                        href={item.link}
                        className={cn(
                          "relative inline-flex h-9 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 no-underline pb-1",
                          "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:transition-all after:duration-300",
                          item.active
                            ? "text-foreground after:w-full after:bg-foreground"
                            : "text-foreground/80 hover:text-foreground after:bg-foreground hover:after:w-full",
                        )}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="items-center gap-3 md:hidden lg:flex">
            <CommandPalette links={publicCommandLinks} />
            <LanguageToggle />
            <ModeToggle />
          </div>

          <div className="md:flex lg:hidden">
            <SettingsSwitcher />
          </div>
        </div>
      </header>
    );
  },
);

Navbar.displayName = "Navbar";

export { Logo };

export function NavbarComponent() {
  return <Navbar />;
}
