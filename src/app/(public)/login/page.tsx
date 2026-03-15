import type { Metadata } from "next";
import Login from "@/views/auth/Login";

export const metadata: Metadata = {
 title: "Login",
 description:
 "Sign in to your SHERO account to manage orders, track deliveries, and access your profile.",
 robots: { index: false },
};

export default function LoginPage() {
 return <Login />;
}
