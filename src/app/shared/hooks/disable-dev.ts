"use client";

import { useEffect, useRef } from "react";
import env from "@/env";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function useDisableDevTools(
  unauthorizedPath: string = "/unauthorized",
) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  useEffect(() => {
    const redirect = () => {
      if (!redirectedRef.current && pathname !== unauthorizedPath) {
        redirectedRef.current = true;
        router.push(unauthorizedPath);
      }
    };

    const preventKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        redirect();
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      redirect();
    };

    if (env.NEXT_PUBLIC_DISABLE_DEVTOOLS) {
      document.addEventListener("keydown", preventKeys);
      document.addEventListener("contextmenu", preventContextMenu);
    }

    return () => {
      document.removeEventListener("keydown", preventKeys);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [router, pathname, unauthorizedPath]);

  useEffect(() => {
    if (pathname !== unauthorizedPath) {
      redirectedRef.current = false;
    }
  }, [pathname, unauthorizedPath]);
}
