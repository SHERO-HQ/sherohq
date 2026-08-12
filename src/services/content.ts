import { API_BASE, handleResponse, authFetch } from "./client";
import type { Project } from "@/types/project";
import type { Testimonial } from "@/types/testimonial";
import type { SiteStat } from "@/types/stat";

export type { Project, Testimonial, SiteStat };

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  order?: number;
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const response = await fetch(`${API_BASE}/team`);
  return handleResponse<TeamMember[]>(response);
}

export async function createTeamMember(
  data: Omit<TeamMember, "id">,
): Promise<TeamMember> {
  const response = await authFetch(`${API_BASE}/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeamMember>(response);
}

export async function updateTeamMember(
  id: string,
  data: Partial<TeamMember>,
): Promise<TeamMember> {
  const response = await authFetch(`${API_BASE}/team/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeamMember>(response);
}

export async function deleteTeamMember(
  id: string,
): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/team/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function fetchProjects(category?: string): Promise<Project[]> {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  const response = await fetch(`${API_BASE}/projects?${params.toString()}`);
  return handleResponse<Project[]>(response);
}

export async function fetchProjectById(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  return handleResponse<Project>(response);
}

export async function createProject(
  data: Partial<Project>,
): Promise<{ success: boolean; project: Project }> {
  const response = await authFetch(`${API_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<{ success: boolean; project: Project }> {
  const response = await authFetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteProject(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(`${API_BASE}/testimonials`);
  const data = await handleResponse<any>(response);
  return Array.isArray(data) ? data : data?.testimonials || [];
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  const response = await authFetch(`${API_BASE}/testimonials?admin=true`);
  const data = await handleResponse<any>(response);
  return Array.isArray(data) ? data : data?.testimonials || [];
}

export async function createTestimonial(
  data: Partial<Testimonial>,
): Promise<Testimonial> {
  const response = await authFetch(`${API_BASE}/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Testimonial>(response);
}

export async function submitPublicTestimonial(
  data: Partial<Testimonial>,
): Promise<{ success: boolean; message: string; testimonial: Testimonial }> {
  const response = await authFetch(`${API_BASE}/testimonials/public`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTestimonial(
  id: string,
  data: Partial<Testimonial>,
): Promise<Testimonial> {
  const response = await authFetch(`${API_BASE}/testimonials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Testimonial>(response);
}

export async function deleteTestimonial(
  id: string,
): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/testimonials/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

export async function syncTrustpilotTestimonials(limit = 20): Promise<{
  message: string;
  fetched: number;
  inserted: number;
  updated: number;
}> {
  const response = await authFetch(`${API_BASE}/testimonials/sync/trustpilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
  return handleResponse<{
    message: string;
    fetched: number;
    inserted: number;
    updated: number;
  }>(response);
}

// ---------------------------------------------------------------------------
// Site Stats
// ---------------------------------------------------------------------------

export async function fetchStats(): Promise<SiteStat[]> {
  const response = await fetch(`${API_BASE}/stats`);
  return handleResponse<SiteStat[]>(response);
}

export async function createStat(data: Partial<SiteStat>): Promise<SiteStat> {
  const response = await authFetch(`${API_BASE}/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<SiteStat>(response);
}

export async function updateStat(
  id: string,
  data: Partial<SiteStat>,
): Promise<SiteStat> {
  const response = await authFetch(`${API_BASE}/stats/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<SiteStat>(response);
}

export async function deleteStat(id: string): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/stats/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ---------------------------------------------------------------------------
// Client Partners
// ---------------------------------------------------------------------------

export interface ClientPartner {
  id: string;
  name: string;
  tagline?: string | null;
  logo: string;
  logoDark?: string | null;
  website?: string | null;
  category?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
}

export async function fetchClients(includeAll: boolean = false): Promise<ClientPartner[]> {
  const url = includeAll ? `${API_BASE}/clients?all=true` : `${API_BASE}/clients`;
  const response = await fetch(url);
  const data = await handleResponse<any>(response);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function createClient(
  data: Omit<ClientPartner, "id" | "createdAt">,
): Promise<ClientPartner> {
  const response = await authFetch(`${API_BASE}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ClientPartner>(response);
}

export async function updateClient(
  id: string,
  data: Partial<ClientPartner>,
): Promise<ClientPartner> {
  const response = await authFetch(`${API_BASE}/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ClientPartner>(response);
}

export async function deleteClient(id: string): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/clients/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}
