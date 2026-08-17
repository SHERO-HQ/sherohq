import { Metadata } from "next";
import AdminTemplates from "../../../views/admin/AdminTemplates";
import ProtectedRoute from "../../../components/admin/ProtectedRoute";

export const metadata: Metadata = {
  title: "Templates",
  description: "Manage WhatsApp, Email, and SMS templates",
};

export default function AdminTemplatesPage() {
  return (
    <ProtectedRoute>
      <AdminTemplates />
    </ProtectedRoute>
  );
}
