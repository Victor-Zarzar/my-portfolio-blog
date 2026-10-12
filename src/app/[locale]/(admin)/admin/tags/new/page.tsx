import { Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TagForm } from "@/app/features/tags-columns/tag-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";

export default async function NewTagPage() {
  const t = await getTranslations("dashboard.tags");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <FadeWrapper>
        <AdminPageHeader
          icon={Tag}
          title={t("new")}
          description={t("newDescription")}
        />
      </FadeWrapper>
      <TagForm />
    </div>
  );
}
