import { Bug, GitBranch, GitCommit, GitPullRequest, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { VscGithub } from "react-icons/vsc";
import { Card, CardContent } from "@/app/shared/ui/card";
import SeeAllProjects from "@/app/widgets/seall-projects/see-all-projects";
import { Link } from "@/i18n/navigation";
import { getProjects, getStats } from "@/lib/github";

export default async function ProjectsContent({ locale }: { locale: string }) {
  const nf = new Intl.NumberFormat(locale);

  const [stats, reposRaw, t] = await Promise.all([
    getStats(),
    getProjects(),
    getTranslations({ locale, namespace: "Projects" }),
  ]);

  if (!stats || !reposRaw || !t) {
    notFound();
  }

  const repos = reposRaw.filter(
    (r) =>
      r.description ||
      r.homepageUrl ||
      r.topics.length > 0 ||
      r.stargazerCount > 0,
  );

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardContent className="p-6">
            <h2 className="font-semibold text-base mb-4">{t("titleCard")}</h2>

            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <StatRow
                icon={<Star className="h-4 w-4 text-yellow-500" />}
                label={t("totalStars")}
                value={nf.format(stats.stars)}
              />
              <StatRow
                icon={<GitCommit className="h-4 w-4" />}
                label={t("totalCommits")}
                value={nf.format(stats.totalCommits)}
              />
              <StatRow
                icon={<GitPullRequest className="h-4 w-4 text-indigo-500" />}
                label={t("totalPrs")}
                value={nf.format(stats.prs)}
              />
              <StatRow
                icon={<Bug className="h-4 w-4 text-rose-500" />}
                label={t("totalIssues")}
                value={nf.format(stats.issues)}
              />
              <StatRow
                icon={<GitBranch className="h-4 w-4 text-emerald-500" />}
                label={t("contributedTo")}
                value={nf.format(stats.contributions)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-6">
            <h2 className="font-semibold text-base mb-4">
              {t("topLanguages")}
            </h2>

            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {stats.topLanguages.map((l) => (
                <div key={l.name} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: l.color ?? "currentColor",
                        opacity: 0.9,
                      }}
                      aria-hidden="true"
                    />
                    <span>{l.name}</span>
                  </span>
                  <span className="tabular-nums">{nf.format(l.count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {repos.map((repo) => (
        <Card key={repo.url} className="w-full max-w-3xl h-auto mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-lg hover:underline underline-offset-4"
                >
                  {repo.name}
                </a>

                {repo.description ? (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {repo.description}
                  </p>
                ) : null}

                {repo.topics?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repo.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center rounded-full text-white px-2.5 py-1 text-xs font-medium bg-neutral-800
                        dark:bg-neutral-800 border border-neutral-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {repo.primaryLanguage?.name ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            repo.primaryLanguage?.color ?? "currentColor",
                          opacity: 0.9,
                        }}
                        aria-hidden="true"
                      />
                      <span>{repo.primaryLanguage.name}</span>
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{nf.format(repo.stargazerCount)}</span>
                  </span>

                  {repo.homepageUrl ? (
                    <Link
                      href={repo.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline underline-offset-4"
                    >
                      {t("repo")}
                    </Link>
                  ) : null}
                </div>
              </div>

              <Link
                href={repo.url}
                target="blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <VscGithub className="default-transition default-focus relative inline-flex h-10 w-10" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      <SeeAllProjects />
    </div>
  );
}

function StatRow(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="inline-flex items-center gap-2">
        {props.icon}
        <span>{props.label}</span>
      </span>
      <span className="tabular-nums font-medium">{props.value}</span>
    </div>
  );
}
