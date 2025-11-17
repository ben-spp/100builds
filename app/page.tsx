import Link from 'next/link';
import Header from '@/components/Header';
import { Project } from '@/types/project';
import pool from '@/lib/db';

async function getProjectCount(): Promise<number> {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM projects');
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error fetching project count:', error);
    return 0;
  }
}

export default async function Home() {
  const projectCount = await getProjectCount();
  const progress = (projectCount / 100) * 100;

  return (
    <>
      <Header />
      <main className="h-screen flex flex-col">
      {/* Progress Counter - Static on mobile, Fixed on desktop */}
      <div className="static lg:fixed top-0 lg:top-8 left-0 lg:left-1/2 lg:-translate-x-1/2 z-50 pt-4 lg:pt-0">
        <div className="bg-surface-1 border border-border rounded-full px-4 py-2 lg:px-6 lg:py-3 shadow-lg mx-auto w-fit">
          <div className="text-center">
            <div className="text-lg lg:text-2xl font-bold text-text-primary">
              {projectCount} <span className="text-text-muted">of</span> 100
            </div>
            <div className="text-xs text-text-muted mt-0.5 lg:mt-1">builds submitted</div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 lg:mt-3 w-32 lg:w-48 h-1 lg:h-1.5 bg-surface-2 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - List for Visibility */}
        <Link
          href="/new?mode=show"
          className="flex-1 relative group overflow-hidden transition-all hover:flex-[1.05]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500" />

          <div className="relative h-full min-h-[50vh] flex items-center justify-center p-8">
            <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-500">
              <div className="text-5xl lg:text-6xl font-black text-text-primary">
                Add your build
              </div>
              <div className="text-xl text-text-secondary max-w-sm mx-auto">
                Share what you're creating with the world
              </div>
              <div className="inline-flex items-center gap-2 text-primary font-semibold">
                <span>List for visibility</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-full lg:w-px h-px lg:h-auto bg-border" />

        {/* Right Side - List for Help */}
        <Link
          href="/new?mode=help"
          className="flex-1 relative group overflow-hidden transition-all hover:flex-[1.05]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 group-hover:from-secondary/30 group-hover:to-secondary/10 transition-all duration-500" />

          <div className="relative h-full min-h-[50vh] flex items-center justify-center p-8">
            <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-500">
              <div className="text-5xl lg:text-6xl font-black text-text-primary">
                Find collaborators
              </div>
              <div className="text-xl text-text-secondary max-w-sm mx-auto">
                Get help to finish what you started
              </div>
              <div className="inline-flex items-center gap-2 text-secondary font-semibold">
                <span>List for help</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </main>
    </>
  );
}
