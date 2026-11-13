import { and, eq, ne } from "drizzle-orm";
import { WEBSITE_URL } from "@/app/shared/config/app-config";
import { db } from "@/lib/db";
import { subscribers } from "../db/schemas/subscribers";
import { sendNewsletterConfirmationEmail } from "../email/send-newsletter-confirmation-email";
import { createToken, hashToken } from "./tokens";

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

export async function subscribe({
  email,
  locale,
}: {
  email: string;
  locale: string;
}) {
  const normalized = email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, normalized))
    .limit(1);

  if (existing?.status === "confirmed") {
    return;
  }

  const inCooldown =
    existing?.status === "pending" &&
    existing.confirmSentAt &&
    Date.now() - existing.confirmSentAt.getTime() < RESEND_COOLDOWN_MS;

  if (inCooldown) {
    return;
  }

  const { token, hash } = createToken();
  const now = new Date();

  await db
    .insert(subscribers)
    .values({
      email: normalized,
      locale,
      status: "pending",
      confirmTokenHash: hash,
      confirmSentAt: now,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        locale,
        status: "pending",
        confirmTokenHash: hash,
        confirmSentAt: now,
      },
      setWhere: ne(subscribers.status, "confirmed"),
    });

  try {
    await sendNewsletterConfirmationEmail({
      email: normalized,
      locale,
      url: `${WEBSITE_URL}/api/newsletter/confirm?token=${token}`,
    });
  } catch (error) {
    await db
      .update(subscribers)
      .set({ confirmSentAt: null })
      .where(
        and(
          eq(subscribers.email, normalized),
          eq(subscribers.status, "pending"),
        ),
      );

    throw error;
  }
}

export async function confirmSubscription(token: string) {
  const [row] = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.confirmTokenHash, hashToken(token)),
        eq(subscribers.status, "pending"),
      ),
    )
    .limit(1);

  if (
    !row?.confirmSentAt ||
    Date.now() - row.confirmSentAt.getTime() > CONFIRM_TTL_MS
  ) {
    return null;
  }

  await db
    .update(subscribers)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmTokenHash: null,
    })
    .where(eq(subscribers.id, row.id));

  return { locale: row.locale };
}
