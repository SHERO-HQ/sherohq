import type { Metadata } from "next";
import Link from "next/link";
import { ReloadButton } from "./ReloadButton";

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
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="h-20 w-20 text-muted-foreground"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth={1.5}
 aria-hidden="true"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M3 3l18 18M9.172 9.172A4 4 0 0112 8c1.657 0 3.156.805 4.096 2.042M6.343 6.343A8 8 0 0118 12m-2 4H6a4 4 0 01-3-6.646M21 12a9 9 0 01-1.343 4.657"
 />
 </svg>
 </div>

 <h1 className="text-3xl font-bold tracking-tight">
 You&apos;re offline
 </h1>

 <p className="text-muted-foreground text-base leading-relaxed">
 It looks like you don&apos;t have an internet connection. Check your
 network and try again — or explore what&apos;s cached.
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
