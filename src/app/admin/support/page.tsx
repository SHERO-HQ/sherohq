"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSupport from "@/views/admin/AdminSupport";

export default function AdminSupportPage() {
  return (
    <ProtectedRoute>
      <AdminSupport />
    </ProtectedRoute>
  );
}
