import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { adminPaths, getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect(adminPaths.home);
  return (
    <main className="flex min-h-svh items-center justify-center bg-surface px-gutter py-12">
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-md border border-border bg-surface-raised p-6 lg:p-8">
        <div className="flex items-center gap-2.5">
          <Logo className="h-6 w-auto" />
          <span className="font-mono text-meta text-ink-muted">admin</span>
        </div>
        <h1 className="text-h2">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
