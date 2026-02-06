export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt?: string;
}
