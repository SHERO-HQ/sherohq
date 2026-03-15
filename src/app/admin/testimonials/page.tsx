"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminTestimonials from "@/views/admin/AdminTestimonials";

export default function TestimonialsPage() {
 return (
 <ProtectedRoute>
 <AdminTestimonials />
 </ProtectedRoute>
 );
}
