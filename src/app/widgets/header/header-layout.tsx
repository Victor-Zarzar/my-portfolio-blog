"use client";

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
    <>
      <header className="flex flex-col text-center items-center justify-center py-0 sm:py-32 md:py-20 md:flex-row md:space-x-4 md:text-left">
        <div className="relative mb-6 w-40 h-40 md:w-72 md:h-72 sm:mb-0">
          <Image
            src={profile.image.src}
            alt={profile.image.alt}
            height={500}
            width={500}
            sizes={profile.image.sizes}
            priority
            quality={profile.image.quality}
            className="rounded-full"
            placeholder="blur"
            blurDataURL={profile.image.blurDataURL}
          />
        </div>

        <section className="md:mt-2 md:w-3/5 md:ml-8">
          <>
            <FadeWrapper>
              <h1 className="text-4xl font-bold mt-6 md:mt-0 md:text-5xl">
                {t("h1")}
              </h1>

              <h2 className="text-lg mt-4 md:text-xl">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  {t("h2")}
                </span>
              </h2>

              <p className="mt-1 mb-6 text-lg md:text-xl max-w-lg">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  {t("span")}
                </span>
              </p>
            </FadeWrapper>

            <nav className="mt-4 flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-start">
              {profile.links.map((link) => {
                const Icon = ICON_MAP[link.icon];

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-32"
                  >
                    <Button
                      className="w-full bg-neutral-800 dark:bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 hover:text-white"
                      variant="secondary"
                    >
                      <Icon className="mr-1 text-white" />
                      {link.label}
                    </Button>
                  </a>
                );
              })}
            </nav>
          </>
        </section>
      </header>

      <div className="flex items-center justify-center mt-20 md:mt-10">
        <HiArrowCircleDown size={40} className="animate-bounce" />
      </div>
    </>
  );
}
