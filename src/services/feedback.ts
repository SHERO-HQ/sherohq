import { authFetch, handleResponse, API_BASE } from "./client";

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
  const response = await authFetch(`${API_BASE}/admin/feedback`);
  return handleResponse<CustomerFeedback[]>(response);
};

export const deleteFeedback = async (id: number): Promise<void> => {
  const response = await authFetch(`${API_BASE}/admin/feedback/${id}`, { method: "DELETE" });
  return handleResponse<void>(response);
};

export const promoteFeedback = async (id: number): Promise<{ message: string; testimonialId: string }> => {
  const response = await authFetch(`${API_BASE}/admin/feedback/${id}/promote`, { method: "POST" });
  return handleResponse<{ message: string; testimonialId: string }>(response);
};
