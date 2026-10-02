import { getTranslations } from "next-intl/server";
import { TagForm } from "@/app/features/tags-columns/tag-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";

export default async function NewTagPage() {
  const t = await getTranslations("dashboard.tags.form");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <FadeWrapper>
        <h1 className="mb-8 text-center text-2xl font-bold">{t("title")}</h1>
      </FadeWrapper>

      <TagForm />
    </div>
  );
}
