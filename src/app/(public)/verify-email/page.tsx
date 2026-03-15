import type { Metadata } from "next";
import VerifyEmailClient from "./client";

export const metadata: Metadata = {
 title: "Verify Email",
 description: "Verify your SHERO account email address.",
 robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
 return <VerifyEmailClient />;
}
