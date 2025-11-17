import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  // Security: Require authentication via secret token
  const authToken = request.headers.get('x-init-token');
  const expectedToken = process.env.DB_INIT_TOKEN;

  // Reject if token is not configured or doesn't match
  if (!expectedToken || authToken !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Only allow in development or with explicit token
  if (process.env.NODE_ENV === 'production' && !expectedToken) {
    return NextResponse.json(
      { error: 'Database initialization is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(10) CHECK (type IN ('show', 'help')) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        avatar VARCHAR(500),
        featured_image VARCHAR(500),
        tags JSONB,
        category VARCHAR(100),
        needs TEXT,
        links JSONB,
        email VARCHAR(255),
        claimed BOOLEAN DEFAULT FALSE,
        claim_token VARCHAR(64),
        date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_slug ON projects(slug);
      CREATE INDEX IF NOT EXISTS idx_type ON projects(type);
      CREATE INDEX IF NOT EXISTS idx_claimed ON projects(claimed);
    `;

    await pool.query(createTableSQL);

    return NextResponse.json({
      success: true,
      message: 'Database table created successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
