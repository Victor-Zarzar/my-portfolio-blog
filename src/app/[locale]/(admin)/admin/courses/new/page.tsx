import { FilePlus2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CoursesForm } from "@/app/features/courses/courses-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";

export default async function NewCoursesPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <FadeWrapper>
        <AdminPageHeader
          icon={FilePlus2}
          title={t("courses.new")}
          description={t("courses.newDescription")}
        />
      </FadeWrapper>

      <CoursesForm />
    </div>
  );
}
