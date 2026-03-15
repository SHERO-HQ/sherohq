"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminUserManagement from "@/views/admin/AdminUserManagement";

export default function StaffPage() {
 return (
 <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
 <AdminUserManagement />
 </ProtectedRoute>
 );
}
