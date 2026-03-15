"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminUsers from "@/views/admin/AdminUsers";

export default function UsersPage() {
 return (
 <ProtectedRoute allowedRoles={["superadmin", "admin", "manager"]}>
 <AdminUsers />
 </ProtectedRoute>
 );
}
