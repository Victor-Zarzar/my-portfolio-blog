import DevToolsGuard from "@/app/shared/guard/disable-dev-tools";
import Footer from "@/app/widgets/footer/footer-component";
import { AdminNavbar } from "@/app/widgets/navbar-admin/navbar-admin";
import { requireAdmin } from "@/lib/auth/guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <>
      <AdminNavbar user={session.user} />
      <DevToolsGuard unauthorizedPath="/admin/unauthorized" />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
