"use client";

import * as Sentry from "@sentry/nextjs";
import { CookieIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CookieConsentProps } from "@/app/shared/types/cookies/cookies";
import { Button } from "@/app/shared/ui/button";
import { cn } from "@/lib/utils";

export default function CookieConsentComponent({
  demo = false,
  onAcceptAction,
  onDeclineAction,
}: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hide, setHide] = useState(false);

  const t = useTranslations("Cookies");

  function setCookie(name: string, value: string, days = 180) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const attributes: string[] = [
      `expires=${date.toUTCString()}`,
      "path=/",
      "SameSite=Strict",
    ];

    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      attributes.push("Secure");
    }

    document.cookie = `${name}=${encodeURIComponent(value)}; ${attributes.join("; ")}`;
  }

  function accept() {
    setIsOpen(false);
    setCookie("cookieConsent", "true");
    localStorage.setItem("cookieConsent", "true");
    setTimeout(() => {
      setHide(true);
    }, 180);
    onAcceptAction?.();
  }

  function decline() {
    setIsOpen(false);
    setCookie("cookieConsent", "declined");
    localStorage.setItem("cookieConsent", "declined");
    setTimeout(() => {
      setHide(true);
    }, 180);
    onDeclineAction?.();
  }

  useEffect(() => {
    try {
      setIsOpen(true);
      const cookies = document.cookie;
      if (
        cookies.includes("cookieConsent=true") ||
        cookies.includes("cookieConsent=declined")
      ) {
        if (!demo) {
          setIsOpen(false);
          setTimeout(() => {
            setHide(true);
          }, 700);
        }
      }
    } catch (error) {
      toast.error(t("error"));
      Sentry.captureException(error);
    }
  }, [demo, t]);

  return (
    <div
      className={cn(
        "fixed z-200 bottom-0 right-0 sm:right-4 sm:bottom-4 w-full sm:max-w-md duration-700",
        !isOpen
          ? "transition-[opacity,transform] translate-y-8 opacity-0"
          : "transition-[opacity,transform] translate-y-0 opacity-100",
        hide && "hidden",
      )}
    >
      <div className="dark:bg-stone-950 bg-gray-50 border-black dark:border-gray-200 rounded-md m-3 border shadow-lg">
        <div className="grid gap-2">
          <div className="border-b h-14 flex items-center justify-between p-4 border-black dark:border-gray-200">
            <p className="text-lg font-medium">{t("title")}</p>
            <CookieIcon className="h-[1.2rem] w-[1.2rem]" />
          </div>
          <div className="p-4">
            <p className="text-sm font-normal text-start">
              {t("message")} <br />
              <Link
                href="/privacypolicy"
                className="dark:text-blue-400 text-blue-600 underline"
              >
                {t("privacyLink")}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 p-4 py-5 border-t dark:bg-background/20 border-black dark:border-gray-200">
            <Button onClick={accept} className="w-full">
              {t("accept")}
            </Button>
            <Button
              onClick={decline}
              className="w-full bg-gray-300 hover:bg-gray-400"
              variant="secondary"
            >
              {t("decline")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
