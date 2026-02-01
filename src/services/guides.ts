import { API_URL, authFetch } from "./api";

export interface SupportGuide {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: "hardware" | "software";
  authorId: string | null;
  authorName?: string;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateGuideInput = {
  title: string;
  content: string;
  summary?: string;
  category: "hardware" | "software";
  coverImage?: string;
  published?: boolean;
  authorId?: string;
};

export type UpdateGuideInput = Partial<CreateGuideInput>;

// Public: Get all published guides (optionally filtered by category)
export async function getGuides(
  category?: "hardware" | "software",
): Promise<SupportGuide[]> {
  const url = category
    ? `${API_URL}/guides?category=${category}`
    : `${API_URL}/guides`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch guides");
  }
  return res.json();
}

// Public: Get single guide by slug
export async function getGuideBySlug(slug: string): Promise<SupportGuide> {
  const res = await fetch(`${API_URL}/guides/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch guide");
  }
  return res.json();
}

// Admin: Get all guides (including unpublished)
export async function getAdminGuides(): Promise<SupportGuide[]> {
  const res = await authFetch(`${API_URL}/guides/admin`);
  if (!res.ok) {
    throw new Error("Failed to fetch guides");
  }
  return res.json();
}

// Admin: Create new guide
export async function createGuide(
  data: CreateGuideInput,
): Promise<SupportGuide> {
  const res = await authFetch(`${API_URL}/guides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create guide");
  }
  return res.json();
}

// Admin: Update guide
export async function updateGuide(
  id: string,
  data: UpdateGuideInput,
): Promise<SupportGuide> {
  const res = await authFetch(`${API_URL}/guides/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update guide");
  }
  return res.json();
}

// Admin: Delete guide
export async function deleteGuide(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/guides/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete guide");
  }
}
