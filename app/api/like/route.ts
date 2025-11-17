import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Check if project exists
    const projectResult = await pool.query(
      'SELECT slug, likes FROM projects WHERE slug = $1',
      [slug]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked
    const likeCheck = await pool.query(
      'SELECT * FROM project_likes WHERE project_slug = $1 AND ip_address = $2',
      [slug, ip]
    );

    if (likeCheck.rows.length > 0) {
      // Unlike - remove the like
      await pool.query(
        'DELETE FROM project_likes WHERE project_slug = $1 AND ip_address = $2',
        [slug, ip]
      );

      // Decrement likes count
      await pool.query(
        'UPDATE projects SET likes = GREATEST(likes - 1, 0) WHERE slug = $1',
        [slug]
      );

      // Get updated count
      const updated = await pool.query(
        'SELECT likes FROM projects WHERE slug = $1',
        [slug]
      );

      return NextResponse.json({
        liked: false,
        likes: updated.rows[0].likes,
      });
    } else {
      // Like - add the like
      await pool.query(
        'INSERT INTO project_likes (project_slug, ip_address) VALUES ($1, $2)',
        [slug, ip]
      );

      // Increment likes count
      await pool.query(
        'UPDATE projects SET likes = likes + 1 WHERE slug = $1',
        [slug]
      );

      // Get updated count
      const updated = await pool.query(
        'SELECT likes FROM projects WHERE slug = $1',
        [slug]
      );

      return NextResponse.json({
        liked: true,
        likes: updated.rows[0].likes,
      });
    }
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Check if user has liked
    const likeCheck = await pool.query(
      'SELECT * FROM project_likes WHERE project_slug = $1 AND ip_address = $2',
      [slug, ip]
    );

    // Get total likes
    const projectResult = await pool.query(
      'SELECT likes FROM projects WHERE slug = $1',
      [slug]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      liked: likeCheck.rows.length > 0,
      likes: projectResult.rows[0].likes || 0,
    });
  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
