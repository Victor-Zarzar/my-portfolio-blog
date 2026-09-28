import { redirect } from "next/navigation";
import { getCurrentSession } from "./get-session";

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session.user.isAdmin) {
    redirect("/auth/signin");
  }
  return session;
}
