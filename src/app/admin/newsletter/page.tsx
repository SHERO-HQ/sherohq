import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminNewsletter from "@/views/admin/AdminNewsletter";

export const metadata: Metadata = {
  title: "Newsletter & Campaigns",
};

export default function NewsletterPage() {
  return (
    <ProtectedRoute>
      <AdminNewsletter />
    </ProtectedRoute>
  );
}
