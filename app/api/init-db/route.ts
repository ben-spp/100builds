import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type ENUM('show', 'help') NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        avatar VARCHAR(500),
        featured_image VARCHAR(500),
        tags JSON,
        category VARCHAR(100),
        needs TEXT,
        links JSON,
        email VARCHAR(255),
        claimed BOOLEAN DEFAULT FALSE,
        claim_token VARCHAR(64),
        date DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_type (type),
        INDEX idx_claimed (claimed)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
