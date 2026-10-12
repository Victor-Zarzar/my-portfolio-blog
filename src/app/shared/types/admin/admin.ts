import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AdminUser = {
  name: string;
  email: string;
  image?: string | null;
};

export type AdminSidebarProps = {
  user: AdminUser;
};

export type AdminUserMenuProps = {
  user: AdminUser;
  compact?: boolean;
};

export type AdminProfileMenuProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export type AdminPageHeaderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
};
