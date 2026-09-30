import { redirect } from "next/navigation";
import { adminPaths } from "@/lib/admin/auth";

// The Dashboard comes later; until then the admin opens on Listings.
export default function AdminHome() {
  redirect(adminPaths.home);
}
