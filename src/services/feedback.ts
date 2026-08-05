import { apiClient } from "./client";

export interface CustomerFeedback {
  id: number;
  name: string | null;
  email: string | null;
  rating: number | null;
  message: string;
  page: string | null;
  createdAt: string;
}

export const fetchAdminFeedback = async (): Promise<CustomerFeedback[]> => {
  return apiClient("/api/admin/feedback");
};

export const deleteFeedback = async (id: number): Promise<void> => {
  return apiClient(`/api/admin/feedback/${id}`, { method: "DELETE" });
};

export const promoteFeedback = async (id: number): Promise<{ message: string; testimonialId: string }> => {
  return apiClient(`/api/admin/feedback/${id}/promote`, { method: "POST" });
};
