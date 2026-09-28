import type { ReactNode } from "react";
import AuthWrapper from "@/app/shared/wrapper/auth-wrapper";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
