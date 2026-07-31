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

 // Only block with a spinner during the initial cold auth check.
 // If the user just logged in, isAuthenticated is already true and we skip this.
 if (isLoading && !isAuthenticated) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:bg-card bg-slate-50">
 <div className="w-10 h-10 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 if (needsLogin || needsRoleRedirect) {
 return null;
 }

 return <>{children}</>;
}
