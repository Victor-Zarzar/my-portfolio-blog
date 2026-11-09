import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import * as z from "zod";
import { LOCALES } from "@/app/shared/config/app-config";
import { env } from "@/env/server";
import { subscribe } from "@/lib/newsletter/subscribers";

const schema = z.object({
  email: z.email().max(254),
  locale: z.enum(LOCALES),
});

async function verifyCaptcha(token: string | null) {
  if (!token) {
    return false;
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: token,
    }),
  });

  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    action?: string;
  };

  return (
    data.success &&
    (data.score ?? 0) >= 0.5 &&
    data.action === "newsletter_subscribe"
  );
}

export async function POST(request: Request) {
  const captcha = request.headers.get("x-captcha-response");

  if (!(await verifyCaptcha(captcha))) {
    return NextResponse.json({ error: "captcha" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    await subscribe(parsed.data);
    // resposta idêntica para e-mail novo, pendente ou já confirmado
    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
