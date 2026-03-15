"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ProjectForm from "@/views/admin/ProjectForm";

export default function EditProjectPage() {
 return (
 <ProtectedRoute>
 <ProjectForm />
 </ProtectedRoute>
 );
}
