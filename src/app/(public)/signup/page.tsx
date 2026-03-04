import type { Metadata } from "next";
import Signup from "@/views/auth/Signup";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your SHERO account to start shopping, track orders, and access exclusive member benefits.",
  robots: { index: false },
};

export default function SignupPage() {
  return <Signup />;
}
