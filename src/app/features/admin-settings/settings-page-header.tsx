import type { SettingsPageHeaderProps } from "@/app/shared/types/settings/settings";

export function SettingsPageHeader({
  icon: Icon,
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b pb-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
        <Icon className="size-5 text-primary" />
      </div>

      <div className="min-w-0 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
