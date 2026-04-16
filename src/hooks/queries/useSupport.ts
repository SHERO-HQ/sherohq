"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSupportTickets,
  fetchConsultations,
  fetchInquiries,
  updateTicketStatus,
  updateConsultationStatus,
  deleteConsultation,
  updateInquiryStatus,
  deleteInquiry,
} from "@/services/api";

export const SUPPORT_KEYS = {
  all: ["support"] as const,
  tickets: () => [...SUPPORT_KEYS.all, "tickets"] as const,
  consultations: () => [...SUPPORT_KEYS.all, "consultations"] as const,
  inquiries: () => [...SUPPORT_KEYS.all, "inquiries"] as const,
};

export const useSupportTickets = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: SUPPORT_KEYS.tickets(),
    queryFn: fetchSupportTickets,
    refetchInterval,
  });
};

export const useConsultations = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: SUPPORT_KEYS.consultations(),
    queryFn: fetchConsultations,
    refetchInterval,
  });
};

export const useInquiries = (refetchInterval?: number | false) => {
  return useQuery({
    queryKey: SUPPORT_KEYS.inquiries(),
    queryFn: fetchInquiries,
    refetchInterval,
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.tickets() });
    },
  });
};

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateConsultationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.consultations() });
    },
  });
};

export const useDeleteConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.consultations() });
    },
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.inquiries() });
    },
  });
};

export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.inquiries() });
    },
  });
};
