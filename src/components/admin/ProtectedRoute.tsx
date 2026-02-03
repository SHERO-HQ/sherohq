import { Navigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { getSubdomain } from "@/utils/subdomain";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const subdomain = getSubdomain();
    const loginPath = subdomain === "admin" ? "/login" : "/admin/login";
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}
