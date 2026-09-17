"use client";

import type { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import env from "@/env";

export default function SignInLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY!}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
