"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminGuides from "@/views/admin/AdminGuides";

export default function GuidesPage() {
 return (
 <ProtectedRoute>
 <AdminGuides />
 </ProtectedRoute>
 );
}
