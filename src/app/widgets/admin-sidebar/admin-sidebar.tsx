"use client";

import { ChartNoAxesCombined, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminUserMenu } from "@/app/features/admin-user-menu/admin-user-menu";
import { adminNavigation } from "@/app/shared/constants/command-links";
import type { AdminSidebarProps } from "@/app/shared/types/admin/admin";
import type {
  AdminNavCollapsible,
  AdminNavItem,
  AdminNavLink,
} from "@/app/shared/types/command/command";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/app/shared/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";

export function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("CommandPalette");
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="justify-center">
              <Link href="/admin">
                <ChartNoAxesCombined className="size-4 shrink-0" />
                {(state !== "collapsed" || isMobile) && (
                  <div className="grid flex-none text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {t("command.title")}
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0 w-full border-b supports-backdrop-filter:bg-background/60" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mx-auto w-full max-w-40">
            {t("command.navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mx-auto w-full max-w-40 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:max-w-none">
            <SidebarMenu>
              {adminNavigation.map((item) => {
                if (!("items" in item)) {
                  return (
                    <SidebarMenuLink
                      key={item.id}
                      item={item}
                      pathname={pathname}
                    />
                  );
                }
                if (state === "collapsed" && !isMobile) {
                  return (
                    <SidebarMenuCollapsedDropdown
                      key={item.id}
                      item={item}
                      pathname={pathname}
                    />
                  );
                }
                return (
                  <SidebarMenuCollapsible
                    key={item.id}
                    item={item}
                    pathname={pathname}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AdminUserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarMenuLink({
  item,
  pathname,
}: {
  item: AdminNavLink;
  pathname: string;
}) {
  const t = useTranslations("CommandPalette");
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(pathname, item)}
        tooltip={t(item.labelKey)}
        className="border border-transparent data-[active=true]:border-sidebar-border"
      >
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          {item.icon}
          <span>{t(item.labelKey)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: AdminNavCollapsible;
  pathname: string;
}) {
  const t = useTranslations("CommandPalette");
  const { setOpenMobile } = useSidebar();

  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(pathname, item)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={t(item.labelKey)}
            isActive={checkIsActive(pathname, item)}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkIsActive(pathname, subItem)}
                  className="border border-transparent data-[active=true]:border-sidebar-border"
                >
                  <Link
                    href={subItem.href}
                    onClick={() => setOpenMobile(false)}
                  >
                    {subItem.icon}
                    <span>{t(subItem.labelKey)}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: AdminNavCollapsible;
  pathname: string;
}) {
  const t = useTranslations("CommandPalette");
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={t(item.labelKey)}
            isActive={checkIsActive(pathname, item)}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
            <ChevronRight className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={4}
          className="min-w-48"
        >
          <DropdownMenuLabel>{t(item.labelKey)}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((subItem) => (
            <DropdownMenuItem
              key={subItem.id}
              asChild
              className={
                checkIsActive(pathname, subItem) ? "bg-accent" : undefined
              }
            >
              <Link href={subItem.href} onClick={() => setOpenMobile(false)}>
                {subItem.icon}
                <span>{t(subItem.labelKey)}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function checkIsActive(pathname: string, item: AdminNavItem) {
  if ("items" in item) {
    return item.items.some((subItem) => pathname === subItem.href);
  }
  return pathname === item.href;
}
