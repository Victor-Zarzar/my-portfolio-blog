import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/app/shared/helpers/seo";
import Skills from "@/app/shared/ui/icons/skills/skills";
import Header from "@/app/widgets/header/header-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Layout" });

  return pageMetadata(locale, "", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <Header />
      <Skills />
    </main>
  );
}
