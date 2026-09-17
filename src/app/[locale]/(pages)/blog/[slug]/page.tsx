import type { Metadata } from "next";
import type { ImageProps } from "next/image";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { PostAuthor } from "@/app/features/post-author/post-author";
import { Tags } from "@/app/features/tags-blog/tags-blog";
import type {
  MdxAnchorProps,
  MdxCodeProps,
  MdxHeadingProps,
  MdxImgProps,
  MdxLiProps,
  MdxOlProps,
  MdxParagraphProps,
  MdxPreProps,
  MdxUlProps,
  PageProps,
} from "@/app/shared/types/post/post";
import { HeroImageClient } from "@/app/shared/wrapper/hero-image-client";
import env from "@/env";
import { getAllPostsForSitemap, getPostBySlug } from "@/lib/db/queries/blog";

const components = {
  h1: (props: MdxHeadingProps) => (
    <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: MdxHeadingProps) => (
    <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />
  ),
  h3: (props: MdxHeadingProps) => (
    <h3 className="text-2xl font-bold mt-4 mb-2" {...props} />
  ),
  p: (props: MdxParagraphProps) => <p className="mb-4 leading-7" {...props} />,
  ul: (props: MdxUlProps) => <ul className="list-disc ml-6 mb-4" {...props} />,
  ol: (props: MdxOlProps) => (
    <ol className="list-decimal ml-6 mb-4" {...props} />
  ),
  li: (props: MdxLiProps) => <li className="mb-2" {...props} />,
  a: (props: MdxAnchorProps) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    />
  ),
  code: (props: MdxCodeProps) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
      {...props}
    />
  ),
  pre: (props: MdxPreProps) => (
    <pre
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"
      {...props}
    />
  ),
  img: ({ src, alt }: MdxImgProps) => {
    if (!src) {
      return null;
    }

    const imageSrc = src as ImageProps["src"];

    return (
      <Image
        src={imageSrc}
        width={800}
        height={400}
        className="rounded-lg my-4"
        alt={alt ?? "Blog image"}
      />
    );
  },
};

export async function generateStaticParams() {
  const posts = await getAllPostsForSitemap();
  return posts.map((post) => ({
    locale: post.locale,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);

  if (!post) {
    return {};
  }

  const { title, description, publishedAt, photo, tags } = post.metadata;

  const canonical = `${env.NEXT_PUBLIC_WEBSITE_URL}/${locale}/blog/${slug}`;
  const ogImage =
    photo && photo.startsWith("http")
      ? photo
      : `${env.NEXT_PUBLIC_WEBSITE_URL}${photo ?? ""}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    keywords: tags,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: publishedAt
        ? new Date(publishedAt).toISOString()
        : undefined,
      url: canonical,
      images: photo ? [{ url: ogImage }] : [],
      tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);

  const t = await getTranslations({
    locale,
    namespace: "Blog",
  });

  if (!post) {
    notFound();
  }

  const publishedDate = post.metadata.publishedAt
    ? new Date(post.metadata.publishedAt)
    : null;

  const imageUrl = post.metadata.photo?.startsWith("http")
    ? post.metadata.photo
    : `${env.NEXT_PUBLIC_WEBSITE_URL}${post.metadata.photo ?? ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.description,
    image: imageUrl,
    url: `${env.NEXT_PUBLIC_WEBSITE_URL}/${locale}/blog/${slug}`,
    datePublished: post.metadata.publishedAt
      ? new Date(post.metadata.publishedAt).toISOString()
      : undefined,
    dateModified: post.metadata.updatedAt
      ? new Date(post.metadata.updatedAt).toISOString()
      : undefined,
    author: {
      "@type": "Person",
      name: "Victor Zarzar",
      url: env.NEXT_PUBLIC_WEBSITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Victor Zarzar",
    },
    keywords: post.metadata.tags?.join(", "),
    inLanguage: locale,
  };

  return (
    <article className="container max-w-5xl mx-auto px-4 py-3 md:py-4">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <header className="mb-8">
        {post.metadata.photo ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-6">
            <HeroImageClient
              src={post.metadata.photo}
              alt={post.metadata.title}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 896px, 896px"
            />
          </div>
        ) : null}

        {publishedDate ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            {publishedDate.toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        ) : null}

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {post.metadata.title}
        </h1>

        <p className="text-xl text-neutral-600 dark:text-neutral-300">
          {post.metadata.description}
        </p>

        <div className="flex flex-col gap-5 mt-6">
          <Tags tags={post.metadata.tags} />

          <PostAuthor
            name={t("author")}
            profession={t("profession")}
            avatar="/static/profile.jpg"
          />
        </div>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  );
}
