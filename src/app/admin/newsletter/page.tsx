"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminNewsletter from "@/views/admin/AdminNewsletter";

export default function AdminNewsletterPage() {
  return (
    <ProtectedRoute>
      <AdminNewsletter />
    </ProtectedRoute>
  );
}
