import type { Metadata } from "next/types";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { pageMetadata } from "@/app/shared/helpers/seo";
import type { PageProps } from "@/app/shared/types/post/post";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import LoadingSkeleton from "@/app/widgets/loading-skeleton/loading-skeleton";
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
    <main className="container-articles">
      <section className="col-span-4 mx-auto">
        <header className="h1 p-6">
          <FadeWrapper>
            <h1 className="title-articles mb-4 font-extrabold leading-10 tracking-tight text-3xl md:text-4xl text-center mt-6 md:mt-10">
              {t("h1")}
            </h1>
          </FadeWrapper>
        </header>
      </section>

      <section className="my-4 mt-8 md:mt-6">
        <h2 className="title-skills font-extrabold leading-10 tracking-tight text-sm md:text-2xl lg:text-2xl mt-8 md:mt-4 mb-8 text-center">
          {t("h2")}
        </h2>
      </section>

      <Suspense fallback={<LoadingSkeleton />}>
        <BlogContent locale={locale} posts={posts} />
      </Suspense>
    </main>
  );
}
