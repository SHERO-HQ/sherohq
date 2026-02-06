export interface Project {
  id: string;
  title: string;
  category: string;
  client: string | null;
  description: string | null;
  useCase: string | null;
  technologies: string[];
  image: string | null;
  link: string | null;
  createdAt: string;
}
