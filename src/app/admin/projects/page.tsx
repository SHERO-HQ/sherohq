"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProjects from "@/views/admin/AdminProjects";

export default function ProjectsPage() {
 return (
 <ProtectedRoute>
 <AdminProjects />
 </ProtectedRoute>
 );
}
