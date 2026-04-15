export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  order: number;
  active: boolean;
  externalSource?: string;
  externalId?: string;
  rating?: number;
  reviewUrl?: string;
  publishedAt?: string;
  createdAt?: string;
}
