import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Project } from '@/types/project';

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
