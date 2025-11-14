import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    if (!token || !slug) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Find project with matching token
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE slug = ? AND claim_token = ?',
      [slug, token]
    );

    if (rows.length === 0) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Mark as claimed
    await pool.query(
      'UPDATE projects SET claimed = TRUE, claim_token = NULL WHERE slug = ?',
      [slug]
    );

    // Redirect to build page with success message
    return NextResponse.redirect(new URL(`/build/${slug}?claimed=true`, request.url));
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}
