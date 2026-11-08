import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/app/shared/ui/card";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { env } from "@/env/server";
import { getContributions } from "@/lib/github";
import { Calendar } from "./calendar";

export default async function GitHubActivity() {
  const [github, locale, t] = await Promise.all([
    getContributions(),
    getLocale(),
    getTranslations("GitHubActivity"),
  ]);

  if (!github || github.days.length === 0) {
    return null;
  }

  const { days, total } = github;
  const size = Math.ceil(days.length / 4);

  const quarters = [2, 3, 0, 1].flatMap((i) => {
    const data = days.slice(i * size, (i + 1) * size);
    const first = data[0];
    return first ? [{ key: first.date, data, recent: i >= 2 }] : [];
  });

  return (
    <FadeWrapper>
      <Card className="relative grid grid-cols-1 gap-0.5 overflow-hidden rounded-lg border border-neutral-800 py-6 sm:p-8 xl:grid-cols-2 **:scrollbar-none [&_*::-webkit-scrollbar]:hidden">
        {quarters.map(({ key, data, recent }) => (
          <div
            key={key}
            className={`min-w-0 justify-center ${recent ? "flex" : "hidden xl:flex"}`}
          >
            <Calendar
              data={data}
              blockSize={9}
              blockMargin={3}
              showColorLegend={false}
              showTotalCount={false}
              showMonthLabels={false}
            />
          </div>
        ))}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-full bg-linear-to-b from-transparent to-white dark:to-neutral-950 lg:bottom-8 lg:h-40"
          aria-hidden="true"
        />
        <a
          href={`https://github.com/${env.GH_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-neutral-500 hover:underline underline-offset-4 dark:text-neutral-400"
        >
          {t("contributions", {
            count: new Intl.NumberFormat(locale).format(total),
          })}{" "}
          🔥
        </a>
      </Card>
    </FadeWrapper>
  );
}
