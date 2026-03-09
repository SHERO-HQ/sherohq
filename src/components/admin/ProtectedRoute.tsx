"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { getSubdomain } from "@/utils/subdomain";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, admin } = useAdmin();
  const router = useRouter();

  const needsLogin = !isLoading && !isAuthenticated;
  const needsRoleRedirect =
    !isLoading &&
    isAuthenticated &&
    allowedRoles &&
    admin &&
    !allowedRoles.includes(admin.role);

  useEffect(() => {
    if (needsLogin) {
      const subdomain = getSubdomain();
      const loginPath = subdomain === "admin" ? "/login" : "/admin/login";
      router.replace(loginPath);
    } else if (needsRoleRedirect) {
      router.replace("/admin/dashboard");
    }
  }, [needsLogin, needsRoleRedirect, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (needsLogin || needsRoleRedirect) {
    return null;
  }

  return <>{children}</>;
}
