"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminGuideEditor from "@/views/admin/AdminGuideEditor";

export default function NewGuidePage() {
  return (
    <ProtectedRoute>
      <AdminGuideEditor />
    </ProtectedRoute>
  );
}
