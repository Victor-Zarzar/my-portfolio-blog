import type { LucideIcon } from "lucide-react";
import { Briefcase, GraduationCap, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { getTimelineData } from "@/app/shared/data/getTimelineData";
import type { Experience } from "@/app/shared/types/get-data/get-data";
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/app/shared/ui/timeline";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { cn } from "@/lib/utils";

export const TimelineLayout = () => {
  const t = useTranslations("Experiences");
  const timelineData: Experience[] = getTimelineData({ t });

  const iconMap: Record<string, LucideIcon> = {
    work: Briefcase,
    education: GraduationCap,
    freelance: PenLine,
  };

  const pillClass: Record<string, string> = {
    work: "bg-neutral-800 dark:bg-neutral-800 border border-neutral-700",
    education: "bg-neutral-800 dark:bg-neutral-800 border border-neutral-700",
    freelance: "bg-neutral-800 dark:bg-neutral-800 border border-neutral-700",
  };

  const pillLabel: Record<string, string> = {
    work: t("type.work"),
    education: t("type.education"),
    freelance: t("type.freelance"),
  };

  return (
    <section className="mx-auto mt-28 mb-28 max-w-3xl px-4">
      <FadeWrapper>
        <h2 className="title-about mb-16 font-extrabold leading-tight tracking-tight text-3xl md:text-4xl text-center mt-20 md:mt-36">
          {t("h1")}
        </h2>
      </FadeWrapper>

      <div className="relative pl-8">
        <Timeline className="flex flex-col">
          {timelineData.map((item) => {
            const Icon = iconMap[item.type ?? "work"] ?? Briefcase;
            const type = item.type ?? "work";

            return (
              <FadeWrapper key={item.id}>
                <TimelineItem className="group relative">
                  <TimelineHeader className="flex flex-wrap items-center gap-2 mb-1">
                    <TimelineTime
                      className={cn(
                        "text-[10px] tracking-wide",
                        "px-2 py-0.5 rounded",
                        "shrink-0 transition-colors duration-200 whitespace-nowrap",
                        "group-hover:border-border",
                      )}
                    >
                      {item.time}
                    </TimelineTime>

                    <span
                      className={cn(
                        "flex items-center justify-center size-8 rounded-[5px]",
                        "border border-border/50 bg-muted/50",
                        "transition-all duration-200",
                        "group-hover:bg-muted group-hover:border-border",
                      )}
                      aria-hidden
                    >
                      <Icon
                        size={20}
                        className="text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
                        strokeWidth={1.8}
                      />
                    </span>

                    <TimelineTitle className="text-sm sm:text-lg font-medium tracking-tight">
                      {item.title}
                    </TimelineTitle>

                    {item.role && (
                      <span className="text-[16px] w-full basis-full pl-0.5 -mt-0.5">
                        {item.role}
                      </span>
                    )}

                    <span
                      className={cn(
                        "ml-auto text-[11px] text-white tracking-widest px-2 py-1.5 rounded-full",
                        pillClass[type],
                      )}
                    >
                      {pillLabel[type]}
                    </span>
                  </TimelineHeader>

                  {item.description && (
                    <div className="pl-0.5 mt-1 space-y-0.5">
                      {item.achievements && (
                        <p className="text-[14px] uppercase tracking-widest mb-1.5">
                          {item.achievements}
                        </p>
                      )}
                      <TimelineDescription className="text-xs sm:text-[17px] leading-relaxed">
                        {item.description}
                      </TimelineDescription>
                      {item.local && (
                        <TimelineDescription className="text-[14px] mt-2 md:mt-4 tracking-wide">
                          {item.local}
                        </TimelineDescription>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full",
                                "bg-neutral-800 dark:bg-neutral-800 border border-neutral-700",
                                "text-white tracking-wide",
                                "transition-colors duration-200",
                                "group-hover:border-border",
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TimelineItem>
              </FadeWrapper>
            );
          })}
        </Timeline>
      </div>
    </section>
  );
};
