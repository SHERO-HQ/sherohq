"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminReports from "@/views/admin/AdminReports";

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin", "manager"]}>
      <AdminReports />
    </ProtectedRoute>
  );
}
