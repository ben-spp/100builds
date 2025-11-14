import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Project } from '@/types/project';

const PROJECTS_KEY = 'projects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    if (!token || !slug) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Get projects from KV
    const projects: Project[] = (await kv.get(PROJECTS_KEY)) || [];

    // Find project with matching token
    const projectIndex = projects.findIndex(
      (p: any) => p.slug === slug && p.claimToken === token
    );

    if (projectIndex === -1) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Mark as claimed
    projects[projectIndex].claimed = true;
    projects[projectIndex].claimToken = undefined; // Remove token after verification

    // Save projects to KV
    await kv.set(PROJECTS_KEY, projects);

    // Redirect to build page with success message
    return NextResponse.redirect(new URL(`/build/${slug}?claimed=true`, request.url));
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}
