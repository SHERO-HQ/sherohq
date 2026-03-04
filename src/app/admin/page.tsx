import { redirect } from "next/navigation";

// /admin → /admin/dashboard redirect
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
