import { notFound } from 'next/navigation';
import BuildPageClient from '@/components/BuildPageClient';
import BuildPageContent from '@/components/BuildPageContent';
import { Project } from '@/types/project';
import pool from '@/lib/db';

// Force dynamic rendering to always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProjects(): Promise<Project[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    return result.rows.map((row: any) => {
      // Handle tags - could be JSONB, string, or null
      let tags = [];
      if (row.tags) {
        try {
          tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
        } catch (e) {
          console.error('Error parsing tags:', e);
          tags = [];
        }
      }

      // Handle links - could be JSONB, string, or null
      let links = {};
      if (row.links) {
        try {
          links = typeof row.links === 'string' ? JSON.parse(row.links) : row.links;
        } catch (e) {
          console.error('Error parsing links:', e);
          links = {};
        }
      }

      return {
        id: row.id,
        slug: row.slug,
        type: row.type,
        name: row.name,
        description: row.description,
        avatar: row.avatar,
        featuredImage: row.featured_image,
        tags,
        category: row.category,
        needs: row.needs,
        links,
        email: row.email,
        claimed: Boolean(row.claimed),
        claimToken: row.claim_token,
        date: row.date,
        likes: row.likes || 0,
        allowContact: Boolean(row.allow_contact ?? true),
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

async function getProject(slug: string): Promise<{ project: Project; number: number } | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: projects[index], number: index + 1 };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: 'Project not found' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8888';

  return {
    title: `${data.project.name} | 100builds`,
    description: data.project.description,
    icons: {
      icon: `${baseUrl}/favicon?slug=${slug}`,
    },
  };
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) {
    notFound();
  }

  const { project, number } = data;
  const projects = await getProjects();

  // Generate initials from name if no avatar
  const initials = project.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Link labels mapping
  const linkLabels: Record<string, string> = {
    site: 'Website',
    github: 'GitHub',
    threads: 'Threads',
    twitter: 'X / Twitter',
    linkedin: 'LinkedIn',
    dribbble: 'Dribbble',
    behance: 'Behance',
    instagram: 'Instagram',
    indiehackers: 'Indie Hackers',
    producthunt: 'Product Hunt',
    reddit: 'Reddit',
    youtube: 'YouTube',
    blog: 'Blog',
    discord: 'Discord',
  };

  // Get all filled links except site (site is shown prominently)
  const otherLinks = project.links ? Object.entries(project.links)
    .filter(([key, value]) => value && key !== 'site')
    .map(([key, value]) => ({ label: linkLabels[key], url: value })) : [];

  return (
    <BuildPageClient
      projectSlug={slug}
      projectNumber={number}
      isClaimed={project.claimed || false}
      projectName={project.name}
      allowContact={project.allowContact}
    >
      <BuildPageContent
        project={project}
        projectNumber={number}
        projectCount={projects.length}
        initials={initials}
        otherLinks={otherLinks}
      />
    </BuildPageClient>
  );
}
