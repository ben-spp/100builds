import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Project } from '@/types/project';

export async function POST(request: NextRequest) {
  try {
    const project: Project = await request.json();

    // Save to main projects index
    const filePath = path.join(process.cwd(), 'data', 'projects.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const projects: Project[] = JSON.parse(fileContents);

    // Add new project
    projects.push(project);

    // Write back to main index
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));

    // Also save to individual project folder
    const projectDir = path.join(process.cwd(), 'public', 'projects', project.slug);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    const projectFilePath = path.join(projectDir, 'project.json');
    fs.writeFileSync(projectFilePath, JSON.stringify(project, null, 2));

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
    const filePath = path.join(process.cwd(), 'data', 'projects.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const projects: Project[] = JSON.parse(fileContents);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read projects' },
      { status: 500 }
    );
  }
}
