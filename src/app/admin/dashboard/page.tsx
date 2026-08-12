import { Metadata } from "next";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const AdminDashboard = dynamic(() => import("@/views/admin/AdminDashboard"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center dark:bg-card bg-slate-50">
      <div className="w-10 h-10 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
