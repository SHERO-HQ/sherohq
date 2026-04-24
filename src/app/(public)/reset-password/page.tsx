import { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | Shero Tech",
  description: "Set a new password for your Shero Tech account.",
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
