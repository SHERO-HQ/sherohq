import { Metadata } from "next";
import AdminLogin from "@/views/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
