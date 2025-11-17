import Badge from './Badge';
import { Project, ProjectType } from '@/types/project';

interface CardPreviewProps {
  name: string;
  description: string;
  avatar?: string;
  tags: string[];
  category?: string;
  type: ProjectType;
  needs?: string;
  links?: {
    site?: string;
    github?: string;
    threads?: string;
    twitter?: string;
    linkedin?: string;
    dribbble?: string;
    behance?: string;
    instagram?: string;
    indiehackers?: string;
    producthunt?: string;
    reddit?: string;
    youtube?: string;
    blog?: string;
    discord?: string;
  };
}

export default function CardPreview({
  name,
  description,
  avatar,
  tags,
  category,
  type,
  needs,
  links,
}: CardPreviewProps) {
  // Generate initials from name if no avatar
  const initials = name
    .split(' ')
    .map(word => word[0])
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

  // Get all filled links except site (site is shown at top)
  const otherLinks = links ? Object.entries(links)
    .filter(([key, value]) => value && key !== 'site')
    .map(([key, value]) => ({ label: linkLabels[key], url: value })) : [];

  return (
    <div className="w-full bg-surface-1 border border-border rounded-2xl p-6 space-y-4">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-surface-1 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary">{initials || '?'}</span>
          )}
        </div>

        {/* Name & Tags */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-text-primary leading-tight break-words">
              {name || 'Project Name'}
            </h3>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {/* Like Button */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border border-border text-text-primary pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>

              {/* Contact Button */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-text-primary text-surface-0 pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
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

      {/* Description */}
      <div>
        <p className="text-base leading-relaxed text-text-primary">
          {description || 'Add a description to see the preview...'}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border"></div>

      {/* Additional Links */}
      {otherLinks.length > 0 && (
        <div>
          <h4 className="text-base font-semibold text-text-primary mb-4">Links</h4>
          <div className="grid grid-cols-2 gap-3">
            {otherLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-surface-1 border border-border text-text-primary rounded-xl text-xs font-medium"
              >
                <span className="truncate">{link.label}</span>
                <svg className="w-3 h-3 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
