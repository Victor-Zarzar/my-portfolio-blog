import {
  AiOutlineFacebook,
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineLinkedin,
} from "react-icons/ai";
import { BiLogoDevTo } from "react-icons/bi";
import { SiMedium } from "react-icons/si";
import { SITE_NAME, SOCIAL_LINKS } from "@/app/shared/config/app-config";
import type { SocialLink } from "@/app/shared/types/social/social";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks: SocialLink[] = [
    {
      icon: AiOutlineGithub,
      href: SOCIAL_LINKS.github,
      label: "GitHub",
      size: 26,
    },
    {
      icon: BiLogoDevTo,
      href: SOCIAL_LINKS.devto,
      label: "Dev.to",
      size: 28,
    },
    {
      icon: SiMedium,
      href: SOCIAL_LINKS.medium,
      label: "Medium",
      size: 21,
    },
    {
      icon: AiOutlineLinkedin,
      href: SOCIAL_LINKS.linkedin,
      label: "LinkedIn",
      size: 27,
    },
    {
      icon: AiOutlineInstagram,
      href: SOCIAL_LINKS.instagram,
      label: "Instagram",
      size: 28,
    },
    {
      icon: AiOutlineFacebook,
      href: SOCIAL_LINKS.facebook,
      label: "Facebook",
      size: 27,
    },
  ];

  return (
    <footer className="container-footer mx-auto max-w-3xl px-4 sm:px-6 md:max-w-5xl mt-20 md:mt-40">
      <hr className="w-full h-0.5 mx-auto mt-0 bg-neutral-400 dark:border-b dark:border-stone-200 border-0" />

      <div className="p-4 flex flex-col text-center md:flex-row md:justify-between">
        <div className="flex flex-row items-center justify-center space-x-1">
          <span>
            © {currentYear} {SITE_NAME}
          </span>
        </div>

        <div className="flex flex-row items-center justify-center space-x-2 mb-1 mt-2 md:mt-0">
          {socialLinks.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:-translate-y-1 transition-transform"
              aria-label={social.label}
            >
              <social.icon size={social.size ?? 28} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
