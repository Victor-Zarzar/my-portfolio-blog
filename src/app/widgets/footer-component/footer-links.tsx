import { getTranslations } from "next-intl/server";
import {
  AiOutlineFacebook,
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineLinkedin,
} from "react-icons/ai";
import { BiLogoDevTo } from "react-icons/bi";
import { SiMedium } from "react-icons/si";
import { SOCIAL_LINKS } from "@/app/shared/config/app-config";
import type { SocialLink } from "@/app/shared/types/social/social";
import { Link } from "@/i18n/navigation";
import { getProjects } from "@/lib/github";

const socialLinks: SocialLink[] = [
  { icon: AiOutlineGithub, href: SOCIAL_LINKS.github, label: "GitHub" },
  { icon: BiLogoDevTo, href: SOCIAL_LINKS.devto, label: "Dev.to" },
  { icon: SiMedium, href: SOCIAL_LINKS.medium, label: "Medium" },
  { icon: AiOutlineLinkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
  {
    icon: AiOutlineInstagram,
    href: SOCIAL_LINKS.instagram,
    label: "Instagram",
  },
  { icon: AiOutlineFacebook, href: SOCIAL_LINKS.facebook, label: "Facebook" },
];

const linkClass =
  "transition-colors hover:text-black hover:underline underline-offset-4 dark:hover:text-white";

export default async function FooterLinks() {
  const [t, nav, repos] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Navbar"),
    getProjects(),
  ]);

  const pages = [
    { href: "/", label: nav("home") },
    { href: "/about", label: nav("about") },
    { href: "/projects", label: nav("projects") },
    { href: "/blog", label: nav("blog") },
    { href: "/contact", label: nav("contact") },
  ] as const;

  const projects = repos
    .filter((r) => r.description)
    .sort((a, b) => b.stargazerCount - a.stargazerCount)
    .slice(0, 5);

  return (
    <div className="grid gap-8 text-sm text-neutral-600 dark:text-neutral-400 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-5">
        <h3 className="font-medium text-black dark:text-white">{t("pages")}</h3>
        <ul className="flex flex-col gap-3">
          {pages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className={linkClass}>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="font-medium text-black dark:text-white">
          <Link href="/projects" className="hover:underline underline-offset-4">
            {t("projects")}
          </Link>
        </h3>
        <ul className="flex flex-col gap-3">
          {projects.map((repo) => (
            <li key={repo.url}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {repo.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="font-medium text-black dark:text-white">
          {t("social")}
        </h3>
        <ul className="flex flex-col gap-3">
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 ${linkClass}`}
              >
                <social.icon size={16} aria-hidden="true" />
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
