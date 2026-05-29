import { Metadata } from "next";
import ForgotPassword from "@/views/auth/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password | SHERO",
  description: "Request a password reset link for your SHERO account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
