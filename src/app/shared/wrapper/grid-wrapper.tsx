import { Plus } from "lucide-react";
import type { GridSectionProps } from "../types/grid/grid";

const HATCH =
  "[--hatch:rgba(0,0,0,0.06)] dark:[--hatch:rgba(255,255,255,0.05)] bg-[image:repeating-linear-gradient(135deg,transparent_0_5px,var(--hatch)_5px_6px)]";

export default function GridSection({
  children,
  id,
  className = "",
  hatched = false,
}: GridSectionProps) {
  return (
    <section
      id={id}
      className={`relative px-6 py-16 md:px-10 md:py-24 ${hatched ? HATCH : ""} ${className}`}
    >
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800"
      />

      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 hidden h-4 w-4 -translate-x-1/2 translate-y-1/2 text-neutral-400 dark:text-neutral-600 md:block"
      />
      <Plus
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 hidden h-4 w-4 translate-x-1/2 translate-y-1/2 text-neutral-400 dark:text-neutral-600 md:block"
      />
    </section>
  );
}
