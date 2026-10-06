import type { ReactNode } from "react";

export type CommandLink = {
  id: string;
  href: string;
  labelKey: string;
  keywords?: string;
  icon?: ReactNode;
};

export type CommandPaletteProps = {
  links: CommandLink[];
  showSettings?: boolean;
};

export type AdminNavLink = CommandLink;

export type AdminNavCollapsible = {
  id: string;
  labelKey: string;
  icon: ReactNode;
  items: CommandLink[];
};

export type AdminNavItem = AdminNavLink | AdminNavCollapsible;
