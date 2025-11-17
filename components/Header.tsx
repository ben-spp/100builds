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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-6 h-7 text-text-primary" viewBox="0 0 78 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 62.86V22.65C0 21.94 0.38 21.3 0.98 20.96L35.89 0.83C37.81 -0.28 40.19 -0.28 42.11 0.83L77.02 20.96C77.62 21.3 78 21.94 78 22.65V62.86C78 65.11 76.8 67.18 74.85 68.3L42.14 87.16C40.2 88.28 37.8 88.28 35.86 87.16C35.86 87.16 19.5 77.73 19.49 77.72L3.15 68.3C1.2 67.18 0 65.11 0 62.86ZM3.92 26.04V42.92L18.52 51.35V34.46L3.92 26.04ZM74.08 26.04L59.48 34.46V51.35L74.08 42.92V26.04ZM57.43 31.12L72.13 22.65L57.6 14.28L42.91 22.75L57.43 31.12ZM53.69 12.02L40.15 4.22C39.44 3.81 38.56 3.81 37.85 4.22L24.31 12.02L39 20.49L53.69 12.02ZM20.4 14.28L5.87 22.65L20.57 31.12L35.09 22.75L20.4 14.28ZM59.48 72.65L72.9 64.91C73.63 64.49 74.08 63.71 74.08 62.86V47.44L59.48 55.86L59.48 72.65ZM22.44 74.91L37.04 83.33V66.54L22.44 58.12V74.91ZM40.96 83.33L55.56 74.91V58.12L40.96 66.54V83.33ZM3.92 47.44V62.86C3.92 63.71 4.37 64.49 5.1 64.91L18.52 72.65V55.86L3.92 47.44ZM22.44 36.71V53.6L37.04 62.02V44.99C36.64 44.85 36.26 44.68 35.89 44.47L22.44 36.71ZM55.56 53.6V36.71L42.11 44.47C41.74 44.68 41.36 44.85 40.96 44.99V62.02L55.56 53.6ZM24.48 33.38L37.85 41.08C38.56 41.49 39.44 41.49 40.16 41.08L53.52 33.38L39 25.01L24.48 33.38Z" fill="currentColor"/>
          </svg>
          <span className="text-xl font-semibold text-text-primary">100builds</span>
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
