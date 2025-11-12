import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;

    if (!file || !slug) {
      return NextResponse.json(
        { error: 'File and slug are required' },
        { status: 400 }
      );
    }

    // Create project directory if it doesn't exist
    const projectDir = path.join(process.cwd(), 'public', 'projects', slug);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Get file extension
    const ext = file.name.split('.').pop();
    const filename = `avatar.${ext}`;
    const filepath = path.join(projectDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Return public URL
    const publicUrl = `/projects/${slug}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
