import * as Sentry from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, WEBSITE_URL } from "@/app/shared/config/app-config";
import { confirmSubscription } from "@/lib/newsletter/subscribers";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  let result: { locale: string } | null = null;

  try {
    result = token ? await confirmSubscription(token) : null;
  } catch (error) {
    Sentry.captureException(error);
  }

  const locale = result?.locale ?? DEFAULT_LOCALE;
  const status = result ? "confirmed" : "invalid";

  return NextResponse.redirect(
    new URL(`/${locale}/blog?newsletter=${status}`, WEBSITE_URL),
  );
}
