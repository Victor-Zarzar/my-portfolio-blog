import type React from "react";
import DevToolsGuard from "@/app/shared/guard/disable-dev-tools";
import Footer from "@/app/widgets/footer-component/footer-component";
import { NavbarComponent } from "@/app/widgets/navbar/navbar-desktop";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-clip">
      <NavbarComponent />
      <DevToolsGuard />
      <div className="mx-auto max-w-7xl border-neutral-200 dark:border-neutral-800 md:border-x">
        {children}
        <Footer />
      </div>
    </div>
  );
}
