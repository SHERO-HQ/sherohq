"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProfile from "@/views/admin/AdminProfile";

export default function AdminProfilePage() {
 return (
 <ProtectedRoute>
 <AdminProfile />
 </ProtectedRoute>
 );
}
