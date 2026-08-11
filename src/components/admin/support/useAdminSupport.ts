"use client";

import { useState, useMemo } from "react";
import { getErrorMessage } from "@/utils/error";
import {
  useSupportTickets,
  useConsultations,
  useInquiries,
  useUpdateTicketStatus,
  useUpdateConsultationStatus,
  useRescheduleConsultation,
  useDeleteConsultation,
  useUpdateInquiryStatus,
  useDeleteInquiry,
} from "@/hooks/queries/useSupport";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";

export function useAdminSupport() {
  const { data: tickets = [], isLoading: ticketsLoading } = useSupportTickets(
    ADMIN_POLLING_INTERVAL,
  );
  const { data: consultations = [], isLoading: consultationsLoading } =
    useConsultations(ADMIN_POLLING_INTERVAL);
  const { data: inquiries = [], isLoading: inquiriesLoading } = useInquiries(
    ADMIN_POLLING_INTERVAL,
  );

  const resolveTicketMutation = useUpdateTicketStatus();
  const updateConsultationStatusMutation = useUpdateConsultationStatus();
  const rescheduleMutation = useRescheduleConsultation();
  const updateInquiryStatusMutation = useUpdateInquiryStatus();
  const deleteConsultationMutation = useDeleteConsultation();
  const deleteInquiryMutation = useDeleteInquiry();

  const isLoading = ticketsLoading || consultationsLoading || inquiriesLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { addNotification } = useNotifications();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "consultation" | "inquiry" | null;
    id: string | null;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });

  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    id: string | null;
    currentDate: string;
    currentTime: string;
  }>({
    isOpen: false,
    id: null,
    currentDate: "",
    currentTime: "",
  });

  const handleResolveTicket = async (id: string) => {
    try {
      await resolveTicketMutation.mutateAsync({ id, status: "Resolved" });
      addNotification("Success", "Ticket marked as resolved", "success");
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to resolve ticket"),
        "error",
      );
    }
  };

  const handleUpdateStatus = async (
    type: "consultation" | "inquiry",
    id: string,
    status: string,
  ) => {
    try {
      if (type === "consultation") {
        await updateConsultationStatusMutation.mutateAsync({ id, status });
      } else {
        await updateInquiryStatusMutation.mutateAsync({ id, status });
      }
      addNotification("Success", `Status updated to ${status}`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to update status"),
        "error",
      );
    }
  };

  const isDeleting =
    deleteConsultationMutation.isPending || deleteInquiryMutation.isPending;

  const confirmDelete = (type: "consultation" | "inquiry", id: string) => {
    if (isDeleting) return;
    setDeleteModal({ isOpen: true, type, id });
  };

  const handleDelete = async () => {
    const { type, id } = deleteModal;
    if (!type || !id || isDeleting) return;

    try {
      if (type === "consultation") {
        await deleteConsultationMutation.mutateAsync(id);
      } else {
        await deleteInquiryMutation.mutateAsync(id);
      }
      setDeleteModal({ isOpen: false, type: null, id: null });
      addNotification(
        "Success",
        `${type === "consultation" ? "Consultation" : "Inquiry"} deleted successfully`,
        "success",
      );
    } catch (err: any) {
      if (err?.status === 404) {
        setDeleteModal({ isOpen: false, type: null, id: null });
        return;
      }
      console.error("Failed to delete support item:", err);
      addNotification(
        "Error",
        getErrorMessage(err, `Failed to delete ${type}`),
        "error",
      );
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal.id) return;
    try {
      await rescheduleMutation.mutateAsync({
        id: rescheduleModal.id,
        date: rescheduleModal.currentDate,
        time: rescheduleModal.currentTime,
      });
      setRescheduleModal({
        isOpen: false,
        id: null,
        currentDate: "",
        currentTime: "",
      });
      addNotification(
        "Success",
        "Consultation rescheduled successfully",
        "success",
      );
    } catch (err) {
      console.error("Failed to reschedule consultation:", err);
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to reschedule consultation"),
        "error",
      );
    }
  };

  const handleReplyEmail = (email: string, subject: string, name: string) => {
    const mailtoLink = `mailto:${email}?subject=RE: ${subject}&body=Hi ${name},%0D%0A%0D%0AThank you for contacting SHERO Technologies support.%0D%0A%0D%0A`;
    window.location.href = mailtoLink;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_no.toString().includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" ||
        t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.service.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [consultations, searchQuery, statusFilter]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesSearch =
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        i.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  return {
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    deleteModal,
    setDeleteModal,
    rescheduleModal,
    setRescheduleModal,
    filteredTickets,
    filteredConsultations,
    filteredInquiries,
    isDeleting,
    rescheduleMutation,
    handleResolveTicket,
    handleUpdateStatus,
    confirmDelete,
    handleDelete,
    handleReschedule,
    handleReplyEmail,
  };
}
