import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      // Return default favicon or 404
      return new NextResponse(null, { status: 404 });
    }

    // Get project avatar
    const result = await pool.query(
      'SELECT avatar FROM projects WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0 || !result.rows[0].avatar) {
      return new NextResponse(null, { status: 404 });
    }

    const avatarUrl = result.rows[0].avatar;

    // Fetch the image
    const imageResponse = await fetch(avatarUrl);
    if (!imageResponse.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Return the image with cache headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Favicon error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
