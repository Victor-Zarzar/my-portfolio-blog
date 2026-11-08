"use client";

import { useTranslations } from "next-intl";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import CardSkills from "@/app/widgets/card-skills/card-skills";

export default function Skills() {
  const t = useTranslations("Skills");

  return (
    <section className="w-full max-w-6xl mx-auto space-y-8">
      <header className="text-center mb-20">
        <FadeWrapper>
          <h2 className="title-skills mb-4 font-extrabold leading-10 tracking-tight text-3xl md:text-4xl">
            {t("h1")}
          </h2>
        </FadeWrapper>
        <p className="text-sm leading-relaxed mx-auto md:text-2xl lg:text-2xl font-semibold tracking-tighter">
          {t("p")}
        </p>
      </header>
      <CardSkills />
    </section>
  );
}
