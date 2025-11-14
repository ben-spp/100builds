import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

    // Check if slug exists in database
    const result = await pool.query(
      'SELECT slug FROM projects WHERE slug = $1',
      [slug]
    );

    return NextResponse.json({
      available: result.rows.length === 0,
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
