"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ProjectForm from "@/views/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <ProjectForm />
    </ProtectedRoute>
  );
}
