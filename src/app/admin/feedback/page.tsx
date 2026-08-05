"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminFeedback from "@/views/admin/AdminFeedback";

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <AdminFeedback />
    </ProtectedRoute>
  );
}
