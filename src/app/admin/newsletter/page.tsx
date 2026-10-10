import { Metadata } from "next";
import { redirect } from "next/navigation";
import { NEWSLETTER_ENABLED } from "@/constants/features";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminNewsletter from "@/views/admin/AdminNewsletter";

export const metadata: Metadata = {
  title: "Newsletter & Campaigns",
};

export default function NewsletterPage() {
  if (!NEWSLETTER_ENABLED) redirect("/admin");
  return (
    <ProtectedRoute>
      <AdminNewsletter />
    </ProtectedRoute>
  );
}
