import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import BuildPageClient from '@/components/BuildPageClient';
import { Project } from '@/types/project';
import pool from '@/lib/db';

async function getProjects(): Promise<Project[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      type: row.type,
      name: row.name,
      description: row.description,
      avatar: row.avatar,
      featuredImage: row.featured_image,
      tags: row.tags ? JSON.parse(row.tags) : [],
      category: row.category,
      needs: row.needs,
      links: row.links ? JSON.parse(row.links) : {},
      email: row.email,
      claimed: Boolean(row.claimed),
      claimToken: row.claim_token,
      date: row.date,
    }));
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

  return {
    title: `${data.project.name} | 100builds`,
    description: data.project.description,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
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
    >
      <Header projectCount={projects.length} />
      <main className="min-h-screen bg-surface-0 py-16 px-4 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header Section - Two Columns */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8 mb-12">
            {/* Left Column: Avatar, Name, Tags + Mobile Buttons */}
            <div className="flex-1 flex items-center gap-4 lg:gap-6">
              {/* Favicon Circle */}
              <div className="w-20 h-20 rounded-full bg-surface-1 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                {project.avatar ? (
                  <img
                    src={project.avatar}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>

              {/* Name & Tags */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-text-primary leading-tight break-words">
                    {project.name}
                  </h1>

                  {/* Mobile Action Buttons */}
                  <div className="flex lg:hidden gap-2 flex-shrink-0 ml-auto">
                    {/* Like Button */}
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border border-border hover:bg-surface-1 text-text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Get in Touch Button */}
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-text-primary hover:bg-text-secondary text-surface-0 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-surface-1 border border-border text-text-secondary rounded-lg text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex gap-3">
              {/* Like Button */}
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-border hover:bg-surface-1 text-text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.0 0 00-6.364 0z" />
                </svg>
                <span>0</span>
              </button>

              {/* Get in Touch Button */}
              <button className="px-6 py-3 rounded-xl bg-text-primary hover:bg-text-secondary text-surface-0 font-semibold transition-colors">
                Get in touch
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {project.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden bg-surface-1 border border-border">
              <img
                src={project.featuredImage}
                alt={project.name}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-16">
            <div className="max-w-[767px]">
              <p className="text-[20px] leading-[32px] text-text-primary">
                {project.description}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border mb-12"></div>

          {/* Additional Links */}
          {otherLinks.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-6">Links</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {otherLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-surface-1 border border-border hover:bg-surface-2 text-text-primary rounded-xl transition-colors text-sm font-medium"
                  >
                    <span>{link.label}</span>
                    <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </BuildPageClient>
  );
}
