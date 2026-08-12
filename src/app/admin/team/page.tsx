import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminTeam from "@/views/admin/AdminTeam";

export const metadata: Metadata = {
  title: "Team Members",
};

export default function TeamPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <AdminTeam />
    </ProtectedRoute>
  );
}
