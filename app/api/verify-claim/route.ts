import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    if (!token || !slug) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Find project with matching token
    console.log('Looking for project with slug:', slug, 'and token:', token);
    const result = await pool.query(
      'SELECT * FROM projects WHERE slug = $1 AND claim_token = $2',
      [slug, token]
    );

    console.log('Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Found project:', result.rows[0].name);
    }

    if (result.rows.length === 0) {
      console.log('No matching project found - redirecting with error');
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Mark as claimed
    await pool.query(
      'UPDATE projects SET claimed = TRUE, claim_token = NULL WHERE slug = $1',
      [slug]
    );

    // Redirect to build page with success message
    return NextResponse.redirect(new URL(`/build/${slug}?claimed=true`, request.url));
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}
