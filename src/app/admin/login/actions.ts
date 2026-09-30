"use server";

import { redirect } from "next/navigation";
import { adminPaths, checkPassword, signIn, type SignInResult } from "@/lib/admin/auth";

/** Step one: email and password. */
export async function checkLogin(email: string, password: string): Promise<SignInResult> {
  return checkPassword({ email, password });
}

/** Step two: the same email and password, with the code. Signs in and opens the admin. */
export async function login(email: string, password: string, code: string): Promise<SignInResult> {
  const result = await signIn({ email, password, code });
  if (!result.ok) return result;
  redirect(adminPaths.home);
}
