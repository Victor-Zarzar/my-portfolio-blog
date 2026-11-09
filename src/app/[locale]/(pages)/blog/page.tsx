import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { pageMetadata } from "@/app/shared/helpers/seo";
import type { PageProps } from "@/app/shared/types/post/post";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import GridSection from "@/app/shared/wrapper/grid-wrapper";
import LoadingSkeleton from "@/app/widgets/loading-skeleton/loading-skeleton";
import NewsletterSection from "@/app/widgets/newsletter-section/newsletter-section";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/db/queries/blog";
import BlogContent from "./blog-content";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return pageMetadata(locale, "/blog", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("Blog");
  const posts = await getAllPosts(locale);

  return (
    <main>
      <GridSection>
        <FadeWrapper>
          <h1 className="title-articles mb-4 text-center text-3xl font-extrabold leading-10 tracking-tight md:text-4xl">
            {t("h1")}
          </h1>
        </FadeWrapper>

        <h2 className="title-skills mb-10 mt-4 text-center text-sm font-extrabold leading-10 tracking-tight md:text-2xl">
          {t("h2")}
        </h2>

        <Suspense fallback={<LoadingSkeleton />}>
          <BlogContent locale={locale} posts={posts} />
        </Suspense>
      </GridSection>

      <GridSection hatched>
        <NewsletterSection />
      </GridSection>
    </main>
  );
}
