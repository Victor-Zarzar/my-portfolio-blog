"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NewsletterStatus() {
  const t = useTranslations("Newsletter");
  const params = useSearchParams();
  const status = params.get("newsletter");

  useEffect(() => {
    if (status === "confirmed") {
      toast.success(t("confirmed"));
    } else if (status === "invalid") {
      toast.error(t("invalid"));
    } else {
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
  }, [status, t]);

  return null;
}
