import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    if (!token || !slug) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Read projects
    const filePath = path.join(process.cwd(), 'data', 'projects.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(fileContents);

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

    // Save projects
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));

    // Redirect to build page with success message
    return NextResponse.redirect(new URL(`/build/${slug}?claimed=true`, request.url));
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}
