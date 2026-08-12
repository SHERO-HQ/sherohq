import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProjects from "@/views/admin/AdminProjects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <AdminProjects />
    </ProtectedRoute>
  );
}
