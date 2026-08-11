"use client";

import { useState } from "react";
import { getErrorMessage } from "@/utils/error";
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useSyncTrustpilotTestimonials,
} from "@/hooks/queries/useTestimonials";
import { useNotifications } from "@/hooks/useNotifications";
import { type Testimonial } from "@/services/api";

export function useAdminTestimonialsState() {
  const { data: testimonials = [], isLoading } = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const syncTrustpilotMutation = useSyncTrustpilotTestimonials();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{
    isOpen: boolean;
    testimonialId: string | null;
  }>({ isOpen: false, testimonialId: null });
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    testimonial: Testimonial | null;
  }>({ isOpen: false, testimonial: null });

  const [formData, setFormData] = useState({
    quote: "",
    author: "",
    role: "",
    company: "",
    image: "",
    order: 0,
    active: true,
    rating: 5,
  });

  const filteredTestimonials = testimonials
    .filter(
      (t) =>
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quote.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setFormData({
      quote: "",
      author: "",
      role: "",
      company: "",
      image: "",
      order: testimonials.length,
      active: true,
      rating: 5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData({
      quote: t.quote,
      author: t.author,
      role: t.role || "",
      company: t.company || "",
      image: t.image || "",
      order: t.order || 0,
      active: t.active ?? true,
      rating: t.rating || 5,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await updateMutation.mutateAsync({
          id: editingTestimonial.id,
          data: formData,
        });
        addNotification(
          "Success",
          "Testimonial updated successfully",
          "success",
        );
      } else {
        await createMutation.mutateAsync(formData);
        addNotification(
          "Success",
          "Testimonial added successfully",
          "success",
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to save testimonial"),
        "error",
      );
    }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      const newStatus = !t.active;
      await updateMutation.mutateAsync({
        id: t.id,
        data: { active: newStatus },
      });
      const statusLabel = newStatus
        ? "published to the site"
        : "hidden from the site";
      addNotification("Success", `Feedback ${statusLabel}`, "success");
    } catch (error) {
      console.error("Failed to toggle testimonial status:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to update status"),
        "error",
      );
    }
  };

  const handleSyncTrustpilot = async () => {
    try {
      const result = await syncTrustpilotMutation.mutateAsync(20);
      addNotification(
        "Success",
        `Trustpilot sync complete: fetched ${result.fetched}, inserted ${result.inserted}, updated ${result.updated}`,
        "success",
      );
    } catch (error) {
      console.error("Failed to sync Trustpilot testimonials:", error);
      addNotification(
        "Error",
        "Failed to sync Trustpilot testimonials",
        "error",
      );
    }
  };

  return {
    testimonials,
    isLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    setIsModalOpen,
    deleteModalData,
    setDeleteModalData,
    editingTestimonial,
    confirmModalData,
    setConfirmModalData,
    formData,
    setFormData,
    filteredTestimonials,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    toggleActive,
    handleSyncTrustpilot,
    createMutation,
    updateMutation,
    deleteMutation,
    syncTrustpilotMutation,
    addNotification,
  };
}
