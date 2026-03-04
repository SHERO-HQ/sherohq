"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminStats from "@/views/admin/AdminStats";

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <AdminStats />
    </ProtectedRoute>
  );
}
