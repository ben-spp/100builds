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
    <div className="w-full bg-surface-1 border border-border rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">{initials || '?'}</span>
          )}
        </div>

        {/* Title & Badges */}
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl font-bold text-text-primary">
            {name || 'Project Name'}
          </h3>

          {/* Website link (if provided) */}
          {links?.site && (
            <a
              href={links.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
            >
              <span>{new URL(links.site).hostname}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant={type === 'show' ? 'primary' : 'secondary'}>
              {type === 'show' ? 'Visibility' : 'Need Help'}
            </Badge>
            {category && <Badge>{category}</Badge>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-text-secondary leading-relaxed">
        {description || 'Add a description to see the preview...'}
      </p>

      {/* Other Links */}
      {otherLinks.length > 0 && (
        <>
          <div className="border-t border-border"></div>
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-secondary">Connect with me</h4>
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
        </>
      )}

      {/* Need Help With */}
      {type === 'help' && needs && (
        <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
          <div className="text-sm font-semibold text-text-secondary mb-1">Need help with:</div>
          <div className="text-secondary font-medium">{needs}</div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-surface-2 text-text-secondary rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
