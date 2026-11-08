import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HiArrowRight } from "react-icons/hi";
import {
  calculateReadingTime,
  formatReadingTime,
} from "@/app/shared/helpers/reading-time";
import type {
  BlogContentProps,
  BlogListItem,
} from "@/app/shared/types/post/post";
import { Card, CardContent } from "@/app/shared/ui/card";
import { HeroImageClient } from "@/app/shared/wrapper/hero-image-client";

export default async function BlogContent({ locale, posts }: BlogContentProps) {
  const t = await getTranslations("Blog");

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
      {posts.map((post, index) => (
        <ActionCard
          key={post.slug}
          post={post}
          locale={locale}
          t={t}
          priority={index < 2}
        />
      ))}
    </div>
  );
}

function ArticleDescription({ description }: { description: string }) {
  return (
    <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
      {description}
    </div>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-xs rounded-full bg-neutral-800 dark:bg-neutral-800 border border-neutral-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ActionCard({
  post,
  locale,
  t,
  priority,
}: {
  post: BlogListItem;
  locale: string;
  t: (key: string) => string;
  priority?: boolean;
}) {
  const readingTime = calculateReadingTime(post.content || post.description);
  const formattedReadingTime = formatReadingTime(readingTime, locale);

  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="h-full">
      <Card className="group h-full overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          {post.photo ? (
            <div className="relative aspect-video w-full overflow-hidden">
              <HeroImageClient
                src={post.photo}
                alt={post.title}
                priority={priority}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-5">
            <div className="flex-1">
              <h2 className="text-lg font-semibold leading-tight">
                {post.title}
              </h2>

              <div className="mt-2 flex justify-end text-xs text-neutral-500 dark:text-neutral-400">
                <p>{formattedReadingTime}</p>
              </div>

              {publishedDate ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  {publishedDate}
                </p>
              ) : null}

              <ArticleDescription description={post.description} />
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 text-white">
              <div className="min-w-0 flex flex-wrap gap-2 overflow-hidden">
                <Tags tags={post.tags?.slice(0, 3)} />

                {post.tags && post.tags.length > 3 ? (
                  <span className="px-3 py-1 text-xs  rounded-full bg-neutral-800 border border-neutral-700">
                    +{post.tags.length - 3}
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2 text-sm text-stone-950 dark:text-stone-50">
                <span className="leading-none whitespace-nowrap">{t("p")}</span>
                <HiArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
