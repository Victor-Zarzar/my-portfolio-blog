"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LangToggleModal() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const en = "/static/en.svg";
  const es = "/static/es.svg";
  const pt = "/static/pt.svg";

  const LOCALES: Array<{ value: string; label: string; image: string }> = [
    { value: "en", label: t("english"), image: en },
    { value: "es", label: t("spanish"), image: es },
    { value: "pt", label: t("portuguese"), image: pt },
  ];

  function onSelectChange(newLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <Select
      disabled={isPending}
      onValueChange={onSelectChange}
      defaultValue={locale}
    >
      <SelectTrigger className="w-auto dark:bg-stone-950 bg-[#ffffff]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="dark:bg-stone-950 bg-[#ffffff]">
        {LOCALES.map((locale) => (
          <SelectItem key={locale.value} value={locale.value}>
            <div className="flex items-center gap-2">
              <Image
                src={locale.image}
                alt={locale.label}
                width={20}
                height={20}
              />
              {locale.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
