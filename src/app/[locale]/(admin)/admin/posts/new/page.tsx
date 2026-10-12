import { FilePlus2 } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { PostForm } from "@/app/features/post-form/post-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schemas";

export default async function NewPostPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const availableTags = await db.select().from(tags);
  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <FadeWrapper>
        <AdminPageHeader
          icon={FilePlus2}
          title={t("posts.new")}
          description={t("posts.newDescription")}
        />
      </FadeWrapper>

      <PostForm authorId={session!.user.id} availableTags={availableTags} />
    </div>
  );
}
