import { Metadata } from "next";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const AdminReports = dynamic(() => import("@/views/admin/AdminReports"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center dark:bg-card bg-slate-50">
      <div className="w-10 h-10 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Analytics & Reports",
};

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin", "manager"]}>
      <AdminReports />
    </ProtectedRoute>
  );
}
