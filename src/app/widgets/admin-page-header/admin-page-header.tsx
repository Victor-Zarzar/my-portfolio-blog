import type { AdminPageHeaderProps } from "@/app/shared/types/admin/admin";

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
          <Icon className="size-6 text-primary" />
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
