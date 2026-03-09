import { API_BASE, handleResponse, authFetch } from "./client";

// ---------------------------------------------------------------------------
// Support Tickets
// ---------------------------------------------------------------------------

export interface SupportTicket {
  id: string;
  ticket_no: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  productId?: string;
  userId?: string;
  status: string;
  createdAt: string;
}

export async function createTicket(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority?: string;
  productId?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  message: string;
  ticketId: string;
  ticketNo: number;
}> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const response = await authFetch(`${API_BASE}/tickets`);
  return handleResponse(response);
}

export async function updateTicketStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; ticket: SupportTicket }> {
  const response = await authFetch(`${API_BASE}/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Consultations
// ---------------------------------------------------------------------------

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  message?: string;
  status: string;
  createdAt: string;
}

export async function scheduleConsultation(data: {
  service: string;
  date: Date;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiry/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchConsultations(): Promise<Consultation[]> {
  const response = await authFetch(`${API_BASE}/inquiry/consultations`);
  return handleResponse(response);
}

export async function updateConsultationStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; consultation: Consultation }> {
  const response = await authFetch(
    `${API_BASE}/inquiry/consultations/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function deleteConsultation(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/inquiry/consultations/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Contact / Inquiries
// ---------------------------------------------------------------------------

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiry/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const response = await authFetch(`${API_BASE}/inquiry/list`);
  return handleResponse(response);
}

export async function updateInquiryStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; inquiry: Inquiry }> {
  const response = await authFetch(
    `${API_BASE}/inquiry/inquiries/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function deleteInquiry(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/inquiry/inquiries/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}
