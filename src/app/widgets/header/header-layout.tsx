import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowCircleDown } from "react-icons/hi";
import { getProfileData } from "@/app/shared/data/getProfileData";
import { Button } from "@/app/shared/ui/button";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

const ICON_MAP = {
  github: FaGithub,
  linkedin: FaLinkedin,
};

export default function Header() {
  const t = useTranslations("Header");
  const profile = getProfileData();

  return (
    <div data-testid="hero" className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:gap-12 md:text-left">
        <Image
          src={profile.image.src}
          alt={profile.image.alt}
          height={500}
          width={500}
          sizes={profile.image.sizes}
          quality={profile.image.quality}
          placeholder="blur"
          blurDataURL={profile.image.blurDataURL}
          priority
          className="h-40 w-40 shrink-0 rounded-full object-cover md:h-72 md:w-72"
        />
        <div className="max-w-xl">
          <FadeWrapper>
            <h1 className="text-4xl font-bold md:text-5xl">{t("h1")}</h1>
            <h2 className="mt-4 text-lg font-semibold text-neutral-600 dark:text-neutral-400 md:text-xl">
              {t("h2")}
            </h2>
            <p className="mt-1 text-lg font-semibold text-neutral-600 dark:text-neutral-400 md:text-xl">
              {t("span")}
            </p>
          </FadeWrapper>
          <nav className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            {profile.links.map((link) => {
              const Icon = ICON_MAP[link.icon];
              return (
                <Button
                  key={link.label}
                  asChild
                  variant="secondary"
                  className="w-32 border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="mr-1" />
                    {link.label}
                  </a>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
      <HiArrowCircleDown
        size={40}
        className="animate-bounce"
        aria-hidden="true"
      />
    </div>
  );
}
