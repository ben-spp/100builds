import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Project } from '@/types/project';

const PROJECTS_KEY = 'projects';

export async function POST(request: NextRequest) {
  try {
    const project: Project = await request.json();

    // Get existing projects from KV
    const projects: Project[] = (await kv.get(PROJECTS_KEY)) || [];

    // Add new project
    projects.push(project);

    // Save back to KV
    await kv.set(PROJECTS_KEY, projects);

    return NextResponse.json({
      success: true,
      projectNumber: projects.length,
    });
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save project' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects: Project[] = (await kv.get(PROJECTS_KEY)) || [];

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read projects' },
      { status: 500 }
    );
  }
}
