import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminTestimonials from "@/views/admin/AdminTestimonials";

export const metadata: Metadata = {
  title: "Testimonials & Feedback",
};

export default function TestimonialsPage() {
  return (
    <ProtectedRoute>
      <AdminTestimonials />
    </ProtectedRoute>
  );
}
