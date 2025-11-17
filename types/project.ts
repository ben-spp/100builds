export type ProjectType = 'show' | 'help';

export interface Project {
  id: string;
  slug: string;
  type: ProjectType;
  name: string;
  description: string;
  avatar?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  needs?: string;
  links?: {
    // Core identity & project links
    site?: string;
    github?: string;
    threads?: string;
    twitter?: string;
    linkedin?: string;
    // Creative & design community
    dribbble?: string;
    behance?: string;
    instagram?: string;
    // Maker & indie ecosystems
    indiehackers?: string;
    producthunt?: string;
    reddit?: string;
    // Optional extras
    youtube?: string;
    blog?: string;
    discord?: string;
  };
  email?: string;
  claimed?: boolean;
  claimToken?: string;
  date: string;
  likes?: number;
  allowContact?: boolean;
}
