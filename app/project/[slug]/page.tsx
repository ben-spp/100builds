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

export function generateMetadata({ params }: { params: { slug: string } }) {
  const data = getProject(params.slug);
  if (!data) return { title: 'Project not found' };

  return {
    title: `${data.project.name} | 100builds`,
    description: data.project.description,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const data = getProject(params.slug);

  if (!data) {
    notFound();
  }

  const { project, number } = data;

  // Generate initials from name if no avatar
  const initials = project.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      <Header />
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

        {/* Project Card */}
        <div className="bg-surface-1 border border-border rounded-3xl p-8 lg:p-12 shadow-xl space-y-8">
          {/* Header */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-4 border-primary/20">
              {project.avatar ? (
                <img
                  src={project.avatar}
                  alt={project.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl lg:text-5xl font-bold text-primary">{initials}</span>
              )}
            </div>

            {/* Title & Badges */}
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-text-primary leading-tight">
                {project.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant={project.type === 'show' ? 'primary' : 'secondary'}>
                  {project.type === 'show' ? 'Visibility' : 'Need Help'}
                </Badge>
                {project.category && <Badge>{project.category}</Badge>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none">
            <p className="text-text-secondary text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* Need Help With */}
          {project.type === 'help' && project.needs && (
            <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-2xl">
              <div className="text-sm font-semibold text-text-secondary mb-2">Need help with:</div>
              <div className="text-xl text-secondary font-bold">{project.needs}</div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-surface-2 text-text-secondary rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {(project.links?.site || project.links?.github || project.links?.twitter) && (
            <div className="pt-6 border-t border-border space-y-3">
              <div className="text-sm font-semibold text-text-secondary mb-4">Links</div>
              <div className="flex flex-wrap gap-3">
                {project.links.site && (
                  <a
                    href={project.links.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    Visit Website
                  </a>
                )}
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-2 hover:bg-border text-text-primary font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.links.twitter && (
                  <a
                    href={project.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-2 hover:bg-border text-text-primary font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Build <span className="font-bold text-primary">#{number}</span> on 100builds
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-border text-text-primary text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Stage indicator */}
        {number < 100 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              Stage 2 unlocks in <span className="font-bold text-primary">{100 - number}</span> more
              builds
            </p>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
