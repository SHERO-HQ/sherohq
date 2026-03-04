"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminTeam from "@/views/admin/AdminTeam";

export default function TeamPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <AdminTeam />
    </ProtectedRoute>
  );
}
