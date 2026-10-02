import { AdminProfileMenu } from "@/app/features/admin-profile-menu/admin-profile-menu";
import CommandPalette from "@/app/features/command-palette/command-palette";
import LanguageToggle from "@/app/features/lang-toggle/lang-toggle";
import { ModeToggle } from "@/app/features/toggle-mode/toggle-mode";
import { adminCommandLinks } from "@/app/shared/constants/command-links";
import DevToolsGuard from "@/app/shared/guard/disable-dev-tools";
import { Separator } from "@/app/shared/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/shared/ui/sidebar";
import { AdminSidebar } from "@/app/widgets/admin-sidebar/admin-sidebar";
import { requireAdmin } from "@/lib/auth/guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <SidebarProvider>
      <AdminSidebar user={session.user} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 size-8" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="ml-auto flex items-center gap-2">
              <CommandPalette links={adminCommandLinks} showSettings={false} />
              <LanguageToggle />
              <ModeToggle />
              <AdminProfileMenu user={session.user} />
            </div>
          </div>
        </header>
        <DevToolsGuard unauthorizedPath="/admin/unauthorized" />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-350 flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
