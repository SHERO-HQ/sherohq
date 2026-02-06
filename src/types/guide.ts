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
