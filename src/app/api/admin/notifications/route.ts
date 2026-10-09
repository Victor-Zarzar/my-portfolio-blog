import { NextResponse } from "next/server";
import { NOTIFICATION_POPOVER_LIMIT } from "@/app/shared/constants/notifications";
import { requireAdmin } from "@/lib/auth/guard";
import { getNotificationSnapshot } from "@/lib/db/queries/notification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireAdmin();
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit"));

  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : NOTIFICATION_POPOVER_LIMIT;

  const snapshot = await getNotificationSnapshot(session.user.id, limit);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
