"use server";

import { redirect } from "next/navigation";
import { adminPaths, checkPassword, signIn, type SignInResult } from "@/lib/admin/auth";

// Both steps take FormData rather than plain arguments: the development
// server logs a server function's plain arguments, and one is the password.
const field = (form: FormData, key: string) => String(form.get(key) ?? "");

/** Step one: email and password. */
export async function checkLogin(form: FormData): Promise<SignInResult> {
  return checkPassword({ email: field(form, "email"), password: field(form, "password") });
}

/** Step two: the same email and password, with the code. Signs in and opens the admin. */
export async function login(form: FormData): Promise<SignInResult> {
  const result = await signIn({ email: field(form, "email"), password: field(form, "password"), code: field(form, "code") });
  if (!result.ok) return result;
  redirect(adminPaths.home);
}
