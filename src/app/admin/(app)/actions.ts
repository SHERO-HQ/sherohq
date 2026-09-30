"use server";

import { redirect } from "next/navigation";
import { adminPaths, signOut } from "@/lib/admin/auth";

export async function logout() {
  await signOut();
  redirect(adminPaths.login);
}
