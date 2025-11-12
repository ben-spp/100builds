import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  sticky?: boolean;
  projectCount?: number;
}

export default function Header({ sticky = true, projectCount }: HeaderProps) {
  return (
    <header className={`${sticky ? 'fixed' : 'relative'} top-0 left-0 right-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black text-text-primary hover:text-primary transition-colors">
          100builds
        </Link>

        {projectCount !== undefined && projectCount < 100 && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted absolute left-1/2 -translate-x-1/2">
            <span>Stage 2 in</span>
            <span className="font-bold text-primary">{100 - projectCount}</span>
            <span>builds</span>
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
