"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminDashboard from "@/views/admin/AdminDashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
