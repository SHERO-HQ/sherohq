import type { Metadata } from "next";
import Link from "next/link";
import { ReloadButton } from "./ReloadButton";
import { Unplug } from "lucide-react";

export const metadata: Metadata = {
  title: "You're Offline",
  description:
    "No internet connection. Please check your network and try again.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <Unplug className="size-16 text-brand-secondary-600" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">You're offline</h1>

        <p className="text-muted-foreground text-base leading-relaxed">
          It looks like you don't have an internet connection. Check your
          network and try again
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <ReloadButton />
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded
 border border-input bg-background text-sm font-medium hover:bg-accent
 hover:text-accent-foreground transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
