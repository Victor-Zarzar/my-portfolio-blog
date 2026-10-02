import type { ReactNode } from "react";

export type CommandLink = {
  id: string;
  labelKey: string;
  href: string;
  icon: ReactNode;
};

export type AdminNavLink = CommandLink;

export type AdminNavCollapsible = {
  id: string;
  labelKey: string;
  icon: ReactNode;
  items: CommandLink[];
};

export type AdminNavItem = AdminNavLink | AdminNavCollapsible;
