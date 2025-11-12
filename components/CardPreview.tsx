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
}

export default function CardPreview({
  name,
  description,
  avatar,
  tags,
  category,
  type,
  needs,
}: CardPreviewProps) {
  // Generate initials from name if no avatar
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
