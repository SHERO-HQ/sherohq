export interface Project {
  id: string;
  title: string;
  category: string;
  status: "live" | "in_development" | "in_validation" | "paused";
  type: "client" | "product";
  client: string | null;
  description: string | null;
  useCase: string | null;
  technologies: string[];
  image: string | null;
  link: string | null;
  createdAt: string;
}
