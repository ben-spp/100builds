import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;
    const type = formData.get('type') as string; // 'featured' or undefined (avatar)

    if (!file || !slug) {
      return NextResponse.json(
        { error: 'File and slug are required' },
        { status: 400 }
      );
    }

    // Get file extension
    const ext = file.name.split('.').pop();
    const filename = type === 'featured' ? `featured.${ext}` : `avatar.${ext}`;
    const pathname = `projects/${slug}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false, // Keep consistent filename for overwrites
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
