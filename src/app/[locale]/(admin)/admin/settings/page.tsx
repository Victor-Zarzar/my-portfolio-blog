import { TwoFactorSetupForm } from "@/app/features/two-factor-setup-form/two-factor-setup-form";
import { requireSession } from "@/lib/auth/guard";

export default async function SecurityPage() {
  const session = await requireSession();

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>

        <p className="text-sm text-muted-foreground">
          Manage your authentication and account recovery settings.
        </p>
      </div>

      <TwoFactorSetupForm
        twoFactorEnabled={session?.user.twoFactorEnabled ?? false}
      />
    </section>
  );
}
