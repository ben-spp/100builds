import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  sticky?: boolean;
}

export default function Header({ sticky = true }: HeaderProps) {
  return (
    <header className={`${sticky ? 'fixed' : 'relative'} top-0 left-0 right-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-text-primary hover:text-primary transition-colors">
          100builds
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
