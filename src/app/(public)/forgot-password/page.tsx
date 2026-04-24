import { Metadata } from "next";
import ForgotPassword from "@/views/auth/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password | Shero Tech",
  description: "Request a password reset link for your Shero Tech account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
