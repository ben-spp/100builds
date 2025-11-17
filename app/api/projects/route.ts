import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Project } from '@/types/project';
import { ServerClient } from 'postmark';

export async function POST(request: NextRequest) {
  try {
    const project: Project = await request.json();

    // Insert project into database
    await pool.query(
      `INSERT INTO projects (
        id, slug, type, name, description, avatar, featured_image,
        tags, category, needs, links, email, claimed, claim_token, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        project.id,
        project.slug,
        project.type,
        project.name,
        project.description,
        project.avatar || null,
        project.featuredImage || null,
        JSON.stringify(project.tags || []),
        project.category || null,
        project.needs || null,
        JSON.stringify(project.links || {}),
        project.email || null,
        project.claimed || false,
        project.claimToken || null,
        project.date,
      ]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM projects'
    );
    const projectNumber = parseInt(countResult.rows[0].count);

    // Send admin notification email
    const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');
    try {
      await client.sendEmail({
        From: 'noreply@100builds.com',
        To: 'admin@100builds.com',
        Subject: '100builds - New listing created',
        HtmlBody: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #667eea; margin-bottom: 20px;">New Listing Created</h2>

              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${project.name}</p>
                <p style="margin: 0 0 10px 0;"><strong>Slug:</strong> ${project.slug}</p>
                <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${project.type}</p>
                <p style="margin: 0 0 10px 0;"><strong>Description:</strong><br>${project.description}</p>
                <p style="margin: 0 0 10px 0;"><strong>Tags:</strong> ${project.tags?.join(', ') || 'None'}</p>
                <p style="margin: 0;"><strong>Project #:</strong> ${projectNumber}</p>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This listing has not been claimed yet. It will appear on the site but won't be editable until claimed.
              </p>
            </body>
          </html>
        `,
        TextBody: `
New Listing Created

Name: ${project.name}
Slug: ${project.slug}
Type: ${project.type}
Description: ${project.description}
Tags: ${project.tags?.join(', ') || 'None'}
Project #: ${projectNumber}

This listing has not been claimed yet. It will appear on the site but won't be editable until claimed.
        `,
        MessageStream: 'outbound',
      });
      console.log('✅ Admin notification sent for new listing');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      projectNumber,
    });
  } catch (error) {
    console.error('Error saving project:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save project',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    // Parse JSON fields
    const projects: Project[] = result.rows.map((row: any) => {
      // Handle tags - could be JSONB, string, or null
      let tags = [];
      if (row.tags) {
        try {
          tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
        } catch (e) {
          console.error('Error parsing tags:', e);
          tags = [];
        }
      }

      // Handle links - could be JSONB, string, or null
      let links = {};
      if (row.links) {
        try {
          links = typeof row.links === 'string' ? JSON.parse(row.links) : row.links;
        } catch (e) {
          console.error('Error parsing links:', e);
          links = {};
        }
      }

      return {
        id: row.id,
        slug: row.slug,
        type: row.type,
        name: row.name,
        description: row.description,
        avatar: row.avatar,
        featuredImage: row.featured_image,
        tags,
        category: row.category,
        needs: row.needs,
        links,
        email: row.email,
        claimed: Boolean(row.claimed),
        claimToken: row.claim_token,
        date: row.date,
      };
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read projects' },
      { status: 500 }
    );
  }
}
