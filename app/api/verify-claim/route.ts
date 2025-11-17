import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ServerClient } from 'postmark';

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

    const project = result.rows[0];

    // Mark as claimed
    await pool.query(
      'UPDATE projects SET claimed = TRUE, claim_token = NULL WHERE slug = $1',
      [slug]
    );

    // Send admin notification email for activation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8888';
    const buildUrl = `${baseUrl}/build/${slug}`;
    const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@100builds.com';

    try {
      // Parse tags
      let tags = [];
      if (project.tags) {
        try {
          tags = typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags;
        } catch (e) {
          tags = [];
        }
      }

      await client.sendEmail({
        From: 'noreply@100builds.com',
        To: adminEmail,
        Subject: '100builds - New listing activated',
        HtmlBody: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #667eea; margin-bottom: 20px;">Listing Activated</h2>

              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${project.name}</p>
                <p style="margin: 0 0 10px 0;"><strong>Slug:</strong> ${project.slug}</p>
                <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${project.type}</p>
                <p style="margin: 0 0 10px 0;"><strong>Description:</strong><br>${project.description}</p>
                <p style="margin: 0 0 10px 0;"><strong>Tags:</strong> ${tags.join(', ') || 'None'}</p>
                <p style="margin: 0 0 20px 0;"><strong>Link:</strong> <a href="${buildUrl}" style="color: #667eea;">${buildUrl}</a></p>
              </div>

              <p style="color: #6b7280; font-size: 14px;">
                This listing is now active and claimed by the owner.
              </p>
            </body>
          </html>
        `,
        TextBody: `
Listing Activated

Name: ${project.name}
Slug: ${project.slug}
Type: ${project.type}
Description: ${project.description}
Tags: ${tags.join(', ') || 'None'}
Link: ${buildUrl}

This listing is now active and claimed by the owner.
        `,
        MessageStream: 'outbound',
      });
      console.log('✅ Admin notification sent for listing activation');
    } catch (emailError) {
      console.error('Failed to send admin activation notification:', emailError);
      // Don't fail the request if email fails
    }

    // Redirect to build page with success message
    return NextResponse.redirect(new URL(`/build/${slug}?claimed=true`, request.url));
  } catch (error) {
    console.error('Verify claim error:', error);
    return NextResponse.redirect(new URL('/?error=verification-failed', request.url));
  }
}
