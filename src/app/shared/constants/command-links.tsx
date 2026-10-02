import {
  BarChart,
  BookOpen,
  ChartNoAxesCombined,
  FolderKanban,
  Gauge,
  Home,
  LayoutDashboard,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import type {
  AdminNavItem,
  CommandLink,
} from "@/app/shared/types/command/command";

const iconClass = "mr-0.5 h-4 w-4";

export const publicCommandLinks: CommandLink[] = [
  {
    id: "home",
    labelKey: "nav.home",
    href: "/",
    icon: <Home className={iconClass} />,
  },
  {
    id: "about",
    labelKey: "nav.about",
    href: "/about",
    icon: <User className={iconClass} />,
  },
  {
    id: "projects",
    labelKey: "nav.projects",
    href: "/projects",
    icon: <FolderKanban className={iconClass} />,
  },
  {
    id: "blog",
    labelKey: "nav.blog",
    href: "/blog",
    icon: <BookOpen className={iconClass} />,
  },
  {
    id: "contact",
    labelKey: "nav.contact",
    href: "/contact",
    icon: <Mail className={iconClass} />,
  },
];

export const adminNavigation: AdminNavItem[] = [
  {
    id: "dashboard",
    labelKey: "nav.dashboard",
    href: "/admin",
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    id: "posts",
    labelKey: "nav.posts.index",
    href: "/admin/posts",
    icon: <Users className={iconClass} />,
  },
  {
    id: "posts-new",
    labelKey: "nav.posts.new",
    href: "/admin/posts/new",
    icon: <FolderKanban className={iconClass} />,
  },
  {
    id: "posts-tags",
    labelKey: "nav.posts.tags",
    href: "/admin/tags",
    icon: <Shield className={iconClass} />,
  },
  {
    id: "tags-new",
    labelKey: "nav.tags.new",
    href: "/admin/tags/new",
    icon: <FolderKanban className={iconClass} />,
  },
  {
    id: "analytics",
    labelKey: "nav.analytics.title",
    icon: <BarChart className={iconClass} />,
    items: [
      {
        id: "analytics-overview",
        labelKey: "nav.analytics.overview",
        href: "/admin/analytics",
        icon: <Gauge className={iconClass} />,
      },
      {
        id: "analytics-traffic",
        labelKey: "nav.analytics.traffic",
        href: "/admin/analytics/traffic",
        icon: <ChartNoAxesCombined className={iconClass} />,
      },
      {
        id: "analytics-security",
        labelKey: "nav.analytics.security",
        href: "/admin/analytics/security",
        icon: <ShieldCheck className={iconClass} />,
      },
    ],
  },
];

export const adminCommandLinks: CommandLink[] = adminNavigation.flatMap(
  (item) => ("items" in item ? item.items : [item]),
);
