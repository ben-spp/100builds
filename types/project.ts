export type ProjectType = 'show' | 'help';

export interface Project {
  id: string;
  slug: string;
  type: ProjectType;
  name: string;
  description: string;
  avatar?: string;
  tags?: string[];
  category?: string;
  needs?: string;
  links?: {
    site?: string;
    github?: string;
    twitter?: string;
  };
  date: string;
}
