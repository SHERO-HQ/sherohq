import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminGuides from "@/views/admin/AdminGuides";

export const metadata: Metadata = {
  title: "User Guides",
};

export default function GuidesPage() {
  return (
    <ProtectedRoute>
      <AdminGuides />
    </ProtectedRoute>
  );
}
