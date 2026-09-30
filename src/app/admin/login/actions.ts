"use server";

import { redirect } from "next/navigation";
import { adminPaths, signIn } from "@/lib/admin/auth";

export type LoginState = { message: string | null };

export async function login(_state: LoginState, form: FormData): Promise<LoginState> {
  const result = await signIn({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    code: String(form.get("code") ?? ""),
  });
  if (!result.ok) return { message: result.message };
  redirect(adminPaths.home);
}
