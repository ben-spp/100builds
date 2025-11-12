import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { Project } from '@/types/project';

function getProjects(): Project[] {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function getProject(slug: string): { project: Project; number: number } | null {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: projects[index], number: index + 1 };
}

export function generateStaticParams() {
  const projects = getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getProject(slug);
  if (!data) return { title: 'Project not found' };

  return {
    title: `${data.project.name} | 100builds`,
    description: data.project.description,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getProject(slug);

  if (!data) {
    notFound();
  }

  const { project, number } = data;
  const projects = getProjects();

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
    <>
      <Header projectCount={projects.length} />
      <main className="min-h-screen bg-gradient-to-b from-surface-0 to-surface-1 py-16 px-4 pt-24">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Build Card */}
        <div className="bg-surface-1 border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="p-8 lg:p-12">
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar */}
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                {project.avatar ? (
                  <img
                    src={project.avatar}
                    alt={project.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-3xl lg:text-4xl font-bold text-primary">{initials}</span>
                )}
              </div>

              {/* Title Section */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="mb-1">
                  <span className="inline-block px-2.5 py-0.5 bg-surface-2 text-text-muted text-xs font-semibold rounded-full">
                    Build #{number}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-text-primary mb-2 leading-tight break-words">
                  {project.name}
                </h1>

                {/* Website link */}
                {project.links?.site && (() => {
                  try {
                    const hostname = new URL(project.links.site).hostname;
                    return (
                      <a
                        href={project.links.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors mb-2"
                      >
                        <span>{hostname}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  } catch {
                    return (
                      <a
                        href={project.links.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors mb-2"
                      >
                        <span>{project.links.site}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  }
                })()}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant={project.type === 'show' ? 'primary' : 'secondary'}>
                    {project.type === 'show' ? 'Visibility' : 'Need Help'}
                  </Badge>
                  {project.category && <Badge>{project.category}</Badge>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-text-secondary mb-3">About {project.name}</h2>
              <p className="text-text-secondary text-base leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Need Help With */}
            {project.type === 'help' && project.needs && (
              <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-xl mb-8">
                <div className="text-sm font-semibold text-text-secondary mb-2">Need help with</div>
                <div className="text-lg text-secondary font-bold">{project.needs}</div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-2">
                <h2 className="text-sm font-bold text-text-secondary mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-surface-2 text-text-secondary rounded-lg text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Other Links */}
            {otherLinks.length > 0 && (
              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-bold text-text-secondary mb-4">Connect</h4>
                <div className="flex flex-wrap gap-3">
                  {otherLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      <span>{link.label}</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 lg:px-12 py-6 bg-surface-2/50 border-t border-border flex items-center justify-between">
            <div className="text-sm text-text-muted">
              <span className="font-semibold text-text-primary">100builds</span> • Build #{number}
            </div>
          </div>
        </div>

      </div>
    </main>
    </>
  );
}
