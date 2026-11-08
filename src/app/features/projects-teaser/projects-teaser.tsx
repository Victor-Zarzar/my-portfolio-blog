import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/app/shared/ui/card";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import GitHubActivity from "@/app/widgets/github-activity/github-activity";
import { Link } from "@/i18n/navigation";
import { getProjects } from "@/lib/github";

export default async function ProjectsTeaser() {
  const t = await getTranslations("ProjectsTeaser");
  const repos = (await getProjects()) ?? [];

  const top = repos
    .filter((r) => r.description)
    .sort((a, b) => b.stargazerCount - a.stargazerCount)
    .slice(0, 3);

  return (
    <section className="w-full max-w-6xl mx-auto space-y-8">
      <FadeWrapper>
        <h2 className="title-projects text-center font-extrabold tracking-tight text-3xl md:text-4xl">
          {t("h2")}
        </h2>
      </FadeWrapper>

      <GitHubActivity />

      <div className="grid gap-4 md:grid-cols-3">
        {top.map((repo) => (
          <Card key={repo.url}>
            <CardContent className="p-5">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline underline-offset-4"
              >
                {repo.name}
              </a>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                {repo.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                {repo.stargazerCount}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/projects"
          className="text-sm hover:underline underline-offset-4"
        >
          {t("cta")} →
        </Link>
      </div>
    </section>
  );
}
