import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/app/shared/ui/card";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { Link } from "@/i18n/navigation";

const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "FastAPI",
  "Flutter",
];
const FLAGS = ["en", "pt", "es"] as const;

export default async function AboutTeaser() {
  const t = await getTranslations("AboutTeaser");

  return (
    <section className="w-full max-w-6xl mx-auto space-y-8">
      <FadeWrapper>
        <h2 className="title-about text-center font-extrabold tracking-tight text-3xl md:text-4xl">
          {t("h2")}
        </h2>
      </FadeWrapper>

      <FadeWrapper>
        <Card>
          <CardContent className="p-6 md:p-8">
            <p className="mt-4 text-center text-sm md:text-lg font-medium leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t("p")}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Highlight value="2009 → 2022" label={t("since")} />
              <Highlight value="Full Stack" label={t("focus")} />
              <Highlight
                label={t("languages")}
                value={
                  <span className="flex items-center justify-center gap-2">
                    {FLAGS.map((l) => (
                      <Image
                        key={l}
                        src={`/static/${l}.svg`}
                        alt={l}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                    ))}
                  </span>
                }
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {STACK.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-white"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
              >
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeWrapper>
    </section>
  );
}

function Highlight(props: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
      <div className="text-xl font-bold tracking-tight">{props.value}</div>
      <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
        {props.label}
      </div>
    </div>
  );
}
