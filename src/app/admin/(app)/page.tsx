import { redirect } from "next/navigation";
import { adminPaths } from "@/lib/admin/auth";

// The admin opens on the Dashboard.
export default function AdminHome() {
  redirect(adminPaths.home);
}
