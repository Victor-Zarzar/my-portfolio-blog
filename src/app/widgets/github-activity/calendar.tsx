"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import type { Props } from "react-activity-calendar";
import { ActivityCalendar } from "react-activity-calendar";

const subscribe = () => () => {
  null;
};

export function Calendar(props: Props) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <>
      <span className="sr-only">GitHub activity</span>
      <ActivityCalendar
        {...props}
        colorScheme={mounted && resolvedTheme === "light" ? "light" : "dark"}
        theme={{
          light: ["#e5e5e5", "#bbf7d0", "#4ade80", "#16a34a", "#166534"],
          dark: ["#262626", "#14532d", "#15803d", "#22c55e", "#4ade80"],
        }}
      />
    </>
  );
}
