import { desc } from "drizzle-orm";
import { FileCheck2, FileText, Text } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  const [allPosts, recentPosts] = await Promise.all([
    db.query.posts.findMany({ columns: { id: true, publishedAt: true } }),
    db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 5,
      with: {
        translations: {
          where: (t, { eq }) => eq(t.locale, "en"),
          columns: { title: true },
        },
      },
    }),
  ]);

  const published = allPosts.filter((p) => p.publishedAt).length;
  const drafts = allPosts.length - published;
  const t = await getTranslations("dashboard");

  const cards = [
    {
      title: t("stats.totalPosts"),
      value: allPosts.length,
      icon: FileText,
    },
    {
      title: t("stats.published"),
      value: published,
      icon: FileCheck2,
    },
    {
      title: t("stats.drafts"),
      value: drafts,
      icon: Text,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center mb-8">
        <FadeWrapper>
          <h1 className=" text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </FadeWrapper>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("recentPosts.title")}</h2>
        <Link
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:underline"
        >
          {t("recentPosts.viewAll")}
        </Link>
      </div>
      <ul className="space-y-2">
        {recentPosts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/posts/${post.id}`}
              className="text-sm hover:underline text-foreground"
            >
              {post.translations[0]?.title ?? "recentPosts.untitled"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
